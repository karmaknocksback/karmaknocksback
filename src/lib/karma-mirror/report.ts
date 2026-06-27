import { TRAIT_LABELS_HI, TRAIT_SHORT_DESCRIPTION_HI, TIMELINE_EVENT_LABELS_HI, LIFE_STAGE_LABELS_HI } from "./constants";
import { computeSecondaryScores, matchArchetypes, topTraits, lowestTraits } from "./scoring";
import { recommendPractices } from "./recommend";
import { patternPersistenceScore, buildCausalChains } from "./timeline-scoring";
import type { NarrativeFeatures } from "./narrative";
import { summarizeKundli, buildKundliReflectionText } from "./kundli/interpret";
import type { KundliPositions } from "./kundli/ephemeris";
import type { PrimaryScores, KMReport, KMReportSection, KMDifficulty, KashayaTrait, KMTimelineEvent } from "@/types";

function traitLine(scores: PrimaryScores, trait: KashayaTrait): string {
  return `${TRAIT_LABELS_HI[trait]} (${scores[trait]}/100) — ${TRAIT_SHORT_DESCRIPTION_HI[trait]}`;
}

function buildDominantTraitsSection(scores: PrimaryScores): KMReportSection {
  const top = topTraits(scores, 3);
  const body = [
    "आपकी प्रतिक्रियाओं के आधार पर, ये कषाय इस समय आपके अनुभव में सबसे अधिक सक्रिय दिखे:",
    ...top.map((t) => traitLine(scores, t)),
    "ये स्कोर स्थायी लेबल नहीं हैं — ये इस समय आपके पैटर्न की एक झलक हैं, जो समय और अभ्यास के साथ बदल सकती है।",
  ].join("\n\n");
  return { key: "dominant-traits", title: "प्रमुख कर्म-प्रवृत्तियाँ", body };
}

function buildShadowTraitsSection(scores: PrimaryScores): KMReportSection {
  const low = lowestTraits(scores, 2);
  const body = [
    `${low.map((t) => TRAIT_LABELS_HI[t]).join(" और ")} में आपका स्कोर तुलनात्मक रूप से कम है।`,
    "इसका सीधा मतलब यह नहीं कि यह प्रवृत्ति आपमें बिल्कुल नहीं है — कम स्कोर दो बातें दिखा सकता है: या तो आप इस प्रवृत्ति पर सहज नियंत्रण रखते हैं, या यह क्षेत्र आपके आत्म-निरीक्षण में अभी कम स्पष्ट है। दोनों संभावनाओं को खुले मन से देखना ही 'शैडो' को समझने का तरीका है।",
  ].join("\n\n");
  return { key: "shadow-traits", title: "अनदेखी प्रवृत्तियाँ (Shadow Traits)", body };
}

function buildArchetypeSection(
  archetypeNameHi: string,
  description: string,
  strengths: string[],
  weaknesses: string[]
): KMReportSection {
  const body = [
    description,
    `इसकी शक्तियाँ: ${strengths.join("; ")}।`,
    `इसकी चुनौतियाँ: ${weaknesses.join("; ")}।`,
  ].join("\n\n");
  return { key: "archetype", title: `आपका आर्किटाइप: ${archetypeNameHi}`, body };
}

function buildTriggerMapSection(triggerMap: string[]): KMReportSection {
  const body = [
    "ये परिस्थितियाँ आपके पैटर्न को सबसे जल्दी सक्रिय करती हैं:",
    triggerMap.map((t) => `• ${t}`).join("\n"),
    "इन्हें पहचानना ही पहला कदम है — ट्रिगर को रोकना संभव नहीं, पर ट्रिगर और प्रतिक्रिया के बीच जगह बनाना संभव है।",
  ].join("\n\n");
  return { key: "trigger-map", title: "ट्रिगर मैप", body };
}

function buildEmotionalLoopSection(karmicLoop: string): KMReportSection {
  return { key: "emotional-loop", title: "भावनात्मक लूप विश्लेषण", body: karmicLoop };
}

function buildKarmicTimelineSection(
  events: KMTimelineEvent[],
  scores: PrimaryScores,
  dominantTrait: KashayaTrait
): KMReportSection | null {
  if (!events.length) return null;

  const chains = buildCausalChains(events, scores);
  const persistence = patternPersistenceScore(events, dominantTrait);

  if (!chains.length) {
    return {
      key: "karmic-timeline",
      title: "कर्मिक टाइमलाइन विश्लेषण",
      body: "आपकी दर्ज की गई घटनाओं और आपके वर्तमान स्कोर के बीच कोई स्पष्ट संबंध नहीं दिखा — इसका मतलब यह नहीं कि कोई संबंध नहीं है, बल्कि यह कि इस डेटा के आधार पर एक भरोसेमंद संबंध बताना उचित नहीं होगा।",
    };
  }

  const lines = [
    "यह विश्लेषण आपकी दर्ज की गई घटनाओं को आपके वास्तविक स्कोर के विरुद्ध जांचता है — हर घटना को एक निश्चित परिणाम से नहीं जोड़ा जाता, केवल वही संबंध दिखाए जाते हैं जो आपकी अपनी प्रोफ़ाइल से मेल खाते हैं:",
  ];

  for (const chain of chains.slice(0, 3)) {
    const eventLabel = TIMELINE_EVENT_LABELS_HI[chain.event.eventType];
    const stageLabel = LIFE_STAGE_LABELS_HI[chain.event.lifeStage];
    const traitLabel = TRAIT_LABELS_HI[chain.trait];
    const stagePhrase =
      chain.event.lifeStage === "recent" || chain.event.lifeStage === "ongoing"
        ? stageLabel
        : `${stageLabel} में`;
    lines.push(
      `${stagePhrase} हुई "${eventLabel}" — आपके ${traitLabel} पैटर्न से इसका संबंध दिखता है (यह घटना अकेले नहीं, बल्कि आपके वर्तमान स्कोर के साथ मिलकर यह संकेत देती है)।`
    );
  }

  if (persistence > 50) {
    lines.push(
      `यह पैटर्न जीवन के एक से अधिक चरणों में दोहराया गया है, जो दिखाता है कि यह एक अस्थायी प्रतिक्रिया नहीं बल्कि एक गहरी, समय के साथ बनी हुई आदत हो सकती है।`
    );
  }

  lines.push(
    "ध्यान दें: यह घटना और पैटर्न के बीच एक सहसंबंध दिखाता है, कारण नहीं — यह नहीं कहा जा सकता कि घटना ने ही यह पैटर्न बनाया, केवल यह कि दोनों एक साथ दिखते हैं।"
  );

  return { key: "karmic-timeline", title: "कर्मिक टाइमलाइन विश्लेषण", body: lines.join("\n\n") };
}

function buildNarrativePatternSection(features: NarrativeFeatures): KMReportSection | null {
  if (!features.matchedThemes.length) return null;

  const labels: Record<string, string> = {
    fearSignals: "भय से जुड़े संकेत",
    controlSignals: "नियंत्रण की आवश्यकता",
    victimLanguage: "पीड़ित-भाव की भाषा",
    resentmentMarkers: "नाराज़गी के संकेत",
    dependencyMarkers: "निर्भरता के संकेत",
    shameMarkers: "शर्म/आत्म-दोष के संकेत",
  };

  const lines = [
    "आपने अपनी समस्या के बारे में जो लिखा, उसमें ये पैटर्न दिखे (यह एक सरल शब्द-आधारित विश्लेषण है, गहन भाषा-विश्लेषण नहीं — इसे एक संकेत के रूप में लें, अंतिम निष्कर्ष के रूप में नहीं):",
    features.matchedThemes.map((t) => `• ${labels[t] || t}`).join("\n"),
  ];

  return { key: "narrative-pattern", title: "नैरेटिव पैटर्न विश्लेषण", body: lines.join("\n\n") };
}

function buildKundliReflectionSection(positions: KundliPositions, birthDateISO: string): { section: KMReportSection; summary: ReturnType<typeof summarizeKundli> } {
  const summary = summarizeKundli(positions, birthDateISO);
  const section: KMReportSection = { key: "kundli-reflection", title: "कुंडली प्रतिबिंब (Kundli Reflection)", body: buildKundliReflectionText(summary) };
  return { section, summary };
}

function buildJainLensSection(jainLens: string): KMReportSection {
  return { key: "jain-reflection", title: "जैन दृष्टिकोण", body: jainLens };
}

function buildPsychLensSection(psychLens: string): KMReportSection {
  const body = [
    psychLens,
    "ध्यान दें: यह एक उपयोगी समानांतर दृष्टिकोण है, क्लीनिकल निदान नहीं। यदि यह पैटर्न आपके जीवन में गहरी पीड़ा का कारण बन रहा है, तो किसी योग्य काउंसलर से बात करना एक सार्थक अगला कदम हो सकता है।",
  ].join("\n\n");
  return { key: "psych-interpretation", title: "मनोवैज्ञानिक व्याख्या", body };
}

function buildHealingRoadmapSection(healingPath: string, secondaryNote?: string): KMReportSection {
  const body = secondaryNote ? [healingPath, secondaryNote].join("\n\n") : healingPath;
  return { key: "healing-roadmap", title: "उपचार मार्ग (Healing Roadmap)", body };
}

function buildPracticePrescriptionSection(
  practices: KMReport["practices"]
): KMReportSection {
  if (!practices.length) {
    return {
      key: "practice-prescription",
      title: "व्यक्तिगत जैन अभ्यास योजना",
      body: "अभी आपकी प्रोफ़ाइल के लिए कोई विशेष अभ्यास सुझाव उपलब्ध नहीं है। हमारी जाप लाइब्रेरी देखें और अपने लिए उपयुक्त जाप चुनें।",
    };
  }

  const primary = practices[0];
  const secondary = practices[1];
  const rest = practices.slice(2);

  const lines: string[] = [
    "यह 21-दिवसीय योजना आपकी विशिष्ट प्रोफ़ाइल के लिए सुझाए गए अभ्यासों को क्रमबद्ध करती है — एक सामान्य सूची नहीं, बल्कि आपके स्कोर के अनुसार बनाई गई।",
    [
      `सप्ताह 1 (दिन 1-7): "${primary.practice.practiceName}" को प्रतिदिन अपनाएं — ${primary.reason}।`,
      primary.linkedJapTitleHi ? `इसके लिए "${primary.linkedJapTitleHi}" जाप का उपयोग करें।` : null,
    ].filter(Boolean).join(" "),
  ];

  if (secondary) {
    lines.push(
      [
        `सप्ताह 2 (दिन 8-14): "${primary.practice.practiceName}" जारी रखें, और साथ में "${secondary.practice.practiceName}" जोड़ें — ${secondary.reason}।`,
        secondary.linkedJapTitleHi ? `इसके लिए "${secondary.linkedJapTitleHi}" जाप उपयुक्त रहेगा।` : null,
      ].filter(Boolean).join(" ")
    );
  }

  const week3Names = rest.map((p) => p.practice.practiceName).join(", ");
  lines.push(
    `सप्ताह 3 (दिन 15-21): पहले दोनों अभ्यासों को जारी रखते हुए${week3Names ? `, साथ में ${week3Names} को भी शामिल करें` : ""}, और हर दिन के अंत में 2-3 मिनट यह लिखें कि आज आपका प्रमुख पैटर्न कब सक्रिय हुआ और आपने उस क्षण में क्या किया।`
  );

  lines.push(
    "21 दिन के बाद यह जानना ज़्यादा महत्वपूर्ण है कि आपने अपने पैटर्न को कितनी बार पहचाना, न कि यह कि पैटर्न पूरी तरह बदल गया — स्थायी बदलाव समय लेता है, और यह सिर्फ एक शुरुआत है।"
  );

  return { key: "practice-prescription", title: "व्यक्तिगत जैन अभ्यास योजना", body: lines.join("\n\n") };
}

export interface GenerateReportInput {
  sessionId: string;
  primaryScores: PrimaryScores;
  confidence: number;
  reliability: number;
  experienceLevel: KMDifficulty;
  timelineEvents?: KMTimelineEvent[];
  narrativeFeatures?: NarrativeFeatures;
  kundliPositions?: KundliPositions;
  kundliBirthDateISO?: string;
}

export async function generateReport(input: GenerateReportInput): Promise<KMReport> {
  const { sessionId, primaryScores, confidence, reliability, experienceLevel, timelineEvents, narrativeFeatures, kundliPositions, kundliBirthDateISO } = input;
  const matches = matchArchetypes(primaryScores);
  const primaryMatch = matches[0];
  const secondaryCandidates = matches.slice(1, 3);
  const archetype = primaryMatch.archetype;
  const [dominantTrait] = topTraits(primaryScores, 1);

  const practices = await recommendPractices({ primaryScores, experienceLevel });

  let secondaryNote: string | undefined;
  if (secondaryCandidates[0] && secondaryCandidates[0].score >= primaryMatch.score - 8) {
    secondaryNote = `आपकी प्रोफ़ाइल "${secondaryCandidates[0].archetype.nameHi}" आर्किटाइप से भी काफी मेल खाती है — वास्तविक जीवन में अक्सर एक से अधिक पैटर्न साथ-साथ सक्रिय रहते हैं।`;
  }

  const sections: KMReportSection[] = [
    buildDominantTraitsSection(primaryScores),
    buildShadowTraitsSection(primaryScores),
  ];

  let kundliSummary: ReturnType<typeof summarizeKundli> | undefined;
  if (kundliPositions && kundliBirthDateISO) {
    const { section, summary } = buildKundliReflectionSection(kundliPositions, kundliBirthDateISO);
    sections.push(section);
    kundliSummary = summary;
  }

  sections.push(
    buildArchetypeSection(archetype.nameHi, archetype.description, archetype.strengths, archetype.weaknesses),
    buildTriggerMapSection(archetype.triggerMap),
    buildEmotionalLoopSection(archetype.karmicLoop)
  );

  const timelineSection = timelineEvents?.length
    ? buildKarmicTimelineSection(timelineEvents, primaryScores, dominantTrait)
    : null;
  if (timelineSection) sections.push(timelineSection);

  const narrativeSection = narrativeFeatures ? buildNarrativePatternSection(narrativeFeatures) : null;
  if (narrativeSection) sections.push(narrativeSection);

  sections.push(
    buildJainLensSection(archetype.jainLens),
    buildPsychLensSection(archetype.psychLens),
    buildHealingRoadmapSection(archetype.healingPath, secondaryNote),
    buildPracticePrescriptionSection(practices)
  );

  // Report generation is template-only by design — no LLM/API calls, so no
  // per-report cost and nothing that depends on an external service being
  // up. generatedBy is kept on the type for forward-compatibility, but this
  // function only ever produces "template".
  const generatedBy: "template" | "ai-enhanced" = "template";

  return {
    sessionId,
    primaryScores,
    confidence,
    reliability,
    archetype,
    secondaryArchetypeCandidates: secondaryCandidates,
    practices,
    sections,
    kundli: kundliSummary
      ? {
          ascendantRashiHi: kundliSummary.ascendantRashiHi,
          moonRashiHi: kundliSummary.moonRashiHi,
          sunRashiHi: kundliSummary.sunRashiHi,
          moonNakshatraHi: kundliSummary.moonNakshatraHi,
          moonNakshatraPada: kundliSummary.moonNakshatraPada,
          planetPlacements: kundliSummary.planetPlacements,
          mahadashas: kundliSummary.mahadashas,
          calculationNote: kundliSummary.calculationNote,
        }
      : undefined,
    generatedBy,
    createdAt: new Date().toISOString(),
  };
}

export { computeSecondaryScores };
