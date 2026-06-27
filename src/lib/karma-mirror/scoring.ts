import { KASHAYA_TRAITS } from "./constants";
import { KM_ARCHETYPES } from "./archetypes";
import type { KashayaTrait, PrimaryScores, SecondaryScores, KMArchetype } from "@/types";

export interface RawAnswer {
  questionId: string;
  value: number; // 1-5
}

type LiveQuestion = {
  id: string; trait: string; reverseScored: boolean;
};

function scoredValue(rawValue: number, reverseScored: boolean): number {
  return reverseScored ? 6 - rawValue : rawValue;
}

export function computePrimaryScores(answers: RawAnswer[], questions: LiveQuestion[]): PrimaryScores {
  const byTrait: Record<KashayaTrait, number[]> = {
    krodh: [], maan: [], maya: [], lobh: [], bhaya: [], moh: [],
  };
  const questionById = new Map(questions.map((q) => [q.id, q]));

  for (const ans of answers) {
    const q = questionById.get(ans.questionId);
    if (!q) continue;
    byTrait[q.trait as KashayaTrait].push(scoredValue(ans.value, q.reverseScored));
  }

  const scores = {} as PrimaryScores;
  for (const trait of KASHAYA_TRAITS) {
    const values = byTrait[trait];
    if (!values.length) { scores[trait] = 50; continue; }
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    scores[trait] = Math.round(((mean - 1) / 4) * 100);
  }
  return scores;
}

/** Derived secondary scores: hand-defined weighted combinations of the
 * primary scores, not yet ML-learned. Each weight set sums to 1.0. This is
 * the Phase 1 approach described in the architecture — an honest starting
 * point that real response data can later refine. */
export function computeSecondaryScores(p: PrimaryScores): SecondaryScores {
  const round = (n: number) => Math.round(n);
  return {
    attachment: round(p.moh * 0.7 + p.bhaya * 0.3),
    reactivity: round(p.krodh * 0.7 + p.maan * 0.3),
    avoidance: round(p.bhaya * 0.5 + p.maya * 0.5),
    control: round(p.maan * 0.4 + p.lobh * 0.3 + p.bhaya * 0.3),
    perfectionism: round(p.maan * 0.6 + p.krodh * 0.4),
    emotionalDependency: round(p.moh * 0.6 + p.bhaya * 0.4),
    peoplePleasing: round(p.bhaya * 0.4 + p.maya * 0.3 + p.moh * 0.3),
    suppression: round(p.maya * 0.6 + p.bhaya * 0.4),
    overthinking: round(p.bhaya * 0.6 + p.moh * 0.4),
  };
}

/** How complete and internally non-contradictory this person's answers
 * were. This is NOT a measure of psychological accuracy — it's a data-
 * quality signal: did they answer enough, and were their answers varied
 * enough to look like genuine engagement rather than straight-lining
 * (e.g. picking option 3 for all 48 questions). */
export function computeConfidence(answers: RawAnswer[], questions: LiveQuestion[]): number {
  const totalQuestions = questions.length;
  const completionRate = answers.length / totalQuestions;
  if (answers.length < 2) return Math.round(completionRate * 100) / 100;

  const values = answers.map((a) => a.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;

  // Across 48 varied direct + scenario questions, real engagement almost
  // always produces some spread. Very low variance suggests low-effort,
  // straight-lined responses rather than careful answers.
  const straightLinePenalty = variance < 0.4 ? 0.25 : 0;
  const confidence = Math.max(0, Math.min(1, completionRate - straightLinePenalty));
  return Math.round(confidence * 100) / 100;
}

/** Simplified per-trait internal-agreement proxy, conceptually similar to
 * (but much cruder than) Cronbach's alpha: do this person's answers within
 * one trait's question cluster move together, or are they scattered and
 * contradictory? This is a per-individual consistency check, not a
 * population-validated reliability coefficient — the report should always
 * say so explicitly rather than implying clinical-grade rigor. */
export function computeReliability(answers: RawAnswer[], questions: LiveQuestion[]): number {
  const byTrait: Record<KashayaTrait, number[]> = {
    krodh: [], maan: [], maya: [], lobh: [], bhaya: [], moh: [],
  };
  const questionById = new Map(questions.map((q) => [q.id, q]));
  for (const ans of answers) {
    const q = questionById.get(ans.questionId);
    if (!q) continue;
    byTrait[q.trait as KashayaTrait].push(scoredValue(ans.value, q.reverseScored));
  }

  const MAX_VARIANCE = 4; // theoretical max variance for a 1-5 scale
  const perTraitScores = KASHAYA_TRAITS.map((trait) => {
    const values = byTrait[trait];
    if (values.length < 2) return 0.5; // not enough data to judge either way
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
    return Math.max(0, Math.min(1, 1 - variance / MAX_VARIANCE));
  });

  const avg = perTraitScores.reduce((a, b) => a + b, 0) / perTraitScores.length;
  return Math.round(avg * 100) / 100;
}

export interface ArchetypeMatch {
  archetype: KMArchetype;
  score: number; // 0-100, how well this archetype fits the person's scores
}

/** Ranks every archetype by how well its dominant traits match this
 * person's actual scores. The first trait listed in an archetype's
 * `dominantTraits` is treated as its primary driver and weighted more
 * heavily than the second — this matters because a few archetypes share
 * the same trait pair in different orders (e.g. krodh+maan vs maan+krodh),
 * and a flat average would make them indistinguishable. The top match
 * becomes the primary archetype; the next 1-2 are kept as secondary
 * candidates rather than discarded, since real people rarely fit one box
 * cleanly. */
export function matchArchetypes(scores: PrimaryScores): ArchetypeMatch[] {
  const WEIGHTS = [0.65, 0.35]; // primary trait, secondary trait
  const matches = KM_ARCHETYPES.map((archetype) => {
    const weighted = archetype.dominantTraits.reduce((sum, trait, i) => {
      const weight = WEIGHTS[i] ?? 0;
      return sum + scores[trait] * weight;
    }, 0);
    const totalWeight = archetype.dominantTraits.reduce((sum, _, i) => sum + (WEIGHTS[i] ?? 0), 0);
    const score = Math.round(weighted / totalWeight);
    return { archetype, score };
  });
  return matches.sort((a, b) => b.score - a.score);
}

export function topTraits(scores: PrimaryScores, n = 2): KashayaTrait[] {
  return [...KASHAYA_TRAITS].sort((a, b) => scores[b] - scores[a]).slice(0, n);
}

export function lowestTraits(scores: PrimaryScores, n = 2): KashayaTrait[] {
  return [...KASHAYA_TRAITS].sort((a, b) => scores[a] - scores[b]).slice(0, n);
}
