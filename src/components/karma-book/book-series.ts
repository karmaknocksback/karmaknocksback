export interface BookMeta {
  id: string;
  title: string;
  titleHi: string;
  subtitle: string;
  description: string;
  emoji: string;
  coverBg: string;
  coverAccent: string;
  spineColor: string;
  ageGroup: string;
  pages: number;
  available: boolean;
  comingSoon?: string;
  character: string;
  color?: string;
}

export const BOOK_SERIES: BookMeta[] = [
  {
    id: "karma",
    color: "#FF6B6B",
    title: "Karma to Jaano",
    titleHi: "कर्म को जानो",
    subtitle: "कर्म की अनोखी दुनिया",
    description: "What is karma? Meet Chintu & Priya as they discover the magic of soul, 4 Kashaya monsters, the boat story, and the path to Moksha!",
    emoji: "✨",
    coverBg: "linear-gradient(135deg,#FF6B9D,#FF4081)",
    coverAccent: "#FFD700",
    spineColor: "#E91E8C",
    ageGroup: "5+",
    pages: 10,
    available: true,
    character: "🤖",
  },
  {
    id: "navkar",
    color: "#9C27B0",
    title: "Navkar Mantra Magic",
    titleHi: "नवकार मंत्र की जादू",
    subtitle: "सबसे शक्तिशाली मंत्र",
    description: "Discover the world's most powerful mantra! Who are the 5 Parmesthis? Why do we bow to them? Chintu learns the secret of Navkar!",
    emoji: "📿",
    coverBg: "linear-gradient(135deg,#00BCD4,#0097A7)",
    coverAccent: "#4CAF50",
    spineColor: "#006064",
    ageGroup: "5+",
    pages: 8,
    available: true,
    character: "🙏",
  },
  {
    id: "tirthankar",
    color: "#FF9800",
    title: "24 Tirthankars",
    titleHi: "24 तीर्थंकर",
    subtitle: "जैन धर्म के 24 देव",
    description: "Meet all 24 Tirthankars — from Adinath to Mahavir! Their special symbols, colors, and the amazing stories of their lives.",
    emoji: "🕉️",
    coverBg: "linear-gradient(135deg,#FF9800,#F57C00)",
    coverAccent: "#FF9800",
    spineColor: "#BF360C",
    ageGroup: "6+",
    pages: 12,
    available: true,
    character: "👑",
  },
  {
    id: "ahimsa",
    color: "#4CAF50",
    title: "Ahimsa — The Superpower",
    titleHi: "अहिंसा — महाशक्ति",
    subtitle: "प्रेम और करुणा की शक्ति",
    description: "Why is non-violence the greatest superpower? Real stories of how kindness to every creature — even ants! — transforms your soul.",
    emoji: "🕊️",
    coverBg: "linear-gradient(135deg,#43A047,#1B5E20)",
    coverAccent: "#00BCD4",
    spineColor: "#006064",
    ageGroup: "5+",
    pages: 8,
    available: true,
    character: "🦋",
  },
  {
    id: "paryushana",
    color: "#E91E63",
    title: "Paryushana Festival",
    titleHi: "पर्युषण पर्व",
    subtitle: "माफी और आत्मशुद्धि का पर्व",
    description: "The most important Jain festival! Why do we fast? What is Pratikraman? Priya celebrates Paryushana and learns to say sorry from the heart.",
    emoji: "🌸",
    coverBg: "linear-gradient(135deg,#CE93D8,#8E24AA)",
    coverAccent: "#E91E63",
    spineColor: "#880E4F",
    ageGroup: "5+",
    pages: 8,
    available: true,
    character: "🙏",
  },
  {
    id: "jain-stories",
    title: "Jain Stories for Kids",
    titleHi: "जैन बाल कथाएँ",
    subtitle: "नैतिक और प्रेरक कहानियाँ",
    description: "5 magical stories — the clever crow, the angry king, the patient monk, the kind merchant, and the little soul who found Moksha!",
    emoji: "📖",
    coverBg: "linear-gradient(135deg,#29B6F6,#0277BD)",
    coverAccent: "#FFCA28",
    spineColor: "#F57F17",
    ageGroup: "4+",
    pages: 10,
    available: false,
    comingSoon: "August 2026",
    character: "📚",
  },
];

export function getBook(id: string): BookMeta | undefined {
  return BOOK_SERIES.find(b => b.id === id);
}
