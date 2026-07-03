/**
 * Jap Library grouping — defines how japs are grouped when no search/filter is active.
 * Groups are shown in this order with a section heading + all matching japs.
 */
export const JAP_GROUPS = [
  {
    id: "navgrah",
    titleHi: "नवग्रह शांति जाप",
    titleEn: "Navgrah Shanti Jaap",
    descHi: "नौ ग्रहों की शांति के लिए विशेष जाप — राहु, केतु, शनि, मंगल व अन्य",
    emoji: "🪐",
    categories: ["Navgrah"],
    planets: [] as string[],
  },
  {
    id: "healing",
    titleHi: "रोग निवारक जाप",
    titleEn: "Healing & Health Jaap",
    descHi: "स्वास्थ्य लाभ, रोग मुक्ति व आरोग्य के लिए जाप",
    emoji: "💊",
    categories: ["Healing"],
    planets: [],
  },
  {
    id: "tirthankar",
    titleHi: "तीर्थंकर जाप",
    titleEn: "Tirthankar Jaap",
    descHi: "24 तीर्थंकरों की स्तुति व जाप",
    emoji: "🙏",
    categories: ["Tirthankar"],
    planets: [],
  },
  {
    id: "mantra",
    titleHi: "मंत्र जाप",
    titleEn: "Mantra Jaap",
    descHi: "नवकार मंत्र, महामृत्युंजय व अन्य शक्तिशाली मंत्र",
    emoji: "📿",
    categories: ["Mantra"],
    planets: [],
  },
  {
    id: "stotra",
    titleHi: "स्तोत्र / मंगलाचरण",
    titleEn: "Stotra & Mangalacharan",
    descHi: "भक्तामर स्तोत्र, मंगलाचरण व अन्य स्तुति",
    emoji: "✨",
    categories: ["Stotra", "Mangalacharan"],
    planets: [],
  },
  {
    id: "protection",
    titleHi: "रक्षा जाप",
    titleEn: "Protection Jaap",
    descHi: "भय निवारण, नकारात्मकता से रक्षा के लिए जाप",
    emoji: "🛡️",
    categories: ["Protection"],
    planets: [],
  },
  {
    id: "bhajan",
    titleHi: "भजन / आरती",
    titleEn: "Bhajan & Aarti",
    descHi: "जैन भजन, आरती व भावनापूर्ण भक्ति गीत",
    emoji: "🎵",
    categories: ["Bhajan", "Aarti"],
    planets: [],
  },
  {
    id: "katha",
    titleHi: "जैन कथा / दर्शन",
    titleEn: "Jain Katha & Philosophy",
    descHi: "जैन धर्म की प्रेरक कथाएँ, भावनाएँ व दर्शन",
    emoji: "📖",
    categories: ["Katha", "Philosophy", "Bhavna"],
    planets: [],
  },
];

// Returns group for a given category
export function getGroupForCategory(category: string): string | null {
  for (const group of JAP_GROUPS) {
    if (group.categories.includes(category)) return group.id;
  }
  return null;
}
