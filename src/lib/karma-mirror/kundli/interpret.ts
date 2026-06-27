import { getNakshatra, getRashi, computeMahadasha } from "./dasha";
import type { KundliPositions } from "./ephemeris";

/**
 * This layer's entire job is to make sure the kundli's output reads as
 * tendency, never destiny. Per the architecture decisions earlier in
 * this build: kundli is shown as its own clearly-labeled context section,
 * not numerically merged into the psychometric/timeline/narrative scores.
 * No claim here should ever read as a prediction.
 */

const RASHI_NAMES_EN = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const PLANET_LABELS_HI: Record<string, string> = {
  sun: "सूर्य", moon: "चंद्र", mars: "मंगल", mercury: "बुध",
  jupiter: "गुरु", venus: "शुक्र", saturn: "शनि", rahu: "राहु", ketu: "केतु",
};

const MAHADASHA_LORD_LABELS_HI: Record<string, string> = {
  Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगल", Mercury: "बुध",
  Jupiter: "गुरु", Venus: "शुक्र", Saturn: "शनि", Rahu: "राहु", Ketu: "केतु",
};

export interface KundliSummary {
  ascendantRashiHi: string;
  moonRashiHi: string;
  sunRashiHi: string;
  moonNakshatraHi: string;
  moonNakshatraPada: number;
  currentMahadashaLord: string;
  planetPlacements: { planetHi: string; rashiHi: string; nakshatraHi: string }[];
  mahadashas: { lord: string; lordHi: string; startDate: string; endDate: string; isCurrent: boolean }[];
  calculationNote: string;
}

const CALCULATION_NOTE_HI =
  "यह कुंडली गणना वास्तविक खगोलीय गणना (VSOP87 ग्रह सिद्धांत) पर आधारित है, अनुमानित नहीं। लाहिड़ी अयनांश की गणना एक रेखीय सन्निकटन से की गई है — यह स्वीस एफेमेरिस जैसे व्यावसायिक सॉफ़्टवेयर जितनी सटीक नहीं है, विशेषकर 100 वर्ष से अधिक पुरानी जन्मतिथियों के लिए। राहु/केतु की गणना मध्यमान (mean) नोड पद्धति से की गई है।";

export function summarizeKundli(positions: KundliPositions, birthDateISO: string): KundliSummary {
  const ascendantRashi = getRashi(positions.ascendant.siderealLon);
  const moonRashi = getRashi(positions.moon.siderealLon);
  const sunRashi = getRashi(positions.sun.siderealLon);
  const moonNakshatra = getNakshatra(positions.moon.siderealLon);

  const mahadashas = computeMahadasha(positions.moon.siderealLon, birthDateISO);
  const current = mahadashas.find((m) => m.isCurrent) || mahadashas[mahadashas.length - 1];

  const planetKeys = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu", "ketu"] as const;
  const planetPlacements = planetKeys.map((key) => {
    const lon = positions[key].siderealLon;
    return {
      planetHi: PLANET_LABELS_HI[key],
      rashiHi: getRashi(lon).nameHi,
      nakshatraHi: getNakshatra(lon).nameHi,
    };
  });

  return {
    ascendantRashiHi: ascendantRashi.nameHi,
    moonRashiHi: moonRashi.nameHi,
    sunRashiHi: sunRashi.nameHi,
    moonNakshatraHi: moonNakshatra.nameHi,
    moonNakshatraPada: moonNakshatra.pada,
    currentMahadashaLord: current.lord,
    mahadashas: mahadashas.map((m) => ({
      lord: m.lord,
      lordHi: MAHADASHA_LORD_LABELS_HI[m.lord] || m.lord,
      startDate: m.startDate,
      endDate: m.endDate,
      isCurrent: m.isCurrent,
    })),
    planetPlacements,
    calculationNote: CALCULATION_NOTE_HI,
  };
}

/** Builds the report-facing "Kundli Reflection" section — context only,
 * never merged numerically into trait scores, always framed as
 * tendency. */
export function buildKundliReflectionText(summary: KundliSummary): string {
  const lines = [
    `आपकी कुंडली में लग्न (ascendant) ${summary.ascendantRashiHi} राशि में है, चंद्रमा ${summary.moonRashiHi} राशि और ${summary.moonNakshatraHi} नक्षत्र (चरण ${summary.moonNakshatraPada}) में, तथा सूर्य ${summary.sunRashiHi} राशि में है।`,
    `वर्तमान में आपकी ${MAHADASHA_LORD_LABELS_HI[summary.currentMahadashaLord] || summary.currentMahadashaLord} महादशा चल रही है।`,
    "यह जानकारी पारंपरिक ज्योतिष की दृष्टि से एक प्रवृत्ति-संकेतक है — यह कोई निश्चित भविष्यवाणी या नियति नहीं है। एक ही कुंडली वाले दो व्यक्ति परवरिश, अनुभव और व्यक्तिगत चुनाव के कारण बिल्कुल अलग तरह से जीवन जी सकते हैं। इसे अपने मनोवैज्ञानिक मूल्यांकन और जीवन-अनुभव के साथ एक अतिरिक्त, पूरक दृष्टिकोण के रूप में लें, अंतिम सत्य के रूप में नहीं।",
    summary.calculationNote,
  ];
  return lines.join("\n\n");
}

export { RASHI_NAMES_EN };
