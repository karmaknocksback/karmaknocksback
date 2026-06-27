/** Word-boundary substring check. Plain `.includes()` lets short terms
 * like "exam" or "job" match inside unrelated words ("example", "enjoy")
 * — this requires the match to be bounded by a non-letter/non-digit
 * character (or string edge) on both sides. \p{L}/\p{N} with the `u` flag
 * works reasonably across both Latin and Devanagari text. */
export function containsWholeWord(haystack: string, term: string): boolean {
  if (!term) return false;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(?:^|[^\\p{L}\\p{N}])${escaped}(?:[^\\p{L}\\p{N}]|$)`, "iu");
  return regex.test(` ${haystack} `);
}
