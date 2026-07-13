/**
 * JAIN PANCHANG CALCULATOR — Complete Edition
 * Jean Meeus Astronomical Algorithms
 * Includes: Tithi, Nakshatra, Yoga, Karana, Vaar, Hindu Month
 * Brahma Muhurta Rule: Tithi calculated at 4:30 AM IST (Jain tradition)
 * Choghadiya: Auspicious time periods (Digambar Jain adaptation)
 */

const RAD = Math.PI / 180;

export function julianDay(year: number, month: number, day: number, hour = 4.5): number {
  if (month <= 2) { year--; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716))
       + Math.floor(30.6001 * (month + 1))
       + day + (hour / 24) + B - 1524.5;
}

function T(jd: number): number { return (jd - 2451545.0) / 36525; }

export function sunLongitude(jd: number): number {
  const t = T(jd);
  const L0 = (280.46646 + 36000.76983 * t) % 360;
  const M  = (357.52911 + 35999.05029 * t) % 360;
  const C  = (1.914602 - 0.004817 * t) * Math.sin(M * RAD)
           + (0.019993 - 0.000101 * t) * Math.sin(2 * M * RAD)
           + 0.000289 * Math.sin(3 * M * RAD);
  let sun = (L0 + C) % 360;
  if (sun < 0) sun += 360;
  return sun;
}

export function moonLongitude(jd: number): number {
  const t = T(jd);
  const Lp = (218.3165 + 481267.8813 * t) % 360;
  const D  = (297.8502 + 445267.1115 * t) % 360;
  const M  = (357.5291 + 35999.0503 * t) % 360;
  const Mp = (134.9634 + 477198.8676 * t) % 360;
  const F  = (93.2721  + 483202.0175 * t) % 360;
  let moon = Lp
    + 6.2888 * Math.sin(Mp * RAD)
    + 1.2740 * Math.sin((2*D - Mp) * RAD)
    + 0.6583 * Math.sin(2*D * RAD)
    + 0.2136 * Math.sin(2*Mp * RAD)
    - 0.1851 * Math.sin(M * RAD)
    - 0.1143 * Math.sin(2*F * RAD)
    + 0.0588 * Math.sin((2*D - 2*Mp) * RAD)
    + 0.0572 * Math.sin((2*D - M - Mp) * RAD)
    + 0.0533 * Math.sin((2*D + Mp) * RAD)
    - 0.0458 * Math.sin((M - Mp) * RAD)
    + 0.0401 * Math.sin((M + Mp) * RAD);
  moon = moon % 360;
  if (moon < 0) moon += 360;
  return moon;
}

// ══════════════════════════════════════════════════════════
// PANCHANG NAMES
// ══════════════════════════════════════════════════════════
const TITHI_HI = [
  "प्रतिपदा","द्वितीया","तृतीया","चतुर्थी","पंचमी",
  "षष्ठी","सप्तमी","अष्टमी","नवमी","दशमी",
  "एकादशी","द्वादशी","त्रयोदशी","चतुर्दशी","पूर्णिमा",
  "प्रतिपदा","द्वितीया","तृतीया","चतुर्थी","पंचमी",
  "षष्ठी","सप्तमी","अष्टमी","नवमी","दशमी",
  "एकादशी","द्वादशी","त्रयोदशी","चतुर्दशी","अमावस्या",
];
const TITHI_EN = [
  "Pratipada","Dvitiya","Tritiya","Chaturthi","Panchami",
  "Shashti","Saptami","Ashtami","Navami","Dashami",
  "Ekadashi","Dwadashi","Trayodashi","Chaturdashi","Purnima",
  "Pratipada","Dvitiya","Tritiya","Chaturthi","Panchami",
  "Shashti","Saptami","Ashtami","Navami","Dashami",
  "Ekadashi","Dwadashi","Trayodashi","Chaturdashi","Amavasya",
];
const NAKSHATRA_HI = [
  "अश्विनी","भरणी","कृत्तिका","रोहिणी","मृगशिरा",
  "आर्द्रा","पुनर्वसु","पुष्य","आश्लेषा","मघा",
  "पूर्व फाल्गुनी","उत्तर फाल्गुनी","हस्त","चित्रा","स्वाति",
  "विशाखा","अनुराधा","ज्येष्ठा","मूल","पूर्वाषाढ़ा",
  "उत्तराषाढ़ा","श्रवण","धनिष्ठा","शतभिषा","पूर्व भाद्रपद",
  "उत्तर भाद्रपद","रेवती",
];
const NAKSHATRA_EN = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashira",
  "Ardra","Punarvasu","Pushya","Ashlesha","Magha",
  "Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati",
  "Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha",
  "Uttara Ashadha","Shravana","Dhanishtha","Shatabhisha","Purva Bhadrapada",
  "Uttara Bhadrapada","Revati",
];
const YOGA_NAMES = [
  "Vishkambha","Priti","Ayushman","Saubhagya","Shobhana",
  "Atiganda","Sukarman","Dhriti","Shula","Ganda",
  "Vriddhi","Dhruva","Vyaghata","Harshana","Vajra",
  "Siddhi","Vyatipata","Variyan","Parigha","Shiva",
  "Siddha","Sadhya","Shubha","Shukla","Brahma","Indra","Vaidhriti",
];
const AMANTA_HI = [
  "चैत्र","वैशाख","ज्येष्ठ","आषाढ़","श्रावण","भाद्रपद",
  "आसौज (अश्विन)","कार्तिक","मार्गशीर्ष","पौष","माघ","फाल्गुन",
];
const AMANTA_EN = [
  "Chaitra","Vaishakha","Jyeshtha","Ashadha","Shravana","Bhadrapada",
  "Ashwin","Kartika","Margashirsha","Paush","Magha","Phalguna",
];
const VAAR_HI = ["रविवार","सोमवार","मंगलवार","बुधवार","गुरुवार","शुक्रवार","शनिवार"];
const VAAR_EN = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

// ══════════════════════════════════════════════════════════
// CHOGHADIYA — Digambar Jain auspicious time periods
// ══════════════════════════════════════════════════════════
export const CHOGHADIYA_TYPES = {
  Amrit: { hi:"अमृत",   color:"#FFD700", desc:"सर्वश्रेष्ठ — सभी शुभ कार्यों के लिए उत्तम", auspicious:true,  rating:5 },
  Shubh: { hi:"शुभ",    color:"#4CAF50", desc:"शुभ — पूजा, विवाह, व्रत प्रारंभ के लिए",     auspicious:true,  rating:4 },
  Labh:  { hi:"लाभ",    color:"#2196F3", desc:"लाभकारी — शिक्षा, व्यापार, अध्ययन हेतु",      auspicious:true,  rating:3 },
  Char:  { hi:"चर",     color:"#00BCD4", desc:"चर — यात्रा और सामायिक के लिए उत्तम",         auspicious:true,  rating:2 },
  Udveg: { hi:"उद्वेग", color:"#FF9800", desc:"उद्वेग — सरकारी कार्य हेतु; अन्य वर्जित",    auspicious:false, rating:1 },
  Kaal:  { hi:"काल",    color:"#F44336", desc:"काल — वर्जित, शुभ कार्य न करें",              auspicious:false, rating:0 },
  Rog:   { hi:"रोग",    color:"#9C27B0", desc:"रोग — वर्जित, केवल शत्रु-विजय हेतु",         auspicious:false, rating:0 },
} as const;
type ChogType = keyof typeof CHOGHADIYA_TYPES;

// ── Verified against Drikpanchang.com (May 27 2026 = Wednesday) ──
// Day sequence (7 elements, circular): UdYog→Char→Labh→Amrit→Kaal→Shubh→Rog
const DAY_SEQ:   ChogType[] = ["Udveg","Char","Labh","Amrit","Kaal","Shubh","Rog"];
// Night sequence (7 elements, circular): Shubh→Amrit→Char→Rog→Kaal→Labh→Udveg
const NIGHT_SEQ: ChogType[] = ["Shubh","Amrit","Char","Rog","Kaal","Labh","Udveg"];

// Starting index in DAY_SEQ by weekday (0=Sun,1=Mon,...6=Sat)
// Sun=Udveg(0), Mon=Amrit(3), Tue=Rog(6), Wed=Labh(2), Thu=Shubh(5), Fri=Char(1), Sat=Kaal(4)
const DAY_START   = [0, 3, 6, 2, 5, 1, 4];
// Starting index in NIGHT_SEQ by weekday
// Sun=Shubh(0), Mon=Char(2), Tue=Kaal(4), Wed=Udveg(6), Thu=Amrit(1), Fri=Rog(3), Sat=Labh(5)
const NIGHT_START = [0, 2, 4, 6, 1, 3, 5];

export interface ChoghadiyaSlot {
  name:       ChogType;
  nameHi:     string;
  color:      string;
  startTime:  string; // "HH:MM"
  endTime:    string;
  auspicious: boolean;
  rating:     number;
  isBrahmaMuhurta?: boolean;
  isPratikarman?: boolean;
}

function formatTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}

/** Calculate Choghadiya for a given date */
export function calculateChoghadiya(
  vaarNum: number,    // 0=Sun…6=Sat
  sunriseMins = 360,  // minutes from midnight (6:00 AM = 360)
  sunsetMins  = 1080, // (6:00 PM = 1080)
): { day: ChoghadiyaSlot[]; night: ChoghadiyaSlot[] } {
  const dayLen   = sunsetMins - sunriseMins;
  const nightLen = 24*60 - dayLen;
  const daySlot  = dayLen / 8;
  const nightSlot = nightLen / 8;

  // ── Day Choghadiya (sunrise → sunset, 8 slots) ──────────────
  const dayStartIdx = DAY_START[vaarNum];
  const day: ChoghadiyaSlot[] = [];
  for (let i = 0; i < 8; i++) {
    const name = DAY_SEQ[(dayStartIdx + i) % 7];
    const type = CHOGHADIYA_TYPES[name];
    const st   = sunriseMins + i * daySlot;
    const en   = st + daySlot;
    day.push({
      name, nameHi:type.hi, color:type.color,
      startTime: formatTime(Math.round(st)),
      endTime:   formatTime(Math.round(en)),
      auspicious: type.auspicious, rating: type.rating,
    });
  }

  // ── Night Choghadiya (sunset → sunrise, 8 slots) ────────────
  const nightStartIdx = NIGHT_START[vaarNum];
  const night: ChoghadiyaSlot[] = [];
  // Brahma Muhurta special slot comes first (96 min before sunrise)
  const brahmaMins = sunriseMins - 96;
  night.push({
    name:"Amrit", nameHi:"ब्रह्म मुहूर्त", color:"#AB47BC",
    startTime: formatTime(Math.round(brahmaMins < 0 ? brahmaMins + 24*60 : brahmaMins)),
    endTime:   formatTime(sunriseMins),
    auspicious:true, rating:5, isBrahmaMuhurta:true,
  });
  for (let i = 0; i < 8; i++) {
    const name = NIGHT_SEQ[(nightStartIdx + i) % 7];
    const type = CHOGHADIYA_TYPES[name];
    const st   = sunsetMins + i * nightSlot;
    const en   = st + nightSlot;
    const stM  = Math.round(st) % (24*60);
    const enM  = Math.round(en) % (24*60);
    night.push({
      name, nameHi:type.hi, color:type.color,
      startTime: formatTime(stM < 0 ? stM + 24*60 : stM),
      endTime:   formatTime(enM < 0 ? enM + 24*60 : enM),
      auspicious: type.auspicious, rating: type.rating,
    });
  }

  return { day, night };
}

// ══════════════════════════════════════════════════════════
// MAIN PANCHANG CALCULATION
// ══════════════════════════════════════════════════════════
export interface PanchangData {
  date: string;
  gregorian: string;
  vaar: { en:string; hi:string; num:number };
  tithi: { number:number; name_en:string; name_hi:string; paksha:"Shukla"|"Krishna"; paksha_hi:string };
  nakshatra: { number:number; name_en:string; name_hi:string };
  yoga: { number:number; name:string };
  hindu_month: { number:number; name_en:string; name_hi:string };
  sun_longitude: number;
  moon_longitude: number;
  is_ekadashi:    boolean;
  is_purnima:     boolean;
  is_amavasya:    boolean;
  is_chaturdashi: boolean;
  is_ashtami:     boolean;
  jain_significance: string | null;
  // Jain Brahma Muhurta note
  brahma_muhurta_tithi_note: string | null;
  choghadiya: ReturnType<typeof calculateChoghadiya>;
}

export function calculatePanchang(year: number, month: number, day: number, hour = 4.5): PanchangData {
  // Use 4:30 AM IST for Jain Brahma Muhurta tithi rule
  const jdBrahma = julianDay(year, month, day, 4.5);
  const jdSunrise = julianDay(year, month, day, 6.0);

  const sunL  = sunLongitude(jdBrahma);
  const moonL = moonLongitude(jdBrahma);
  
  // Tithi at Brahma Muhurta
  const diff     = ((moonL - sunL) + 360) % 360;
  const tithiNum = Math.floor(diff / 12) + 1;
  const isShukla = tithiNum <= 15;
  const paksha   = isShukla ? "Shukla" : "Krishna";
  
  // Check if tithi changes between Brahma Muhurta and sunrise
  const sunLSunrise  = sunLongitude(jdSunrise);
  const moonLSunrise = moonLongitude(jdSunrise);
  const diffSunrise  = ((moonLSunrise - sunLSunrise) + 360) % 360;
  const tithiSunrise = Math.floor(diffSunrise / 12) + 1;
  
  const tithiChangedAfterBrahma = tithiNum !== tithiSunrise;
  
  const nakNum  = Math.floor(moonL / (360/27)) + 1;
  const yogaSum = (sunL + moonL) % 360;
  const yogaNum = Math.floor(yogaSum / (360/27)) + 1;
  const sunRashi = Math.floor(sunL / 30);
  const monthIndex = sunRashi % 12;
  
  const vaarNum = ((Math.floor(jdBrahma + 1.5)) % 7);
  
  const isEkadashi    = tithiNum === 11 || tithiNum === 26;
  const isPurnima     = tithiNum === 15;
  const isAmavasya    = tithiNum === 30;
  const isChaturdashi = tithiNum === 14 || tithiNum === 29;
  const isAshtami     = tithiNum === 8  || tithiNum === 23;

  let jainSig: string | null = null;
  if (isPurnima)     jainSig = "🌕 पूर्णिमा — पोषध व्रत का दिन";
  else if (isAmavasya)    jainSig = "🌑 अमावस्या — पोषध व्रत का दिन";
  else if (isChaturdashi && isShukla) jainSig = "🙏 शुक्ल चतुर्दशी — गुणस्थान पारनी तिथि";
  else if (isChaturdashi) jainSig = "🙏 कृष्ण चतुर्दशी — पोषध का दिन";
  else if (isEkadashi)    jainSig = "⭐ एकादशी — व्रत और साधना का दिन";
  else if (isAshtami)     jainSig = "🌟 अष्टमी — अष्टकर्म नाशनी तिथि";

  const brahmaMuhurtaNote = tithiChangedAfterBrahma
    ? `⚠️ जैन परंपरा: इस दिन ब्रह्म मुहूर्त पर ${TITHI_HI[tithiNum-1]}, परंतु सूर्योदय पर ${TITHI_HI[tithiSunrise-1]} है। जैन इस ${TITHI_HI[tithiNum-1]} को आज मानेंगे।`
    : null;

  const dateStr = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

  // Approximate sunrise/sunset in IST minutes
  // More accurate: varies ±60 min seasonally, but 360/1080 is good average for India
  const sunriseMins = 360; // 6:00 AM IST average
  const sunsetMins  = 1080; // 6:00 PM IST average
  const choghadiya  = calculateChoghadiya(vaarNum, sunriseMins, sunsetMins);

  return {
    date: dateStr,
    gregorian: new Date(year, month-1, day).toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"}),
    vaar:       { en:VAAR_EN[vaarNum], hi:VAAR_HI[vaarNum], num:vaarNum },
    tithi: {
      number:   tithiNum,
      name_en:  TITHI_EN[tithiNum-1],
      name_hi:  TITHI_HI[tithiNum-1],
      paksha,
      paksha_hi: isShukla ? "शुक्ल पक्ष" : "कृष्ण पक्ष",
    },
    nakshatra: { number:nakNum, name_en:NAKSHATRA_EN[nakNum-1]||"", name_hi:NAKSHATRA_HI[nakNum-1]||"" },
    yoga:      { number:yogaNum, name:YOGA_NAMES[yogaNum-1]||"" },
    hindu_month: { number:monthIndex+1, name_en:AMANTA_EN[monthIndex], name_hi:AMANTA_HI[monthIndex] },
    sun_longitude:  sunL,
    moon_longitude: moonL,
    is_ekadashi: isEkadashi, is_purnima: isPurnima, is_amavasya: isAmavasya,
    is_chaturdashi: isChaturdashi, is_ashtami: isAshtami,
    jain_significance: jainSig,
    brahma_muhurta_tithi_note: brahmaMuhurtaNote,
    choghadiya,
  };
}

export function todayPanchang(): PanchangData {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 3600000);
  return calculatePanchang(ist.getFullYear(), ist.getMonth()+1, ist.getDate(), 4.5);
}

export function upcomingHighlights(days = 45): PanchangData[] {
  const result: PanchangData[] = [];
  const now = new Date();
  for (let i = 0; i <= days; i++) {
    const d = new Date(now.getTime() + i * 86400000);
    const p = calculatePanchang(d.getFullYear(), d.getMonth()+1, d.getDate(), 4.5);
    if (p.jain_significance || p.is_purnima || p.is_amavasya || p.is_ekadashi || p.is_ashtami) {
      result.push(p);
    }
  }
  return result;
}
