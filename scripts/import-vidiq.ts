/**
 * Import script — populates the Jap Library from a real vidIQ CSV export of
 * the KarmaKnocksBack YouTube channel.
 *
 * Usage:
 *   npm run import:vidiq
 *
 * This REPLACES whatever is currently in the japs table with the videos
 * found in scripts/data/vidiq-export.csv (only rows with STATUS=Public are
 * imported — Private/Unlisted videos are skipped). Run `npm run seed` first
 * if you haven't already, to set up the admin user / articles / testimonials.
 *
 * To re-run with an updated export, just overwrite
 * scripts/data/vidiq-export.csv with a fresh download from vidIQ and run
 * this again.
 */
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import fs from "fs";
import { parse } from "csv-parse/sync";
import { ensureDb } from "../src/lib/db";
import { createJap } from "../src/lib/repo/japs";
import { slugify } from "../src/lib/utils";
import { JAP_CATEGORIES, PLANETS } from "../src/lib/constants";

const CSV_PATH = path.resolve(process.cwd(), "scripts/data/vidiq-export.csv");

interface CsvRow {
  ID: string;
  TITLE: string;
  DESCRIPTION: string;
  DURATION: string;
  STATUS: string;
  "DATE PUBLISHED": string;
  KEYWORDS: string;
  VIEWS: string;
  [key: string]: string;
}

type JapCategory = (typeof JAP_CATEGORIES)[number];
type Planet = (typeof PLANETS)[number];

const TIRTHANKAR_NAMES = [
  "तीर्थंकर", "tirthankar", "महावीर", "mahavir", "आदिनाथ", "adinath",
  "पार्श्वनाथ", "parshvanath", "ऋषभ", "rishabh", "शांतिनाथ", "shantinath",
  "नेमिनाथ", "neminath", "चंद्रप्रभ", "मुनिसुव्रत", "अजितनाथ", "संभवनाथ",
  "अभिनंदन", "सुमतिनाथ", "पद्मप्रभ", "सुपार्श्वनाथ", "विमलनाथ",
  "अनंतनाथ", "धर्मनाथ", "शीतलनाथ", "श्रेयांसनाथ", "वासुपूज्य",
  "अरनाथ", "मल्लिनाथ", "कुंथुनाथ",
];

const CATEGORY_KEYWORDS: { category: JapCategory; keywords: string[] }[] = [
  {
    category: "Navgrah",
    keywords: ["नवग्रह", "ग्रह दोष", "ग्रह बाधा", "navgrah", "graha dosh", "शनि", "shani", "राहु", "rahu", "केतु", "ketu", "मंगल ग्रह", "shukr grah"],
  },
  {
    category: "Healing",
    keywords: ["रोग", "स्वास्थ्य", "health", "healing", "बीमारी", "उपचार"],
  },
  {
    category: "Protection",
    keywords: ["रक्षा", "सुरक्षा", "protection", "कवच", "negative energy", "नकारात्मक ऊर्जा"],
  },
  {
    category: "Bhajan",
    keywords: ["भजन", "bhajan", "stavan", "स्तवन", "स्तुति", "stuti", "गीत", "song"],
  },
  {
    category: "Katha",
    keywords: ["कथा", "katha", "story", "कहानी"],
  },
  {
    category: "Philosophy",
    keywords: ["तत्त्व", "द्रव्य", "समुद्घात", "जैन दर्शन", "दर्शन का सबसे", "सिद्धांत", "philosophy", "रहस्य", "मोक्षमार्ग", "अनेकांतवाद"],
  },
  // Explicit mantra/jaap markers come before the Tirthankar-name fallback
  // below: "श्री शांतिनाथ मंत्र जाप" names a Tirthankar but is fundamentally
  // a chant, so it should land in Mantra, not Tirthankar.
  {
    category: "Mantra",
    keywords: ["मंत्र", "mantra", "जाप", "jaap", "जप", "japa"],
  },
  // Broadest, lowest-priority match: catches genuine biography/aarti/life-
  // story content that names a Tirthankar without any of the more specific
  // signals above.
  { category: "Tirthankar", keywords: TIRTHANKAR_NAMES },
];

const PLANET_KEYWORDS: { planet: Planet; keywords: string[] }[] = [
  { planet: "Saturn", keywords: ["शनि", "shani"] },
  { planet: "Rahu", keywords: ["राहु", "rahu"] },
  { planet: "Ketu", keywords: ["केतु", "ketu"] },
  { planet: "Mars", keywords: ["मंगल", "mangal"] },
  { planet: "Mercury", keywords: ["बुध", "budh"] },
  { planet: "Jupiter", keywords: ["गुरु ग्रह", "guru grah", "brihaspati", "बृहस्पति"] },
  { planet: "Venus", keywords: ["शुक्र", "shukr"] },
  { planet: "Sun", keywords: ["सूर्य", "surya"] },
  { planet: "Moon", keywords: ["चंद्र", "chandra"] },
];

function classifyCategory(text: string): JapCategory {
  const lower = text.toLowerCase();
  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw.toLowerCase()))) return category;
  }
  return "Mantra";
}

function classifyPlanet(text: string): Planet | undefined {
  const lower = text.toLowerCase();
  for (const { planet, keywords } of PLANET_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw.toLowerCase()))) return planet;
  }
  return undefined;
}

/** Strips the repeated channel-boilerplate footer, stray AI-citation
 * artifacts, raw URLs, and hashtag clutter from a raw video description,
 * leaving just the actual unique content the creator wrote. */
function cleanDescription(raw: string): string {
  let text = raw;

  const cutMarkers = ["✨ Welcome to KarmaKnocksBack", "🌟 Join the KarmaKnocksBack"];
  for (const marker of cutMarkers) {
    const idx = text.indexOf(marker);
    if (idx !== -1) text = text.slice(0, idx);
  }

  text = text.replace(/:contentReference\[[^\]]*\]\{[^}]*\}/g, "");
  text = text.replace(/https?:\/\/\S+/g, "");
  text = text.replace(/#[\u0900-\u097Fa-zA-Z0-9_]+/g, "");
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.replace(/^[\s\n]+|[\s\n]+$/g, "");

  return text.trim();
}

function extractMantra(cleaned: string): string {
  const match = cleaned.match(
    /मंत्र\s*[:：]\s*([\s\S]+?)(?=\n\n|इस (?:मंत्र|वीडियो)|🙏|✨|$)/
  );
  if (!match) return "";
  const text = match[1].trim();
  return text.length > 5 && text.length < 2000 ? text : "";
}

function extractBenefits(cleaned: string): string[] {
  const emojiLine = /^[\u{1F300}-\u{1FAFF}\u2600-\u27BF\u2190-\u21FF]\s*(.+)$/u;
  const lines = cleaned.split("\n").map((l) => l.trim());
  const benefits: string[] = [];
  for (const line of lines) {
    const m = line.match(emojiLine);
    if (m && m[1].length > 3 && m[1].length < 120) {
      benefits.push(m[1].replace(/\s*\(.*?\)\s*$/, "").trim());
    }
    if (benefits.length >= 6) break;
  }
  return benefits;
}

function firstSentence(cleaned: string, maxLen = 160): string {
  const sentence = cleaned.split(/[।.\n]/)[0]?.trim() || "";
  if (sentence.length > 10) return sentence.slice(0, maxLen);
  return cleaned.slice(0, maxLen);
}

const JAIN_SIGNAL_KEYWORDS = [
  "jain", "जैन", "मंत्र", "mantra", "जाप", "jaap",
  "japa", "भजन", "bhajan", "स्तवन", "stavan", "स्तोत्र", "stotra",
  "नवकार", "navkar", "namokar", "स्वाध्याय", "swadhyay", "दिगंबर", "digambar",
  "श्वेतांबर", "shwetambar", "मुनि", "muni", "आचार्य", "acharya", "साधु",
  "sadhu", "सागर जी", "आर्यिका", "क्षुल्लक", "भट्टारक", "पर्युषण", "paryushan",
  "दशलक्षण", "das lakshan", "अनेकांतवाद", "अहिंसा", "ahimsa", "समुद्घात",
  "moksha", "मोक्ष", ...TIRTHANKAR_NAMES,
];

/** Filters out general motivational/history/news videos that this channel
 * also publishes alongside its Jain devotional content — those don't belong
 * in a Jain-focused Jap Library even though they were uploaded Public. */
function isJainRelated(row: CsvRow): boolean {
  const text = `${row.TITLE} ${row.KEYWORDS} ${row.DESCRIPTION.slice(0, 400)}`.toLowerCase();
  return JAIN_SIGNAL_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
}

async function run() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`CSV not found at ${CSV_PATH}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(CSV_PATH, "utf-8");
  const rows: CsvRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  });

  const publicRows = rows.filter((r) => r.STATUS === "Public");
  const jainRows = publicRows.filter(isJainRelated);
  const excludedRows = publicRows.filter((r) => !isJainRelated(r));

  console.log(`Found ${rows.length} rows, ${publicRows.length} are Public.`);
  console.log(
    `${jainRows.length} look Jain-related and will be imported; ${excludedRows.length} look unrelated (general motivational/history/news content) and will be skipped.`
  );

  if (excludedRows.length) {
    const reportPath = path.resolve(process.cwd(), "scripts/data/excluded-videos.txt");
    fs.writeFileSync(
      reportPath,
      excludedRows.map((r) => `${r.ID}\t${r.TITLE}`).join("\n"),
      "utf-8"
    );
    console.log(`Full list of excluded titles written to ${reportPath}`);
  }

  // Feature the top 8 most-viewed (Jain-related) public videos on the home page.
  const featuredIds = new Set(
    [...jainRows]
      .sort((a, b) => Number(b.VIEWS || 0) - Number(a.VIEWS || 0))
      .slice(0, 8)
      .map((r) => r.ID)
  );

  const db = await ensureDb();
  await db.execute("DELETE FROM japs");

  let inserted = 0;
  const BATCH = 20; // Turso free tier handles ~20 writes before needing a small pause

  for (let batchStart = 0; batchStart < jainRows.length; batchStart += BATCH) {
    const batch = jainRows.slice(batchStart, batchStart + BATCH);

    for (const row of batch) {
    const id = row.ID.trim();
    const title = row.TITLE.trim();
    if (!id || !title) continue;

    const cleaned = cleanDescription(row.DESCRIPTION || "").slice(0, 2000); // hard cap
    const purpose = firstSentence(cleaned || title);
    const meaning = (cleaned || title).slice(0, 500) || title;
    const lyrics = extractMantra(cleaned).slice(0, 800);
    const benefits = extractBenefits(cleaned);
    const classifyText = `${title} ${row.KEYWORDS || ""}`;
    const category = classifyCategory(classifyText);
    const planet = category === "Navgrah" ? classifyPlanet(classifyText) : undefined;

    const durationSeconds = Number(row.DURATION || 0);
    const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

    const keywordList = (row.KEYWORDS || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    const seoKeyword =
      keywordList[0] && keywordList[0].length <= 60 ? keywordList[0] : title.slice(0, 60);
    const keywords = keywordList.join(", ").slice(0, 500);

    const shortId = id.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
    const slug = `${slugify(title).slice(0, 70)}-${shortId}`.replace(/^-+/, "");

    try {
      await createJap({
        title,
        titleHi: title,
        slug,
        category,
        planet,
        purpose,
        durationMinutes,
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        youtubeLink: `https://www.youtube.com/watch?v=${id}`,
        benefits,
        bestFor: [],
        lyrics: lyrics,
        meaning,
        howToListen:
          "शांत व एकाग्र मन से इस वीडियो को सुनें। संभव हो तो प्रतिदिन एक निश्चित समय पर सुनना अधिक लाभकारी रहता है।",
        faq: [],
        seoKeyword,
        seoTitle: title.slice(0, 70),
        metaDescription: (cleaned || title).slice(0, 155),
        keywords,
        featured: featuredIds.has(id),
      });
      inserted++;
    } catch (err) {
      console.error(`Failed to insert "${title}" (${id}):`, err);
    }
    }

    // Small pause between batches to avoid Turso rate limits
    if (batchStart + BATCH < jainRows.length) {
      await new Promise((r) => setTimeout(r, 300));
    }
    console.log(`  Progress: ${Math.min(batchStart + BATCH, jainRows.length)}/${jainRows.length}`);
  }

  console.log(`Imported ${inserted} japs from the vidIQ export.`);
}

run().catch((e) => { console.error(e); process.exit(1); });
