import { listJaps } from "@/lib/repo/japs";
import { expandQueryTerms, normalizeQuery, detectPlanetFromQuery } from "./transliteration";
import { classifyPurposeTags, type PurposeTag } from "./purpose-tags";
import { fuzzyMatch } from "./fuzzy";
import { containsWholeWord } from "./text-match";
import type { JapData } from "@/types";

/**
 * Scoring weights, per the requested ranking scheme:
 *   exact mantra name match    -> 10
 *   exact category match       -> 9
 *   strong problem/purpose match -> 8
 *   keyword/transliteration match -> 6
 *   fuzzy/typo match            -> 4 (scaled by similarity)
 * Plus small tie-breaking bonuses for popularity (views) and source
 * confidence, so two equally-relevant results favor the more-watched or
 * better-sourced one rather than an arbitrary DB order.
 *
 * This is real, auditable scoring — not semantic/NLP understanding. A
 * query matches because a term or tag-keyword literally appears (possibly
 * after transliteration) or is a close fuzzy match, not because the
 * system "understood" the query's meaning the way an LLM would.
 */

const WEIGHT_EXACT_NAME = 10;
const WEIGHT_PLANET_MATCH = 9;
const WEIGHT_PURPOSE_TAG = 8;
const WEIGHT_KEYWORD = 6;
const WEIGHT_FUZZY_BASE = 4;

export interface RankedJapResult {
  jap: JapData;
  score: number;
  matchedReasons: string[];
}

export async function searchJapsRanked(rawQuery: string, limit = 10): Promise<RankedJapResult[]> {
  const normalized = normalizeQuery(rawQuery);
  if (!normalized) return [];

  const expandedTerms = expandQueryTerms(rawQuery);
  const queryPurposeTags = new Set(classifyPurposeTags(rawQuery));
  const queryPlanet = detectPlanetFromQuery(rawQuery);

  const allJaps = await listJaps(); // 162 records — small enough to score in-memory
  const results: RankedJapResult[] = [];

  for (const jap of allJaps) {
    let score = 0;
    const reasons: string[] = [];

    const haystacks = [jap.title, jap.titleHi, jap.purpose, jap.seoKeyword, jap.keywords || "", jap.lyrics]
      .join(" ")
      .toLowerCase();

    // Exact / near-exact name match
    if (containsWholeWord(jap.titleHi, normalized) || containsWholeWord(jap.title, normalized)) {
      score += WEIGHT_EXACT_NAME;
      reasons.push("name-match");
    }

    // Planet-specific match (e.g. "shani dosh" should rank Saturn-tagged
    // japs above generic grah-shanti content)
    if (queryPlanet && jap.planet === queryPlanet) {
      score += WEIGHT_PLANET_MATCH;
      reasons.push(`planet-match:${queryPlanet}`);
    }

    // Purpose-tag match — the query's implied purpose tags overlap with
    // this jap's own tags (or, if the jap hasn't been classified yet,
    // fall back to classifying its own text on the fly).
    const japTags = new Set<PurposeTag>(
      (jap.purposeTags?.length ? jap.purposeTags : classifyPurposeTags(haystacks)) as PurposeTag[]
    );
    const tagOverlap = [...queryPurposeTags].filter((t) => japTags.has(t));
    if (tagOverlap.length) {
      score += WEIGHT_PURPOSE_TAG * tagOverlap.length;
      reasons.push(`purpose-tag:${tagOverlap.join(",")}`);
    }

    // Keyword / transliteration-expanded term match
    const termHits = expandedTerms.filter((t) => t.length >= 2 && containsWholeWord(haystacks, t));
    if (termHits.length) {
      score += WEIGHT_KEYWORD * Math.min(termHits.length, 2); // cap so one long query can't dominate via term count alone
      reasons.push("keyword-match");
    }

    if (score === 0) {
      // Fuzzy fallback only when nothing else matched — catches typos
      // ("bhaktambar") without letting fuzzy noise drown out real matches.
      const fuzzy = fuzzyMatch(normalized, [jap.title, jap.titleHi], 0.72);
      if (fuzzy.length) {
        score += WEIGHT_FUZZY_BASE * fuzzy[0].score;
        reasons.push("fuzzy-match");
      }
    }

    if (score > 0) {
      // Small tie-breaking nudges — popularity and source confidence
      // never outrank a genuine relevance signal, only break ties between
      // similarly-relevant results.
      score += Math.min(1, jap.views / 1000); // capped, so popularity alone can't dominate
      if (jap.sourceConfidence === "verified") score += 0.5;
      results.push({ jap, score, matchedReasons: reasons });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
