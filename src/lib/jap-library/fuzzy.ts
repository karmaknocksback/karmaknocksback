/**
 * Fuzzy matching — Levenshtein edit distance, used as a fallback layer
 * when exact and transliteration-expanded search returns too few
 * results. Deterministic, no dependencies, no AI cost.
 */

export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const prev = new Array(b.length + 1).fill(0).map((_, i) => i);
  const curr = new Array(b.length + 1).fill(0);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

/** 0-1 similarity score derived from edit distance, normalized by the
 * longer string's length. 1 = identical, 0 = completely different. */
export function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a, b) / maxLen;
}

/** Given a query and a list of candidate strings, returns candidates
 * whose similarity to the query (or to any whitespace-separated token
 * within the candidate, so a multi-word title can still fuzzy-match a
 * single mistyped word) clears the threshold. Tuned for short proper
 * nouns ("bhaktamar" vs "bhaktambar") — looser thresholds on long free
 * text would produce too many false positives. */
export function fuzzyMatch(
  query: string,
  candidates: string[],
  threshold = 0.72
): { candidate: string; score: number }[] {
  const q = query.toLowerCase().trim();
  if (q.length < 3) return []; // too short for fuzzy matching to be meaningful

  const results: { candidate: string; score: number }[] = [];
  for (const candidate of candidates) {
    const lower = candidate.toLowerCase();
    const wholeScore = similarity(q, lower);
    const tokenScores = lower.split(/\s+/).map((tok) => similarity(q, tok));
    const bestScore = Math.max(wholeScore, ...tokenScores);
    if (bestScore >= threshold) {
      results.push({ candidate, score: bestScore });
    }
  }
  return results.sort((a, b) => b.score - a.score);
}
