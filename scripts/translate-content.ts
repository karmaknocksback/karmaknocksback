/**
 * One-time batch translation: reads every translatable Hindi field across
 * japs, the Jaap Directory, and Knowledge Hub articles, and writes English
 * versions into the corresponding *_en columns using the Google Cloud
 * Translation API (v2/Basic — simple REST, just needs an API key, no
 * service-account JSON required).
 *
 * Deliberately NOT translated, ever, anywhere: mantra/lyrics text,
 * transliteration (phonetic pronunciation guide), and mantra_avahan/
 * mantra_pranam/mantra_siddhi — these are the actual sound/text of the
 * mantra itself, and translating them would misrepresent what a mantra
 * is. This mirrors the existing, already-stated site policy.
 *
 * This is a ONE-TIME batch job, run once (or re-run after adding new
 * content), NOT a runtime/per-visitor API call — so it costs nothing
 * beyond whatever character volume you actually translate, and at this
 * site's content volume (~132K characters total as of this build) it
 * comfortably fits within Google's free tier (500,000 characters/month,
 * permanent, never expires).
 *
 * Idempotent: skips any field that already has English content, so
 * re-running after adding new japs/articles only translates the new
 * material, not everything again.
 *
 * Requires GOOGLE_TRANSLATE_API_KEY in .env.local — see README for the
 * full Google Cloud setup walkthrough (free, ~15-30 min one-time setup).
 *
 * Usage: npm run translate:content
 */
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { dbGet, dbAll, dbRun, ensureDb } from "../src/lib/db";

interface JapRow {
  id: number; title_hi: string; purpose: string; meaning: string; how_to_listen: string | null;
  benefits: string; best_for: string; title_en: string | null; purpose_en: string | null;
  meaning_en: string | null; how_to_listen_en: string | null; benefits_en: string | null; best_for_en: string | null;
}
interface ItemRow {
  id: number; purpose_hi: string | null; why_to_do_hi: string | null; when_to_do_hi: string | null;
  purpose_en: string | null; why_to_do_en: string | null; when_to_do_en: string | null;
}
interface CollectionRow {
  id: number; description_hi: string; description_en: string | null;
}
interface ArticleRow {
  id: number; title: string; excerpt: string; content: string;
  title_en: string | null; excerpt_en: string | null; content_en: string | null;
}


const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
const ENDPOINT = "https://translation.googleapis.com/language/translate/v2";

if (!API_KEY) {
  console.error(
    "GOOGLE_TRANSLATE_API_KEY not set in .env.local. See the README's " +
    "\"English translation\" section for how to get a free Google Cloud " +
    "Translation API key."
  );
  process.exit(1);
}

let totalCharsTranslated = 0;
let totalApiCalls = 0;

/** Translates a batch of strings in one API call (Google's v2 endpoint
 * accepts an array of `q` values, which is far more efficient than one
 * request per string — fewer calls, same character cost). Empty/blank
 * strings are filtered out before sending and re-inserted as empty
 * strings in the result, since the API errors on empty input. */
async function translateBatch(texts: string[]): Promise<string[]> {
  const nonEmpty = texts.map((t, i) => ({ t, i })).filter((x) => x.t && x.t.trim().length > 0);
  if (nonEmpty.length === 0) return texts.map(() => "");

  const params = new URLSearchParams();
  params.set("key", API_KEY!);
  params.set("source", "hi");
  params.set("target", "en");
  params.set("format", "text");
  for (const { t } of nonEmpty) params.append("q", t);

  const res = await fetch(`${ENDPOINT}?${params.toString()}`, { method: "POST" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Translation API error ${res.status}: ${body}`);
  }
  const data = await res.json();
  totalApiCalls++;
  totalCharsTranslated += nonEmpty.reduce((sum, x) => sum + x.t.length, 0);

  const translated: string[] = data.data.translations.map((t: { translatedText: string }) => t.translatedText);

  const result = texts.map(() => "");
  nonEmpty.forEach((x, idx) => { result[x.i] = translated[idx]; });
  return result;
}

/** Translates a JSON-encoded array of Hindi strings (used for fields like
 * `benefits`/`best_for` which are stored as JSON arrays), preserving the
 * array structure in the output. */
async function translateJsonArray(jsonStr: string): Promise<string> {
  let arr: string[];
  try {
    arr = JSON.parse(jsonStr || "[]");
  } catch {
    return "[]";
  }
  if (!Array.isArray(arr) || arr.length === 0) return "[]";
  const translated = await translateBatch(arr);
  return JSON.stringify(translated);
}

async function translateJaps() {
  await ensureDb();
  const rows = await dbAll<JapRow>(
      `SELECT id, title_hi, purpose, meaning, how_to_listen, benefits, best_for,
              title_en, purpose_en, meaning_en, how_to_listen_en, benefits_en, best_for_en
       FROM japs`
    );

  let count = 0;
  for (const row of rows) {
    const needsTranslation = !row.purpose_en || !row.meaning_en || !row.title_en;
    if (!needsTranslation) continue;

    const [titleEn, purposeEn, meaningEn, howToListenEn, benefitsEn, bestForEn] = await Promise.all([
      translateBatch([row.title_hi || ""]).then((r) => r[0]),
      translateBatch([row.purpose || ""]).then((r) => r[0]),
      translateBatch([row.meaning || ""]).then((r) => r[0]),
      translateBatch([row.how_to_listen || ""]).then((r) => r[0]),
      translateJsonArray(row.benefits),
      translateJsonArray(row.best_for),
    ]);

    await dbRun(`UPDATE japs SET title_en = ?, purpose_en = ?, meaning_en = ?, how_to_listen_en = ?, benefits_en = ?, best_for_en = ? WHERE id = ?`, [titleEn, purposeEn, meaningEn, howToListenEn, benefitsEn, bestForEn, row.id]);
    count++;
  }
  console.log(`Japs: translated ${count}/${rows.length} (rest already had English content).`);
}

async function translateJapCollectionItems() {
  await ensureDb();
  const rows = await dbAll<ItemRow>(
      `SELECT id, purpose_hi, why_to_do_hi, when_to_do_hi, purpose_en, why_to_do_en, when_to_do_en
       FROM jap_collection_items`
    );

  let count = 0;
  for (const row of rows) {
    const hasContent = row.purpose_hi || row.why_to_do_hi || row.when_to_do_hi;
    const needsTranslation = hasContent && !row.purpose_en && !row.why_to_do_en;
    if (!needsTranslation) continue;

    const [purposeEn, whyEn, whenEn] = await Promise.all([
      translateBatch([row.purpose_hi || ""]).then((r) => r[0]),
      translateBatch([row.why_to_do_hi || ""]).then((r) => r[0]),
      translateBatch([row.when_to_do_hi || ""]).then((r) => r[0]),
    ]);

    await dbRun(`UPDATE jap_collection_items SET purpose_en = ?, why_to_do_en = ?, when_to_do_en = ? WHERE id = ?`, [purposeEn, whyEn, whenEn, row.id]);
    count++;
  }
  console.log(`Jaap Directory items: translated ${count}/${rows.length} (rest already had English content or no content to translate).`);
}

async function translateJapCollections() {
  await ensureDb();
  const rows = await dbAll<CollectionRow>(`SELECT id, description_hi, description_en FROM jap_collections`);
  let count = 0;
  for (const row of rows) {
    if (row.description_en) continue;
    const [descEn] = await translateBatch([row.description_hi || ""]);
    await dbRun(`UPDATE jap_collections SET description_en = ? WHERE id = ?`, [descEn, row.id]);
    count++;
  }
  console.log(`Jaap Directory collections: translated ${count}/${rows.length}.`);
}

async function translateArticles() {
  await ensureDb();
  const rows = await dbAll<ArticleRow>(
    `SELECT id, title, excerpt, content, title_en, excerpt_en, content_en FROM articles`
  );

  let count = 0;
  for (const row of rows) {
    if (row.title_en && row.excerpt_en && row.content_en) continue;

    const [titleEn, excerptEn, contentEn] = await Promise.all([
      translateBatch([row.title || ""]).then((r) => r[0]),
      translateBatch([row.excerpt || ""]).then((r) => r[0]),
      translateBatch([row.content || ""]).then((r) => r[0]),
    ]);

    await dbRun(`UPDATE articles SET title_en = ?, excerpt_en = ?, content_en = ? WHERE id = ?`, [titleEn, excerptEn, contentEn, row.id]);
    count++;
  }
  console.log(`Articles: translated ${count}/${rows.length}.`);
}

async function run() {
  console.log("Starting translation pass (Hindi -> English, Google Cloud Translation API v2)...\n");
  await translateJaps();
  await translateJapCollections();
  await translateJapCollectionItems();
  await translateArticles();
  console.log(`\nDone. ${totalApiCalls} API calls, ~${totalCharsTranslated.toLocaleString()} characters translated this run.`);
  console.log("Re-run this script any time after adding new content — already-translated fields are skipped.");
}

run().catch((err) => {
  console.error("Translation run failed:", err);
  process.exit(1);
});
