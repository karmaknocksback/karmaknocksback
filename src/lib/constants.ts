export const SITE = {
  name: "KarmaKnocksBack",
  tagline: "आत्मा से परमात्मा की ओर",
  description:
    "जैन जाप, नवग्रह शांति, तीर्थंकर जाप, महामृत्युंजय मंत्र, नवकार पद और 64 ऋद्धि मंत्र — सब एक ही स्थान पर। प्रमाणिक जैन ज्ञान और आध्यात्मिक शांति।",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://karmaknocksback.com",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "connect@karmaknocksback.com",
};

export const NAV_LINKS = [
  { label: "Home", labelHi: "होम", href: "/" },
  { label: "Jap Library", labelHi: "जाप लाइब्रेरी", href: "/jap-library" },
  { label: "Jaap Directory", labelHi: "जाप निर्देशिका", href: "/jain-jaap-directory" },
  { label: "Knowledge Hub", labelHi: "ज्ञान केंद्र", href: "/knowledge-hub" },
  { label: "Karma Mirror", labelHi: "Karma Mirror", href: "/karma-mirror" },
  { label: "Shop", labelHi: "शॉप", href: "/shop" },
  { label: "Services", labelHi: "सेवाएँ", href: "/services" },
  { label: "Community", labelHi: "समुदाय", href: "/community" },
  { label: "About", labelHi: "परिचय", href: "/about" },
  { label: "Contact", labelHi: "संपर्क", href: "/contact" },
];

export const SOCIAL_LINKS = {
  youtube: "https://youtube.com/@karmaknocksback?si=lCOPbimQA-kfAkRG",
  instagram: "https://www.instagram.com/karmaknocksback?igsh=cmkxaW9kMDhsNWsy",
  whatsappGroup:
    "https://chat.whatsapp.com/B67KvvwGwTmHq3h0SsrwCS?mode=gi_t",
  whatsappChannel: "https://whatsapp.com/channel/0029Vb6xndRI1rcgu6sfJA1j",
  facebook: "https://www.facebook.com/share/17y9tXYnbg/",
};

export const JAP_CATEGORIES = [
  "Navgrah",
  "Healing",
  "Protection",
  "Tirthankar",
  "Mantra",
  "Bhajan",
  "Katha",
  "Philosophy",
  "Stotra",
  "Mangalacharan",
  "Aarti",
  "Bhavna",
] as const;

export const JAP_CATEGORY_LABELS_HI: Record<string, string> = {
  Navgrah: "नवग्रह",
  Healing: "उपचार",
  Protection: "रक्षा",
  Tirthankar: "तीर्थंकर",
  Mantra: "मंत्र",
  Bhajan: "भजन",
  Katha: "कथा",
  Philosophy: "जैन दर्शन",
  Stotra: "स्तोत्र",
  Mangalacharan: "मंगलाचरण",
  Aarti: "आरती",
  Bhavna: "भावना",
};

export const PLANETS = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
  "Rahu",
  "Ketu",
] as const;

export const PLANET_LABELS_HI: Record<string, string> = {
  Sun: "सूर्य",
  Moon: "चंद्र",
  Mars: "मंगल",
  Mercury: "बुध",
  Jupiter: "गुरु",
  Venus: "शुक्र",
  Saturn: "शनि",
  Rahu: "राहु",
  Ketu: "केतु",
};

export const DURATION_BUCKETS = [
  { label: "10 मिनट से कम", value: "under-10", min: 0, max: 10 },
  { label: "10–30 मिनट", value: "10-30", min: 10, max: 30 },
  { label: "30 मिनट से अधिक", value: "over-30", min: 30, max: Infinity },
] as const;

export const KNOWLEDGE_CATEGORIES = [
  "Swadhyay",
  "Samudghat",
  "Jain Philosophy",
  "Stories",
  "Kids Corner",
] as const;

export const KNOWLEDGE_CATEGORY_LABELS_HI: Record<string, string> = {
  Swadhyay: "स्वाध्याय",
  Samudghat: "समुद्घात",
  "Jain Philosophy": "जैन दर्शन",
  Stories: "जैन कथाएँ",
  "Kids Corner": "बाल कोना",
};

export const CUSTOM_JAP_PURPOSES = [
  "Navgrah issue",
  "Health",
  "Business",
  "Marriage",
  "Child",
  "Peace",
  "Other",
] as const;

export const VOICE_OPTIONS = ["Male", "Female", "Child", "No preference"] as const;

export const MUSIC_OPTIONS = [
  "Soft devotional",
  "Powerful mantra",
  "Instrumental",
  "Silent",
] as const;

export const DURATION_OPTIONS = ["5", "11", "21", "31"] as const;

export const URGENCY_OPTIONS = ["Normal", "Urgent"] as const;

export const SERVICES = [
  {
    slug: "custom-jap-production",
    title: "Custom Jap Production",
    titleHi: "कस्टम जाप निर्माण",
    description:
      "आपकी समस्या और उद्देश्य के अनुसार पूर्णतः वैयक्तिक जाप व मंत्र तैयार किया जाता है।",
    startingPrice: "₹1,100",
  },
  {
    slug: "ai-video-creation",
    title: "AI Video Creation",
    titleHi: "एआई वीडियो निर्माण",
    description: "दिव्य दृश्यों के साथ आध्यात्मिक एआई वीडियो का निर्माण।",
    startingPrice: "₹2,500",
  },
  {
    slug: "devotional-reels",
    title: "Devotional Reels",
    titleHi: "भक्ति रील्स",
    description: "सोशल मीडिया हेतु आकर्षक भक्तिमय शॉर्ट वीडियो रील्स।",
    startingPrice: "₹999",
  },
  {
    slug: "script-writing",
    title: "Script Writing",
    titleHi: "स्क्रिप्ट लेखन",
    description: "जैन शास्त्रों पर आधारित प्रमाणिक एवं सहज स्क्रिप्ट लेखन।",
    startingPrice: "₹799",
  },
  {
    slug: "voice-generation",
    title: "Voice Generation",
    titleHi: "वॉइस जनरेशन",
    description: "भावपूर्ण एआई व मानव स्वर में जाप व पाठ रिकॉर्डिंग।",
    startingPrice: "₹599",
  },
  {
    slug: "thumbnail-design",
    title: "Thumbnail Design",
    titleHi: "थंबनेल डिज़ाइन",
    description: "दिव्य व आकर्षक थंबनेल डिज़ाइन, हर प्लेटफ़ॉर्म के लिए उपयुक्त।",
    startingPrice: "₹299",
  },
  {
    slug: "seo-optimization",
    title: "SEO Optimization",
    titleHi: "एसईओ ऑप्टिमाइज़ेशन",
    description: "आध्यात्मिक चैनल व वेबसाइट हेतु संपूर्ण एसईओ रणनीति।",
    startingPrice: "₹1,499",
  },
] as const;
