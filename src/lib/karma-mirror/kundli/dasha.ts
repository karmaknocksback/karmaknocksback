/**
 * Derives nakshatra/pada/rashi from sidereal longitudes, and computes the
 * Vimshottari Mahadasha/Antardasha sequence from the Moon's nakshatra at
 * birth — the standard, traditional method (not an invented shortcut).
 */

const RASHI_NAMES_HI = [
  "मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या",
  "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन",
];

const NAKSHATRA_NAMES_HI = [
  "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा",
  "पुनर्वसु", "पुष्य", "आश्लेषा", "मघा", "पूर्वा फाल्गुनी", "उत्तरा फाल्गुनी",
  "हस्त", "चित्रा", "स्वाति", "विशाखा", "अनुराधा", "ज्येष्ठा",
  "मूल", "पूर्वाषाढ़ा", "उत्तराषाढ़ा", "श्रवण", "धनिष्ठा", "शतभिषा",
  "पूर्वा भाद्रपद", "उत्तरा भाद्रपद", "रेवती",
];

/** Vimshottari dasha lord sequence and durations (years), keyed by the
 * nakshatra index (0-26) of the starting nakshatra — this is the fixed,
 * traditional assignment: each nakshatra's ruling planet starts the
 * dasha cycle from that nakshatra, cycling through all 9 in fixed order. */
const DASHA_SEQUENCE = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"] as const;
const DASHA_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};
const TOTAL_DASHA_YEARS = 120;

export interface NakshatraInfo {
  index: number; // 0-26
  nameHi: string;
  pada: 1 | 2 | 3 | 4;
}

export function getNakshatra(siderealLon: number): NakshatraInfo {
  const span = 360 / 27; // 13.3333...
  const index = Math.floor(siderealLon / span);
  const withinNakshatra = siderealLon - index * span;
  const pada = (Math.floor(withinNakshatra / (span / 4)) + 1) as 1 | 2 | 3 | 4;
  return { index, nameHi: NAKSHATRA_NAMES_HI[index], pada };
}

export interface RashiInfo {
  index: number; // 0-11
  nameHi: string;
}

export function getRashi(siderealLon: number): RashiInfo {
  const index = Math.floor(siderealLon / 30);
  return { index, nameHi: RASHI_NAMES_HI[index] };
}

export interface DashaPeriod {
  lord: string;
  startDate: string; // ISO date
  endDate: string;
  isCurrent: boolean;
}

export interface AntardashaPeriod extends DashaPeriod {
  mahadashaLord: string;
}

/** Computes the full Vimshottari Mahadasha sequence (all 9 periods across
 * 120 years) starting from the Moon's nakshatra at birth, with the
 * fraction of the starting dasha already elapsed at birth (based on how
 * far through that nakshatra the Moon was) correctly accounted for. */
export function computeMahadasha(moonSiderealLon: number, birthDateISO: string): DashaPeriod[] {
  const span = 360 / 27;
  const nakshatraIndex = Math.floor(moonSiderealLon / span);
  const fractionElapsed = (moonSiderealLon - nakshatraIndex * span) / span;

  const startLordIndex = nakshatraIndex % 9;
  const birthDate = new Date(birthDateISO);
  const now = new Date();

  // The dasha active at birth is partially elapsed — only the remaining
  // portion counts from the birth date forward.
  const firstLord = DASHA_SEQUENCE[startLordIndex];
  const firstLordFullYears = DASHA_YEARS[firstLord];
  const firstLordRemainingYears = firstLordFullYears * (1 - fractionElapsed);

  const periods: DashaPeriod[] = [];
  let cursor = new Date(birthDate);

  for (let i = 0; i < 9; i++) {
    const lord = DASHA_SEQUENCE[(startLordIndex + i) % 9];
    const years = i === 0 ? firstLordRemainingYears : DASHA_YEARS[lord];
    const start = new Date(cursor);
    const end = addYears(cursor, years);
    periods.push({
      lord,
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      isCurrent: now >= start && now < end,
    });
    cursor = end;
  }

  return periods;
}

/** Sub-periods (Antardasha) within a given Mahadasha — same proportional
 * subdivision method as the main sequence, scaled to the Mahadasha's
 * actual duration. */
export function computeAntardasha(mahadasha: DashaPeriod): AntardashaPeriod[] {
  const startIdx = DASHA_SEQUENCE.indexOf(mahadasha.lord as typeof DASHA_SEQUENCE[number]);
  const mahadashaYears = (new Date(mahadasha.endDate).getTime() - new Date(mahadasha.startDate).getTime()) / (365.25 * 86400 * 1000);
  const now = new Date();

  const periods: AntardashaPeriod[] = [];
  let cursor = new Date(mahadasha.startDate);

  for (let i = 0; i < 9; i++) {
    const lord = DASHA_SEQUENCE[(startIdx + i) % 9];
    const proportion = DASHA_YEARS[lord] / TOTAL_DASHA_YEARS;
    const years = mahadashaYears * proportion;
    const start = new Date(cursor);
    const end = addYears(cursor, years);
    periods.push({
      lord, mahadashaLord: mahadasha.lord,
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      isCurrent: now >= start && now < end,
    });
    cursor = end;
  }

  return periods;
}

function addYears(date: Date, years: number): Date {
  const ms = years * 365.25 * 86400 * 1000;
  return new Date(date.getTime() + ms);
}
