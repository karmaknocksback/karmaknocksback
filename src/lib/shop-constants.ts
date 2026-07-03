export const SHOP_CATEGORIES = [
  {
    id: "gemstones",
    nameHi: "💎 रत्न पत्थर",
    nameEn: "Certified Gemstones",
    desc: "IGI/GIA/Govt. Lab प्रमाणित रत्न",
    subcategories: ["yellow-sapphire","ruby","pearl","emerald","red-coral","hessonite","cats-eye","amethyst","sphatik"],
    subcategoryLabels: {
      "yellow-sapphire": "पुखराज (Yellow Sapphire)",
      "ruby": "माणिक (Ruby)",
      "pearl": "मोती (Pearl)",
      "emerald": "पन्ना (Emerald)",
      "red-coral": "मूंगा (Red Coral)",
      "hessonite": "गोमेद (Hessonite)",
      "cats-eye": "लहसुनिया (Cat's Eye)",
      "amethyst": "अमेथिस्ट",
      "sphatik": "स्फटिक (Clear Quartz)",
    },
    filters: {
      form: ["ring","pendant","loose-stone","bracelet"],
      formLabels: { ring:"अंगूठी", pendant:"लॉकेट", "loose-stone":"कच्चा पत्थर", bracelet:"कंगन" },
      certification: ["igi-certified","gia-certified","govt-lab","natural","lab-grown"],
      certLabels: { "igi-certified":"IGI Certified", "gia-certified":"GIA Certified", "govt-lab":"Govt. Lab", natural:"Natural", "lab-grown":"Lab Grown" },
    },
    premium: true,
  },
  {
    id: "mala",
    nameHi: "📿 जाप माला",
    nameEn: "Jaap Mala Collection",
    desc: "जाप के लिए विशेष माला संग्रह",
    subcategories: ["sandalwood","tulsi","sphatik","pearl-mala","navkar-mala","silver-mala","gift-mala"],
    subcategoryLabels: {
      "sandalwood": "चंदन माला", "tulsi": "तुलसी माला", "sphatik": "स्फटिक माला",
      "pearl-mala": "मोती माला", "navkar-mala": "नवकार माला", "silver-mala": "चाँदी माला",
      "gift-mala": "गिफ्ट बॉक्स माला",
    },
    filters: { form: [], formLabels: {}, certification: [], certLabels: {} },
  },
  {
    id: "puja",
    nameHi: "🪔 आरती / पूजा सामग्री",
    nameEn: "Aarti & Puja Essentials",
    desc: "पूजा थाली, दीया, अगरबत्ती",
    subcategories: ["thali","diya","incense-holder","ghanti","chandan","oil-lamp","daily-kit"],
    subcategoryLabels: {
      thali:"पूजा थाली", diya:"दीया सेट", "incense-holder":"अगरबत्ती स्टैंड",
      ghanti:"घंटी", chandan:"चंदन बॉक्स", "oil-lamp":"तेल दीप", "daily-kit":"Daily Pooja Kit",
    },
    filters: { form: [], formLabels: {}, certification: [], certLabels: {} },
  },
  {
    id: "jain-pooja",
    nameHi: "🕉️ जैन देव पूजा",
    nameEn: "Jain Dev Pooja Collection",
    desc: "अष्टप्रकारी पूजा सामग्री",
    subcategories: ["ashtaprakari","chandan-vati","kesar","abhishek","sinhasan","puja-spoon"],
    subcategoryLabels: {
      "ashtaprakari":"अष्टप्रकारी सेट", "chandan-vati":"चंदन वटी", kesar:"केसर",
      abhishek:"अभिषेक कलश", sinhasan:"सिंहासन", "puja-spoon":"पूजा स्पून",
    },
    filters: { form: [], formLabels: {}, certification: [], certLabels: {} },
    niche: true,
  },
  {
    id: "vastra",
    nameHi: "👘 धोती / वस्त्र",
    nameEn: "Dhoti / Dupatta / Vastra",
    desc: "पूजा व ध्यान के लिए वस्त्र",
    subcategories: ["dhoti","dupatta","odhni","shawl","pitambar"],
    subcategoryLabels: {
      dhoti:"धोती", dupatta:"दुपट्टा", odhni:"ओढणी", shawl:"शॉल", pitambar:"पीताम्बर",
    },
    filters: {
      form: ["cotton","silk","jain-wear","summer"],
      formLabels: { cotton:"सूती", silk:"रेशमी", "jain-wear":"जैन पूजा वस्त्र", summer:"गर्मी अनुकूल" },
      certification: [], certLabels: {},
    },
  },
  {
    id: "mats",
    nameHi: "🧘 आसन / बैठकी",
    nameEn: "Meditation Mats & Asans",
    desc: "जाप व ध्यान के लिए आसन",
    subcategories: ["bamboo-mat","chatai","cotton-asan","wool-asan","kusha-asan","meditation-cushion"],
    subcategoryLabels: {
      "bamboo-mat":"बाँस चटाई", chatai:"चटाई", "cotton-asan":"सूती आसन",
      "wool-asan":"ऊनी आसन", "kusha-asan":"कुश आसन", "meditation-cushion":"ध्यान कुशन",
    },
    filters: { form: [], formLabels: {}, certification: [], certLabels: {} },
  },
  {
    id: "temple-decor",
    nameHi: "🏛️ मंदिर सजावट",
    nameEn: "Temple Decor",
    desc: "घर के मंदिर के लिए सजावट",
    subcategories: ["chowki-cloth","backdrop","mini-bells","led-lights","diffuser","morpankh"],
    subcategoryLabels: {
      "chowki-cloth":"चौकी कपड़ा", backdrop:"बैकड्रॉप", "mini-bells":"छोटी घंटियाँ",
      "led-lights":"LED लाइट", diffuser:"फ्रेग्रेंस डिफ्यूजर", morpankh:"मोरपंख",
    },
    filters: { form: [], formLabels: {}, certification: [], certLabels: {} },
  },
  {
    id: "wall-decor",
    nameHi: "🖼️ Spiritual Wall Art",
    nameEn: "Spiritual Wall Decor",
    desc: "नवकार मंत्र फ्रेम, कर्म कोट्स",
    subcategories: ["navkar-frame","jain-quotes","karma-quotes","brass-art","acrylic-art"],
    subcategoryLabels: {
      "navkar-frame":"नवकार मंत्र फ्रेम", "jain-quotes":"जैन विचार", "karma-quotes":"Karma Quotes",
      "brass-art":"पीतल कला", "acrylic-art":"Acrylic Art",
    },
    filters: { form: [], formLabels: {}, certification: [], certLabels: {} },
  },
  {
    id: "books",
    nameHi: "📚 पुस्तकें",
    nameEn: "Books",
    desc: "जैन दर्शन, ध्यान, कर्म",
    subcategories: ["jain-philosophy","karma-books","meditation-books","kids-books","stotra-books","pratikraman"],
    subcategoryLabels: {
      "jain-philosophy":"जैन दर्शन", "karma-books":"कर्म साहित्य", "meditation-books":"ध्यान पुस्तकें",
      "kids-books":"बच्चों की पुस्तकें", "stotra-books":"स्तोत्र पुस्तकें", pratikraman:"प्रतिक्रमण",
    },
    filters: {
      form: ["hindi","english","gujarati"],
      formLabels: { hindi:"हिंदी", english:"English", gujarati:"ગુજરાતી" },
      certification: [], certLabels: {},
    },
  },
  {
    id: "audio",
    nameHi: "🔊 Audio Accessories",
    nameEn: "Audio Accessories",
    desc: "मंत्र श्रवण के लिए उपकरण",
    subcategories: ["bluetooth-speaker","sleep-speaker","earbuds","noise-machine"],
    subcategoryLabels: {
      "bluetooth-speaker":"Bluetooth Speaker", "sleep-speaker":"Sleep Speaker",
      earbuds:"Earbuds", "noise-machine":"White Noise Machine",
    },
    filters: { form: [], formLabels: {}, certification: [], certLabels: {} },
  },
  {
    id: "fragrance",
    nameHi: "🌿 सुगंध / धूप",
    nameEn: "Fragrance & Calm Products",
    desc: "धूप, अगरबत्ती, चंदन",
    subcategories: ["dhoop","incense-sticks","natural-camphor","essential-oils","guggal","chandan-fragrance"],
    subcategoryLabels: {
      dhoop:"धूप", "incense-sticks":"अगरबत्ती", "natural-camphor":"प्राकृतिक कपूर",
      "essential-oils":"आवश्यक तेल", guggal:"गुग्गल", "chandan-fragrance":"चंदन सुगंध",
    },
    filters: { form: [], formLabels: {}, certification: [], certLabels: {} },
  },
  {
    id: "gift-boxes",
    nameHi: "🎁 Premium Gift Boxes",
    nameEn: "Premium Spiritual Gift Boxes",
    desc: "Spiritual Starter Box, Gift Sets",
    subcategories: ["starter-box","festival-box","jap-sadhana-kit","travel-kit"],
    subcategoryLabels: {
      "starter-box":"Spiritual Starter Box", "festival-box":"Festival Gift Box",
      "jap-sadhana-kit":"Jap Sadhana Kit", "travel-kit":"Travel Kit",
    },
    filters: { form: [], formLabels: {}, certification: [], certLabels: {} },
    premium: true,
  },
  {
    id: "travel",
    nameHi: "✈️ Travel / तीर्थ यात्रा",
    nameEn: "Travel & Pilgrimage Essentials",
    desc: "शिखरजी, गिरनार, कुंडलपुर यात्रा",
    subcategories: ["foldable-mat","steel-bottle","travel-jap-bag","mini-pooja-kit","white-shawl"],
    subcategoryLabels: {
      "foldable-mat":"फोल्डेबल मैट", "steel-bottle":"स्टील बोतल",
      "travel-jap-bag":"ट्रैवल जाप बैग", "mini-pooja-kit":"मिनी पूजा किट", "white-shawl":"सफेद शॉल",
    },
    filters: { form: [], formLabels: {}, certification: [], certLabels: {} },
  },
];

export const BUDGET_FILTERS = [
  { id: "under5k", label: "Under ₹5,000" },
  { id: "5k10k", label: "₹5,000 – ₹10,000" },
  { id: "10k50k", label: "₹10,000 – ₹50,000" },
  { id: "50kplus", label: "₹50,000 & above" },
];

export const MERCHANT_INFO: Record<string, { label: string; color: string; logo?: string }> = {
  amazon: { label: "Amazon", color: "#FF9900" },
  flipkart: { label: "Flipkart", color: "#2874F0" },
  meesho: { label: "Meesho", color: "#F43397" },
  gempundit: { label: "GemPundit", color: "#6B3FD2" },
  gemporia: { label: "Gemporia", color: "#8B1A1A" },
  bluestone: { label: "BlueStone", color: "#1A5276" },
  cuelinks: { label: "Cuelinks", color: "#E67E22" },
  other: { label: "Shop", color: "#9c7726" },
};

export function getCategoryById(id: string) {
  return SHOP_CATEGORIES.find((c) => c.id === id);
}
