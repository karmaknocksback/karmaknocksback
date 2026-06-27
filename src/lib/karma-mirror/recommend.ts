import { listPractices } from "@/lib/repo/km-practices";
import { getJapById } from "@/lib/repo/japs";
import { topTraits } from "./scoring";
import { TRAIT_LABELS_HI } from "./constants";
import type { PrimaryScores, KMDifficulty, KMPracticeRecommendation, KashayaTrait } from "@/types";

const DIFFICULTY_RANK: Record<KMDifficulty, number> = { beginner: 0, intermediate: 1, advanced: 2 };

export async function recommendPractices(input: {
  primaryScores: PrimaryScores;
  experienceLevel: KMDifficulty;
  limit?: number;
}): Promise<KMPracticeRecommendation[]> {
  const { primaryScores, experienceLevel, limit = 6 } = input;
  const dominant = topTraits(primaryScores, 3);
  const allPractices = await listPractices();

  const scoredWithJaps = await Promise.all(
    allPractices.map(async (practice) => {
      const matchedTraits = practice.targetTraits.filter((t) => dominant.includes(t as never));
      const matchStrength = matchedTraits.length / Math.max(1, practice.targetTraits.length);
      const dominantBonus = matchedTraits.length > 0 ? (3 - dominant.indexOf(matchedTraits[0] as never)) * 10 : 0;
      const hasRealContent = !!practice.linkedJapId || !!practice.linkedArticleId;
      const contentBonus = hasRealContent ? 15 : 0;
      const difficultyGap = Math.abs(DIFFICULTY_RANK[practice.difficulty] - DIFFICULTY_RANK[experienceLevel]);
      const difficultyPenalty = difficultyGap * 8;
      const matchScore = Math.round(matchStrength * 50 + dominantBonus + contentBonus - difficultyPenalty);

      let linkedJapSlug: string | undefined;
      let linkedJapTitleHi: string | undefined;
      if (practice.linkedJapId) {
        const jap = await getJapById(practice.linkedJapId);
        if (jap) {
          linkedJapSlug = jap.slug;
          linkedJapTitleHi = jap.titleHi;
        }
      }

      const topTraitHi = matchedTraits[0] ? TRAIT_LABELS_HI[matchedTraits[0] as KashayaTrait] : undefined;
      const reason = topTraitHi
        ? `आपके उच्च ${topTraitHi} स्कोर के लिए विशेष रूप से उपयुक्त`
        : "आपकी समग्र प्रोफ़ाइल के लिए उपयुक्त";

      return { practice, matchScore, reason, linkedJapSlug, linkedJapTitleHi } satisfies KMPracticeRecommendation;
    })
  );

  return scoredWithJaps
    .filter((s) => s.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
