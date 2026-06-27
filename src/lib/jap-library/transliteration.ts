/**
 * Roman Hindi (Hinglish) -> Devanagari term mapping, plus common
 * misspelling normalization for well-known mantra/stotra names.
 *
 * This is a deliberately curated dictionary, not a general phonetic
 * transliteration algorithm (e.g. ITRANS/Harvard-Kyoto) — a general
 * algorithm would need to handle Hindi's irregular romanization (people
 * type "shanti", "shaanti", "shanthi" unpredictably) and would still need
 * a curated list for proper nouns anyway. A maintained list is more
 * accurate for the vocabulary this site actually gets searched for, at
 * the cost of not generalizing to terms nobody has added yet.
 */

/** Known alternate spellings/misspellings of specific mantra/stotra names
 * -> their canonical Devanagari form, used so "bhaktambar", "bhaktamar",
 * and "भक्तामर" all resolve to the same search target. */
export const NAME_VARIANTS: Record<string, string> = {
  bhaktamar: "भक्तामर", bhaktambar: "भक्तामर", "bhaktamar stotra": "भक्तामर",
  navkar: "नवकार", navkaar: "नवकार", namokar: "नवकार", namokaar: "नवकार",
  "navkar mantra": "नवकार", mahamrityunjay: "महामृत्युंजय", mahamrityunjaya: "महामृत्युंजय",
  uttamkshama: "उत्तम क्षमा", "uttam kshama": "उत्तम क्षमा",
  rishabhdev: "ऋषभदेव", rishabhdeva: "ऋषभदेव", adinath: "आदिनाथ", aadinath: "आदिनाथ",
  parshvanath: "पार्श्वनाथ", parasnath: "पार्श्वनाथ", neminath: "नेमिनाथ",
  shantinath: "शांतिनाथ", mahavir: "महावीर", mahaveer: "महावीर",
};

/** Common-word Roman Hindi -> Devanagari, reused from and extending the
 * search-term-expansion list already in repo/japs.ts — kept here as the
 * canonical source so the purpose-tag matcher and the jap search can both
 * draw from one dictionary instead of drifting apart. */
export const TERM_TRANSLITERATIONS: Record<string, string[]> = {
  rog: ["रोग"], nivarak: ["निवारक"], shanti: ["शांति"], shaanti: ["शांति"],
  nazar: ["नज़र", "नजर"], dosh: ["दोष"], dhan: ["धन"], samriddhi: ["समृद्धि"],
  suraksha: ["सुरक्षा"], raksha: ["रक्षा"], karya: ["कार्य"], siddhi: ["सिद्धि"],
  vivah: ["विवाह"], shaadi: ["शादी"], shadi: ["शादी"], santan: ["संतान"],
  bachhe: ["बच्चे"], bachche: ["बच्चे"], karma: ["कर्म"], grah: ["ग्रह"],
  graha: ["ग्रह"], kundli: ["कुंडली"], paisa: ["पैसा"], naukri: ["नौकरी"],
  job: ["नौकरी"], pariksha: ["परीक्षा"], exam: ["परीक्षा"], bhakti: ["भक्ति"],
  puja: ["पूजा"], pooja: ["पूजा"], aarti: ["आरती"], aarati: ["आरती"],
  riddhi: ["ऋद्धि"], sadhna: ["साधना"], sadhana: ["साधना"],
};

/** Maps natural-language planet/dosh terms (Hindi, English, Hinglish) to
 * the PLANETS constant values already used on jap records — lets a query
 * like "shani dosh" or "sade sati" surface specifically Saturn-related
 * content instead of only the generic "grah-shanti" purpose tag, which
 * doesn't distinguish which planet. */
export const PLANET_SEARCH_TERMS: Record<string, string> = {
  // Sun
  surya: "Sun", sun: "Sun", सूर्य: "Sun", "सूर्य दोष": "Sun",
  // Moon
  chandra: "Moon", moon: "Moon", चंद्र: "Moon", चंद्रमा: "Moon", "चंद्र दोष": "Moon",
  // Mars
  mangal: "Mars", mars: "Mars", मंगल: "Mars", "मंगल दोष": "Mars", manglik: "Mars", मांगलिक: "Mars",
  // Mercury
  budh: "Mercury", mercury: "Mercury", बुध: "Mercury", "बुध दोष": "Mercury",
  // Jupiter
  guru: "Jupiter", jupiter: "Jupiter", गुरु: "Jupiter", brihaspati: "Jupiter", बृहस्पति: "Jupiter",
  // Venus
  shukra: "Venus", venus: "Venus", शुक्र: "Venus", "शुक्र दोष": "Venus",
  // Saturn
  shani: "Saturn", saturn: "Saturn", शनि: "Saturn", "शनि दोष": "Saturn",
  sadesati: "Saturn", "sade sati": "Saturn", साढ़ेसाती: "Saturn", "साढ़े साती": "Saturn",
  // Rahu
  rahu: "Rahu", राहु: "Rahu", "राहु दोष": "Rahu",
  // Ketu
  ketu: "Ketu", केतु: "Ketu", "केतु दोष": "Ketu",
};

/** Detects which specific planet (if any) a query is about. Checks
 * multi-word phrases first (e.g. "sade sati") before single words, since
 * a phrase match is a stronger signal. */
export function detectPlanetFromQuery(query: string): string | null {
  const normalized = query.toLowerCase().trim();
  for (const [term, planet] of Object.entries(PLANET_SEARCH_TERMS)) {
    if (term.includes(" ") && normalized.includes(term)) return planet;
  }
  for (const word of normalized.split(/\s+/)) {
    if (PLANET_SEARCH_TERMS[word]) return PLANET_SEARCH_TERMS[word];
  }
  return null;
}

/** Normalizes a raw user query: trims, lowercases, strips punctuation
 * noise, and resolves known name-variant misspellings to their canonical
 * Devanagari form. */
export function normalizeQuery(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^\u0900-\u097Fa-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

/** Expands a normalized query into a set of search terms: the original,
 * any resolved name-variant, and any per-word Devanagari transliterations.
 * Mirrors and supersedes the simpler SEARCH_TERM_EXPANSIONS dict in
 * repo/japs.ts for single-word exact matches, and additionally handles
 * multi-word queries by expanding word-by-word. */
export function expandQueryTerms(query: string): string[] {
  const normalized = normalizeQuery(query);
  const terms = new Set<string>([normalized]);

  if (NAME_VARIANTS[normalized]) {
    terms.add(NAME_VARIANTS[normalized]);
  }

  for (const word of normalized.split(" ")) {
    if (NAME_VARIANTS[word]) terms.add(NAME_VARIANTS[word]);
    const translit = TERM_TRANSLITERATIONS[word];
    if (translit) translit.forEach((t) => terms.add(t));
  }

  return Array.from(terms).filter(Boolean);
}
