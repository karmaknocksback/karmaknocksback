/**
 * Narrative engine — lexicon-only, zero external API calls, per explicit
 * decision to keep this feature at zero marginal cost.
 *
 * The safety check is NOT optional and NOT configurable. It runs before
 * any feature extraction, full stop. If it fires, the narrative text is
 * excluded from scoring entirely — a disclosure of real distress must
 * never become a "shameMarkers: 0.8" data point in someone's report.
 *
 * Honesty boundary on quality: a keyword/lexicon pass is real and
 * auditable, but shallow — it only catches patterns phrased in or near
 * the words it's looking for. It is not a substitute for genuine NLP
 * understanding. The report language built on this must stay
 * proportionate to that limitation (observations, not confident claims).
 */

export interface NarrativeSafetyCheck {
  flagged: boolean;
  category?: "self_harm" | "crisis_language";
}

// Conservative, narrow patterns only — biased toward flagging when
// uncertain, since a false positive (showing resources unnecessarily)
// costs far less than a false negative here. Kept intentionally short:
// this is a coarse safety net, not a clinical screening tool, and a long
// list of euphemisms risks both false confidence and misuse.
const SELF_HARM_PATTERNS = [
  /खुद को नुकसान/, /आत्महत्या/, /जीना नहीं चाहता/, /जीना नहीं चाहती/,
  /खुद को मार/, /जीने का मन नहीं/, /suicide/i, /self.?harm/i, /kill myself/i,
  /end my life/i, /don'?t want to live/i,
];

export function checkNarrativeSafety(text: string): NarrativeSafetyCheck {
  for (const pattern of SELF_HARM_PATTERNS) {
    if (pattern.test(text)) {
      return { flagged: true, category: "self_harm" };
    }
  }
  return { flagged: false };
}

export interface NarrativeFeatures {
  fearSignals: number; // 0-1
  controlSignals: number;
  victimLanguage: number;
  resentmentMarkers: number;
  dependencyMarkers: number;
  shameMarkers: number;
  matchedThemes: string[]; // which marker categories actually hit, for transparency
}

// Hindi + common English phrase fragments per marker category. Deliberately
// kept to recognizable, non-clinical everyday phrasing — this is a coarse
// signal, not a diagnostic instrument, and the extraction logic should not
// pretend otherwise.
const MARKER_PATTERNS: Record<keyof Omit<NarrativeFeatures, "matchedThemes">, RegExp[]> = {
  fearSignals: [/डर/, /भय/, /घबराहट/, /असुरक्षित/, /चिंता/, /afraid/i, /anxious/i, /scared/i, /worried/i],
  controlSignals: [/नियंत्रण/, /control/i, /हर चीज़ ठीक होनी चाहिए/, /मेरे हिसाब से/, /need to manage/i],
  victimLanguage: [
    /लोग मुझे इस्तेमाल/, /फायदा उठा/, /सब मेरे खिलाफ/, /कोई समझता नहीं/, /हमेशा मेरे साथ ही/,
    /people use me/i, /everyone against me/i, /no one understands/i, /take advantage/i,
  ],
  resentmentMarkers: [/गुस्सा रहता है/, /माफ नहीं कर पा/, /नाराज़गी/, /resent/i, /can'?t forgive/i, /still angry/i],
  dependencyMarkers: [
    /अकेला नहीं रह सकता/, /अकेली नहीं रह सकती/, /उसके बिना/, /उनके बिना/, /इसके बिना/,
    /need them/i, /can'?t be without/i, /depend on/i,
  ],
  shameMarkers: [/मेरी गलती है/, /मुझमें कमी/, /खुद को दोष/, /my fault/i, /something wrong with me/i, /ashamed/i],
};

/** Returns null if the text was flagged by the safety check (caller must
 * check checkNarrativeSafety() FIRST and never call this on flagged text). */
export function extractNarrativeFeatures(text: string): NarrativeFeatures {
  const result = {
    fearSignals: 0,
    controlSignals: 0,
    victimLanguage: 0,
    resentmentMarkers: 0,
    dependencyMarkers: 0,
    shameMarkers: 0,
  } as Omit<NarrativeFeatures, "matchedThemes">;

  const matchedThemes: string[] = [];

  for (const key of Object.keys(MARKER_PATTERNS) as (keyof typeof MARKER_PATTERNS)[]) {
    const patterns = MARKER_PATTERNS[key];
    const hitCount = patterns.filter((p) => p.test(text)).length;
    if (hitCount > 0) {
      // Capped at 1.0 — more keyword hits doesn't mean "more true," it
      // just means more matches against a shallow pattern list.
      result[key] = Math.min(1, hitCount / 2);
      matchedThemes.push(key);
    }
  }

  return { ...result, matchedThemes };
}

const TRAIT_NARRATIVE_LINK: Record<string, "krodh" | "maan" | "maya" | "lobh" | "bhaya" | "moh"> = {
  fearSignals: "bhaya",
  controlSignals: "maan",
  victimLanguage: "krodh",
  resentmentMarkers: "krodh",
  dependencyMarkers: "moh",
  shameMarkers: "maya",
};

export { TRAIT_NARRATIVE_LINK };
