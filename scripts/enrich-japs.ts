/**
 * Enriches all existing japs with purpose tags and source-confidence
 * metadata. Idempotent — safe to re-run after editing the purpose-tag
 * keyword lists in lib/jap-library/purpose-tags.ts.
 *
 * IMPORTANT on Granth references: this does NOT attach a citation to
 * every record. Most of the 162 imported videos are modern devotional
 * content (bhajans, recitations, motivational framing) with no stated
 * textual source in the original vidIQ export — inventing chapter/section
 * citations for those would be fabrication, which the brief this was
 * built against explicitly forbids. Only two text-identities in this
 * library have a real, researched, citable source:
 *
 *  - Navkar/Namokar Mahamantra: scholarship is genuinely nuanced here —
 *    it has NO single named author and is not found in its present form
 *    in the earliest Agamas, but partial references appear in the
 *    Bhagwati Sutra and Pannavana Sutra, plus epigraphic evidence
 *    (Kharvel and Mathura inscriptions, ~1st-6th century CE). Marked
 *    "traditional" rather than "verified" because of that documented
 *    absence from the earliest texts in present form.
 *  - Bhaktamar Stotra: authored by Acharya Manatunga (~7th century CE),
 *    praising Rishabhanatha (Adinath), the first Tirthankara. Verse count
 *    differs by sect — Digambar tradition counts 48 verses, Shwetambar
 *    counts 44 — stated explicitly per the "when doctrinal conflict
 *    exists, prefer Digambar interpretation, but mention the conflict"
 *    instruction. Marked "verified" since author/text identity is well
 *    documented even though the verse count varies.
 *
 * Every other record gets source_confidence = "community" and no
 * granth_reference — an honest default, not a placeholder.
 *
 * Usage: npm run enrich:japs
 */
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { listJaps, updateJap } from "../src/lib/repo/japs";
import { classifyPurposeTags } from "../src/lib/jap-library/purpose-tags";

const NAVKAR_GRANTH_REF =
  "भगवती सूत्र व प्रज्ञापना सूत्र में आंशिक उल्लेख; खारवेल व मथुरा शिलालेख (लगभग प्रथम-छठी शताब्दी) में प्रारंभिक रूप मिलता है। मंत्र को अनादि-अनंत व रचयिता-रहित माना जाता है, इसलिए वर्तमान पूर्ण रूप प्रारंभिक आगमों में सीधे नहीं मिलता — परंपरा इसे सभी आगमों का सार मानती है।";

const BHAKTAMAR_GRANTH_REF =
  "रचयिता आचार्य मानतुंग (लगभग 7वीं शताब्दी), आदिनाथ भगवान की स्तुति में रचित। श्लोक संख्या में मतभेद: दिगंबर परंपरा 48 श्लोक मानती है, श्वेतांबर परंपरा 44 श्लोक (4 श्लोकों को बाद में जोड़ा गया मानती है)। यहाँ दिगंबर परंपरा अनुसार 48 श्लोक की गणना को वरीयता दी गई है।";

function isGenuineNavkarMantraContent(title: string, purpose: string): boolean {
  const text = `${title} ${purpose}`;
  const hasNavkarTerm = /नवकार|नमोकार|णमोकार|namokar|navkar/i.test(text);
  if (!hasNavkarTerm) return false;
  // Exclude content that merely mentions the mantra in a news/political/
  // dance-performance context rather than being content about the mantra
  // itself — the citation describes the mantra's textual origin, which
  // isn't relevant background for an event-news video.
  const isNewsOrEventContent = /PM Modi|Modi Ji|Global Peace Mission|Diwas 2025|Dance Performance/i.test(text);
  return !isNewsOrEventContent;
}

function isGenuineBhaktamarContent(title: string, purpose: string): boolean {
  return /भक्तामर|bhaktamar stotra/i.test(`${title} ${purpose}`);
}

async function run() {
  const allJaps = await listJaps();
  console.log(`Enriching ${allJaps.length} japs with purpose tags + source confidence...`);

  let verifiedCount = 0;
  let traditionalCount = 0;
  let communityCount = 0;
  const purposeTagCounts: Record<string, number> = {};

  for (const jap of allJaps) {
    const haystack = `${jap.title} ${jap.titleHi} ${jap.purpose} ${jap.seoKeyword} ${jap.keywords || ""}`;
    const purposeTags = classifyPurposeTags(haystack);
    purposeTags.forEach((t) => { purposeTagCounts[t] = (purposeTagCounts[t] || 0) + 1; });

    let granthReference: string | undefined;
    let sourceConfidence: "verified" | "traditional" | "community" = "community";

    if (isGenuineNavkarMantraContent(jap.title, jap.purpose)) {
      granthReference = NAVKAR_GRANTH_REF;
      sourceConfidence = "traditional";
      traditionalCount++;
    } else if (isGenuineBhaktamarContent(jap.title, jap.purpose)) {
      granthReference = BHAKTAMAR_GRANTH_REF;
      sourceConfidence = "verified";
      verifiedCount++;
    } else {
      communityCount++;
    }

    await updateJap(jap._id, { purposeTags, granthReference, sourceConfidence });
  }

  console.log(`\nSource confidence: verified=${verifiedCount}, traditional=${traditionalCount}, community=${communityCount} (community = no fabricated citation, honest default)`);
  console.log("\nPurpose tag distribution:", purposeTagCounts);
  console.log("\nEnrichment complete.");
}

run().catch((e) => { console.error(e); process.exit(1); });
