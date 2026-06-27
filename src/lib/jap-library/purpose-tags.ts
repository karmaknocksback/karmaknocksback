/**
 * Purpose-tag taxonomy for the Jap Library.
 *
 * This is ADDITIVE to the existing `category` field (Tirthankar, Navgrah,
 * Healing, Protection, Bhajan, Katha, Philosophy, Mantra) — it does not
 * replace it. A jap can carry multiple purpose tags (e.g. a Navkar mantra
 * video might tag as both "shanti" and "karma-shuddhi"), which the single
 * `category` field was never designed to express.
 *
 * Each tag's keyword list serves double duty: it's used to auto-classify
 * existing records (Phase 1/3 of the brief) AND to match natural-language
 * search queries against tags (Phase 7/8/9) — one list, two consumers, so
 * there's no drift between "what we tag content as" and "what search
 * terms find that content."
 *
 * This is deliberately keyword/rule-based, not true semantic
 * understanding — there's no LLM call here (matches the project's
 * zero-AI-cost decision). "Intent detection" in practice means: does the
 * query contain a term from this tag's list, or a close fuzzy/transliterated
 * match to one. That's real and useful, but it's pattern matching, not
 * comprehension — queries phrased in totally unanticipated ways won't
 * be understood the way an LLM would.
 */

export type PurposeTag =
  | "grah-shanti" | "rog-nivarak" | "suraksha" | "nazar-dosh" | "shanti"
  | "dhan-samriddhi" | "karya-siddhi" | "vivah" | "santan" | "karma-shuddhi"
  | "bhakti" | "siddhi-riddhi";

export interface PurposeTagDef {
  tag: PurposeTag;
  labelHi: string;
  labelEn: string;
  /** Hindi/Devanagari, English, and Hinglish/Roman-Hindi terms — all in
   * one list since the search layer normalizes/transliterates before
   * matching against this. */
  keywords: string[];
}

export const PURPOSE_TAGS: PurposeTagDef[] = [
  {
    tag: "grah-shanti",
    labelHi: "ग्रह शांति",
    labelEn: "Planetary Peace",
    keywords: [
      "ग्रह", "ग्रह दोष", "ग्रह शांति", "नवग्रह", "कुंडली", "साढ़े साती", "शनि दोष",
      "राहु", "केतु", "मंगल दोष", "grah shanti", "grah dosh", "kundli problem",
      "planetary issue", "navgrah", "sade sati", "shani dosh", "rahu", "ketu",
      "mangal dosh", "graha", "astrological disturbance",
    ],
  },
  {
    tag: "rog-nivarak",
    labelHi: "रोग निवारक",
    labelEn: "Healing",
    keywords: [
      "रोग", "रोग निवारक", "स्वास्थ्य", "बीमारी", "उपचार", "दर्द", "कमर दर्द",
      "सिरदर्द", "कमजोरी", "back pain", "spine pain", "headache", "weakness",
      "disease", "illness", "rog nivarak", "healing", "health", "recovery",
      "chronic illness", "pain relief", "immune", "emotional healing",
      "anxiety relief", "fear reduction", "energy healing",
      "नींद", "neend", "neend nahi aati", "insomnia", "sleep problem", "sleep issue",
    ],
  },
  {
    tag: "suraksha",
    labelHi: "सुरक्षा",
    labelEn: "Protection",
    keywords: [
      "रक्षा", "सुरक्षा", "कवच", "नकारात्मक ऊर्जा", "protection", "safety",
      "security", "raksha", "suraksha", "personal protection", "family protection",
      "travel protection", "home protection", "negative energy", "psychic protection",
      "spiritual shield", "ghar me negative energy",
      "डर", "भय", "darr", "dar", "bhaya", "bhay", "afraid", "scared", "fear",
      "akela darr", "raat ko darr", "fear removal", "fear at night",
    ],
  },
  {
    tag: "nazar-dosh",
    labelHi: "नज़र दोष",
    labelEn: "Evil Eye",
    keywords: [
      "नज़र", "नज़र दोष", "बुरी नज़र", "नज़र उतारो", "नज़र लग गयी", "evil eye",
      "buri nazar", "nazar utaro", "nazar lag gayi", "nazar dosh", "meri nazar utaro",
      "sudden bad luck", "repeated obstacles", "child nazar", "business nazar",
    ],
  },
  {
    tag: "shanti",
    labelHi: "मानसिक शांति",
    labelEn: "Mental Peace",
    keywords: [
      "शांति", "अशांति", "मन की शांति", "तनाव", "चिंता", "क्रोध", "krodh", "anger",
      "stress", "anxiety", "depression", "mind calm", "shanti chahiye",
      "man ki shanti", "calm mind", "anger reduction", "emotional balance",
      "sleep support", "meditation", "overthinking", "peace", "ghabrahat",
      "घबराहट", "बेचैनी", "restless", "uneasy",
    ],
  },
  {
    tag: "dhan-samriddhi",
    labelHi: "धन समृद्धि",
    labelEn: "Wealth & Prosperity",
    keywords: [
      "धन", "समृद्धि", "पैसा", "व्यापार", "money problems", "paisa",
      "business growth", "dhan prapti", "wealth", "money", "prosperity",
      "debt relief", "money stability", "abundance",
      "कर्ज", "karz", "karza", "debt", "loan", "karz se mukti",
      "vyapar", "ghata", "घाटा", "business loss", "vyapar me ghata", "paisa nahi tikta",
    ],
  },
  {
    tag: "karya-siddhi",
    labelHi: "कार्य सिद्धि",
    labelEn: "Success & Achievement",
    keywords: [
      "कार्य सिद्धि", "नौकरी", "परीक्षा", "job nahi mil rahi", "exam stress",
      "kaam atak gaya", "job", "career", "work success", "promotion", "interview",
      "exam", "court case", "stuck work",
    ],
  },
  {
    tag: "vivah",
    labelHi: "विवाह",
    labelEn: "Marriage & Relationship",
    keywords: [
      "विवाह", "शादी", "पति पत्नी", "marriage obstacles", "husband wife harmony",
      "family peace", "relationship healing", "vivah", "shaadi", "shadi",
      "kalesh", "क्लेश", "jhagda", "झगड़ा", "ghar me jhagda", "ghar me kalesh",
      "shadi me dikkat", "shadi me rukawat", "marriage delay", "couple problem",
    ],
  },
  {
    tag: "santan",
    labelHi: "संतान",
    labelEn: "Children",
    keywords: [
      "संतान", "बच्चे", "गर्भावस्था", "child protection", "pregnancy support",
      "child concentration", "child wellbeing", "child health", "santan", "bachhe",
    ],
  },
  {
    tag: "karma-shuddhi",
    labelHi: "कर्म शुद्धि",
    labelEn: "Karmic Purification",
    keywords: [
      "कर्म", "कर्म शुद्धि", "निर्जरा", "पाप क्षय", "मोह", "क्रोध", "अहंकार",
      "आत्म शुद्धि", "सम्यक दर्शन", "karm nirjara", "paap kshay", "moh reduction",
      "krodh reduction", "ego reduction", "spiritual upliftment", "inner purification",
      "samyak darshan",
    ],
  },
  {
    tag: "bhakti",
    labelHi: "भक्ति",
    labelEn: "Devotion",
    keywords: [
      "भक्ति", "पूजा", "आरती", "भाव शुद्धि", "daily worship", "temple",
      "bhav shuddhi", "devotional", "bhakti", "puja", "aarti",
    ],
  },
  {
    tag: "siddhi-riddhi",
    labelHi: "सिद्धि ऋद्धि",
    labelEn: "Advanced Sadhana",
    keywords: [
      "सिद्धि", "ऋद्धि", "साधना", "riddhi mantra", "siddhi mantra",
      "advanced sadhana", "high energy spiritual practice",
    ],
  },
];

export const PURPOSE_TAG_LABELS_HI: Record<PurposeTag, string> = Object.fromEntries(
  PURPOSE_TAGS.map((t) => [t.tag, t.labelHi])
) as Record<PurposeTag, string>;

export function getPurposeTagDef(tag: PurposeTag): PurposeTagDef | undefined {
  return PURPOSE_TAGS.find((t) => t.tag === tag);
}

import { containsWholeWord } from "./text-match";

/** Auto-classifies a piece of text into all plausibly-applicable purpose
 * tags (a jap can have multiple), by checking whether any keyword from a
 * tag's list appears as a whole-word match. Deterministic and auditable —
 * same rule-based approach as the existing category classifier in
 * import-vidiq.ts, just producing a tag SET instead of a single category. */
export function classifyPurposeTags(text: string): PurposeTag[] {
  const matched: PurposeTag[] = [];
  for (const def of PURPOSE_TAGS) {
    if (def.keywords.some((kw) => containsWholeWord(text, kw))) {
      matched.push(def.tag);
    }
  }
  return matched;
}
