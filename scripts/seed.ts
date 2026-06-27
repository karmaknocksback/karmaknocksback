/**
 * Seed script — populates the local SQLite database with sample data for
 * local development.
 *
 * Usage:
 *   npm run seed
 *
 * Optionally set ADMIN_EMAIL / ADMIN_PASSWORD / DATABASE_PATH in your
 * .env.local file; sensible defaults are used otherwise.
 */
import * as dotenv from "dotenv";
import path from "path";

// dotenv's default `dotenv/config` import only loads a file literally named
// `.env`. Next.js's `.env.local` convention is a Next-specific thing that
// doesn't apply to standalone scripts, so we load it explicitly here
// (falling back to `.env` if `.env.local` doesn't exist).
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import bcrypt from "bcryptjs";
import { ensureDb } from "../src/lib/db";
import { createJap } from "../src/lib/repo/japs";
import { createArticle } from "../src/lib/repo/articles";
import { createTestimonial } from "../src/lib/repo/testimonials";
import { findAdminByEmail, createAdminUser } from "../src/lib/repo/admin";
import { getSettings } from "../src/lib/repo/settings";


const JAPS = [
  {
    title: "Navkar Mantra",
    titleHi: "नवकार मंत्र",
    slug: "navkar-mantra",
    category: "Mantra",
    purpose: "जैन धर्म का सबसे मौलिक व पवित्र मंत्र — पंच परमेष्ठी को नमन",
    durationMinutes: 5,
    thumbnail: "/images/japs/navkar-mantra.jpg",
    youtubeLink: "https://www.youtube.com/watch?v=PLACEHOLDER_NAVKAR",
    benefits: ["मन की शांति", "नकारात्मक ऊर्जा से रक्षा", "आत्म-शुद्धि"],
    bestFor: ["प्रतिदिन जाप", "नए साधक", "बालक"],
    lyrics:
      "णमो अरिहंताणं\nणमो सिद्धाणं\nणमो आयरियाणं\nणमो उवज्झायाणं\nणमो लोए सव्वसाहूणं",
    transliteration: "Namo Arihantanam, Namo Siddhanam, Namo Ayariyanam...",
    meaning: "यह मंत्र अरिहंत, सिद्ध, आचार्य, उपाध्याय व साधु — पंच परमेष्ठी को नमन करता है।",
    howToListen: "शांत स्थान पर बैठकर, माला के साथ 108 बार जाप करें।",
    faq: [
      { question: "नवकार मंत्र कब करें?", answer: "प्रातः व सायं, विशेषतः ब्रह्म मुहूर्त में सर्वोत्तम है।" },
      { question: "क्या इसे कोई भी कर सकता है?", answer: "हाँ, यह सभी आयु वर्ग व सभी जैन परंपराओं हेतु उपयुक्त है।" },
    ],
    seoKeyword: "navkar mantra jain",
    seoTitle: "नवकार मंत्र | Navkar Mantra अर्थ व लाभ",
    metaDescription: "नवकार मंत्र के शब्द, अर्थ, लाभ व जाप विधि — जैन धर्म का सबसे पवित्र मंत्र।",
    featured: true,
  },
  {
    title: "Shani Shanti Jap",
    titleHi: "शनि शांति जाप",
    slug: "shani-shanti-jap",
    category: "Navgrah",
    planet: "Saturn",
    purpose: "शनि ग्रह दोष शांति व साढ़े साती में राहत हेतु",
    durationMinutes: 21,
    thumbnail: "/images/japs/shani-shanti-jap.jpg",
    youtubeLink: "https://www.youtube.com/watch?v=PLACEHOLDER_SHANI",
    benefits: ["शनि दोष शांति", "कार्य में रुकावट दूर", "मानसिक स्थिरता"],
    bestFor: ["साढ़े साती", "शनि महादशा", "करियर बाधा"],
    lyrics: "ॐ शं शनैश्चराय नमः",
    transliteration: "Om Shaam Shanaishcharaya Namah",
    meaning: "यह जाप शनि देव को समर्पित है, जो न्याय व कर्मफल के देवता माने जाते हैं।",
    howToListen: "शनिवार के दिन तेल का दीपक जलाकर जाप करना विशेष फलदायी है।",
    faq: [
      { question: "यह जाप किसे करना चाहिए?", answer: "जिनकी कुंडली में शनि की महादशा या साढ़े साती चल रही हो।" },
    ],
    seoKeyword: "shani shanti jap",
    seoTitle: "शनि शांति जाप | Shani Shanti Mantra",
    metaDescription: "शनि दोष शांति हेतु प्रमाणिक जाप — विधि, लाभ व सुनने का तरीका।",
    featured: true,
  },
  {
    title: "Mahamrityunjay Jain Jap",
    titleHi: "महामृत्युंजय जैन जाप",
    slug: "mahamrityunjay-jain-jap",
    category: "Healing",
    purpose: "स्वास्थ्य संकट, गंभीर रोग व आयु वृद्धि हेतु",
    durationMinutes: 31,
    thumbnail: "/images/japs/mahamrityunjay-jap.jpg",
    youtubeLink: "https://www.youtube.com/watch?v=PLACEHOLDER_MRITYUNJAY",
    benefits: ["स्वास्थ्य लाभ", "भय से मुक्ति", "आयु वृद्धि की प्रार्थना"],
    bestFor: ["गंभीर बीमारी", "ऑपरेशन से पूर्व", "मानसिक भय"],
    lyrics: "ॐ ह्रीं णमो अरिहंताणं, जरा-मरण-विनाशनाय स्वाहा",
    meaning: "यह जाप जैन परंपरा अनुसार रोग व भय से मुक्ति की प्रार्थना है।",
    howToListen: "नियमित रूप से, विशेषतः रोगी की उपस्थिति में शांत स्वर में सुनें।",
    faq: [
      { question: "क्या यह डॉक्टरी इलाज का विकल्प है?", answer: "नहीं, यह आध्यात्मिक सहायता है, चिकित्सा सलाह का स्थान नहीं लेता।" },
    ],
    seoKeyword: "jain mrityunjay mantra",
    seoTitle: "महामृत्युंजय जैन जाप | स्वास्थ्य व रक्षा हेतु",
    metaDescription: "गंभीर रोग व भय से मुक्ति हेतु महामृत्युंजय जैन जाप — सुनें व अर्थ जानें।",
    featured: true,
  },
  {
    title: "Navgrah Shanti Jap",
    titleHi: "नवग्रह शांति जाप",
    slug: "navgrah-shanti-jap",
    category: "Navgrah",
    purpose: "सभी नौ ग्रहों की शांति व जीवन में संतुलन हेतु",
    durationMinutes: 21,
    thumbnail: "/images/japs/navgrah-shanti-jap.jpg",
    youtubeLink: "https://www.youtube.com/watch?v=PLACEHOLDER_NAVGRAH",
    benefits: ["ग्रह दोष शांति", "जीवन में संतुलन", "बाधा निवारण"],
    bestFor: ["कुंडली में बहु-ग्रह दोष", "नई शुरुआत से पूर्व"],
    lyrics: "ॐ नवग्रह शांति मंत्र...",
    meaning: "सभी नौ ग्रहों को संतुलित करने व उनकी कृपा पाने हेतु यह जाप किया जाता है।",
    howToListen: "किसी भी शुभ दिन से शुरू करके लगातार 9 या 21 दिन जाप करें।",
    faq: [],
    seoKeyword: "navgrah shanti jap",
    seoTitle: "नवग्रह शांति जाप | Navgrah Shanti Mantra",
    metaDescription: "नौ ग्रहों की शांति हेतु जाप — विधि, लाभ व पूर्ण जानकारी।",
    featured: true,
  },
  {
    title: "64 Riddhi Mantra",
    titleHi: "64 ऋद्धि मंत्र",
    slug: "64-riddhi-mantra",
    category: "Mantra",
    purpose: "आध्यात्मिक शक्ति, समृद्धि व सिद्धि प्राप्ति हेतु",
    durationMinutes: 31,
    thumbnail: "/images/japs/64-riddhi-mantra.jpg",
    youtubeLink: "https://www.youtube.com/watch?v=PLACEHOLDER_RIDDHI",
    benefits: ["आध्यात्मिक उन्नति", "समृद्धि", "एकाग्रता में वृद्धि"],
    bestFor: ["गहन साधक", "स्वाध्याय प्रेमी"],
    lyrics: "ॐ ह्रीं श्रीं 64 ऋद्धि मंत्र संग्रह...",
    meaning: "64 ऋद्धियाँ जैन परंपरा में विशिष्ट आध्यात्मिक शक्तियों का प्रतीक हैं।",
    howToListen: "स्वाध्याय के समय शांत चित्त से, विस्तृत अर्थ के साथ सुनना उत्तम है।",
    faq: [],
    seoKeyword: "64 riddhi mantra jain",
    seoTitle: "64 ऋद्धि मंत्र | संपूर्ण संग्रह",
    metaDescription: "64 ऋद्धि मंत्र का संपूर्ण संग्रह — अर्थ, महत्व व सुनने की विधि।",
    featured: true,
  },
  {
    title: "Tirthankar Jap",
    titleHi: "तीर्थंकर जाप",
    slug: "tirthankar-jap",
    category: "Tirthankar",
    purpose: "24 तीर्थंकरों के स्मरण व उनकी कृपा प्राप्ति हेतु",
    durationMinutes: 11,
    thumbnail: "/images/japs/tirthankar-jap.jpg",
    youtubeLink: "https://www.youtube.com/watch?v=PLACEHOLDER_TIRTHANKAR",
    benefits: ["आत्म-शुद्धि", "श्रद्धा में वृद्धि", "मानसिक शांति"],
    bestFor: ["दैनिक भक्ति", "पर्व व उपवास के दिन"],
    lyrics: "ॐ ऋषभादि वर्धमानांताय 24 तीर्थंकराय नमः",
    meaning: "यह जाप ऋषभदेव से महावीर स्वामी तक सभी 24 तीर्थंकरों को नमन है।",
    howToListen: "मंदिर या घर के पूजा स्थल पर दीप प्रज्ज्वलित करके सुनें।",
    faq: [],
    seoKeyword: "tirthankar jap",
    seoTitle: "तीर्थंकर जाप | 24 तीर्थंकर स्मरण",
    metaDescription: "24 तीर्थंकरों को समर्पित जाप — अर्थ, महत्व व श्रवण विधि।",
    featured: false,
  },
  {
    title: "Navkar Pad with Beejakshar",
    titleHi: "नवकार पद बीजाक्षर सहित",
    slug: "navkar-pad-beejakshar",
    category: "Mantra",
    purpose: "नवकार मंत्र का गूढ़ बीजाक्षर सहित गहन जाप",
    durationMinutes: 11,
    thumbnail: "/images/japs/navkar-pad-beejakshar.jpg",
    youtubeLink: "https://www.youtube.com/watch?v=PLACEHOLDER_BEEJAKSHAR",
    benefits: ["गहन एकाग्रता", "आध्यात्मिक उन्नति"],
    bestFor: ["अनुभवी साधक", "स्वाध्याय"],
    lyrics: "ह्रीं अर्हं णमो अरिहंताणं...",
    meaning: "बीजाक्षर सहित नवकार पद का जाप मंत्र की गूढ़ शक्ति को सक्रिय करता है।",
    howToListen: "किसी ज्ञानी गुरु के मार्गदर्शन में सीखकर जाप करना उत्तम रहता है।",
    faq: [],
    seoKeyword: "navkar pad beejakshar",
    seoTitle: "नवकार पद बीजाक्षर सहित | गहन जाप",
    metaDescription: "बीजाक्षर सहित नवकार पद जाप — गूढ़ अर्थ व साधना विधि।",
    featured: false,
  },
  {
    title: "Rahu Shanti Jap",
    titleHi: "राहु शांति जाप",
    slug: "rahu-shanti-jap",
    category: "Navgrah",
    planet: "Rahu",
    purpose: "राहु दोष व अनिश्चितता दूर करने हेतु",
    durationMinutes: 21,
    thumbnail: "/images/japs/rahu-shanti-jap.jpg",
    youtubeLink: "https://www.youtube.com/watch?v=PLACEHOLDER_RAHU",
    benefits: ["भ्रम दूर होना", "निर्णय क्षमता में सुधार"],
    bestFor: ["राहु महादशा", "मानसिक भ्रम"],
    lyrics: "ॐ रां राहवे नमः",
    meaning: "राहु ग्रह की अशुभ स्थिति को शांत करने हेतु यह जाप किया जाता है।",
    howToListen: "शनिवार या बुधवार के दिन जाप करना शुभ माना जाता है।",
    faq: [],
    seoKeyword: "rahu shanti jap jain",
    seoTitle: "राहु शांति जाप | Rahu Mantra",
    metaDescription: "राहु दोष शांति हेतु जाप — विधि, लाभ व जानकारी।",
    featured: false,
  },
];

const ARTICLES = [
  {
    title: "जैन स्वाध्याय की महिमा",
    slug: "jain-swadhyay-ki-mahima",
    category: "Swadhyay",
    thumbnail: "/images/articles/swadhyay.jpg",
    excerpt: "स्वाध्याय आत्म-ज्ञान का सर्वोत्तम साधन है — जानें इसका महत्व व विधि।",
    content:
      "## स्वाध्याय क्या है\n\nस्वाध्याय का अर्थ है स्वयं का अध्ययन — अपने भीतर झाँकना व आत्मा को समझना। जैन परंपरा में इसे आत्म-शुद्धि का सर्वोत्तम मार्ग माना गया है।\n\n## स्वाध्याय के लाभ\n\nनियमित स्वाध्याय से मन की चंचलता कम होती है, विचारों में स्पष्टता आती है, और कर्मों के प्रति जागरूकता बढ़ती है।\n\n## स्वाध्याय कैसे करें\n\nप्रतिदिन एक निश्चित समय पर शांत स्थान में बैठकर शास्त्रों का अध्ययन व चिंतन करें।",
    tags: ["स्वाध्याय", "जैन धर्म", "आत्म-ज्ञान"],
    author: "KarmaKnocksBack",
    seoTitle: "जैन स्वाध्याय की महिमा | महत्व व विधि",
    metaDescription: "जैन स्वाध्याय का महत्व, लाभ व सही विधि — विस्तृत जानकारी।",
    faq: [
      { question: "स्वाध्याय किस समय करना चाहिए?", answer: "प्रातः ब्रह्म मुहूर्त में स्वाध्याय सर्वाधिक फलदायी माना जाता है।" },
    ],
  },
  {
    title: "समुद्घात: एक गूढ़ जैन सिद्धांत",
    slug: "samudghat-jain-siddhant",
    category: "Samudghat",
    thumbnail: "/images/articles/samudghat.jpg",
    excerpt: "समुद्घात जैन कर्म सिद्धांत का एक अत्यंत गूढ़ व महत्वपूर्ण विषय है।",
    content:
      "## समुद्घात का अर्थ\n\nसमुद्घात जैन दर्शन में आत्मा की एक विशिष्ट अवस्था को दर्शाता है, जिसमें आत्मा के प्रदेश शरीर से बाहर फैलते हैं।\n\n## इसका महत्व\n\nयह सिद्धांत कर्म सिद्धांत व आत्मा की सूक्ष्म प्रकृति को समझने में सहायक है।",
    tags: ["समुद्घात", "जैन दर्शन"],
    author: "KarmaKnocksBack",
    seoTitle: "समुद्घात क्या है | जैन सिद्धांत",
    metaDescription: "समुद्घात जैन सिद्धांत का गूढ़ विवरण व महत्व।",
    faq: [],
  },
  {
    title: "जैन दर्शन में अनेकांतवाद",
    slug: "anekantavad-jain-darshan",
    category: "Jain Philosophy",
    thumbnail: "/images/articles/anekantavad.jpg",
    excerpt: "अनेकांतवाद — सत्य को बहु-दृष्टिकोण से देखने की जैन दृष्टि।",
    content:
      "## अनेकांतवाद का परिचय\n\nअनेकांतवाद जैन दर्शन का केंद्रीय सिद्धांत है, जो किसी भी वस्तु को अनेक दृष्टिकोणों से देखने की शिक्षा देता है।\n\n## व्यावहारिक जीवन में महत्व\n\nयह सिद्धांत सहनशीलता, सम्मान व खुले मन से सुनने की प्रवृत्ति विकसित करता है।",
    tags: ["जैन दर्शन", "अनेकांतवाद"],
    author: "KarmaKnocksBack",
    seoTitle: "अनेकांतवाद | जैन दर्शन का सिद्धांत",
    metaDescription: "अनेकांतवाद का अर्थ, महत्व व जीवन में उपयोगिता।",
    faq: [],
  },
  {
    title: "भगवान महावीर की कथा",
    slug: "bhagwan-mahavir-ki-katha",
    category: "Stories",
    thumbnail: "/images/articles/mahavir-katha.jpg",
    excerpt: "तीर्थंकर महावीर स्वामी के जीवन की प्रेरणादायी कथा।",
    content:
      "## जन्म व प्रारंभिक जीवन\n\nमहावीर स्वामी का जन्म एक राजपरिवार में हुआ, परंतु बाल्यकाल से ही उनमें वैराग्य के भाव थे।\n\n## तप व ज्ञान प्राप्ति\n\n12 वर्षों की कठोर तपस्या के पश्चात उन्हें केवल ज्ञान की प्राप्ति हुई।",
    tags: ["महावीर", "जैन कथा"],
    author: "KarmaKnocksBack",
    seoTitle: "भगवान महावीर की कथा | जीवन वृत्तांत",
    metaDescription: "तीर्थंकर महावीर स्वामी के जीवन की प्रेरक कथा।",
    faq: [],
  },
  {
    title: "बच्चों के लिए: सच बोलने की कहानी",
    slug: "bachon-ke-liye-sach-bolne-ki-kahani",
    category: "Kids Corner",
    thumbnail: "/images/articles/kids-truth-story.jpg",
    excerpt: "बच्चों हेतु सत्य व अहिंसा की एक सरल व प्रेरक कहानी।",
    content:
      "## कहानी की शुरुआत\n\nएक छोटे साधक ने सदा सच बोलने का व्रत लिया।\n\n## सीख\n\nइस कहानी से बच्चे सत्य के महत्व व उसके सुपरिणामों को सरलता से समझ सकते हैं।",
    tags: ["बाल कथा", "सत्य"],
    author: "KarmaKnocksBack",
    seoTitle: "बच्चों के लिए जैन कहानी | सच बोलना",
    metaDescription: "बच्चों हेतु सत्य व अहिंसा सिखाने वाली प्रेरक जैन कथा।",
    faq: [],
  },
];

const TESTIMONIALS = [
  { name: "प्रिया जैन", city: "जयपुर", review: "नवकार मंत्र सुनने से मुझे रोज़ मानसिक शांति मिलती है। बहुत आभारी हूं।", rating: 5 },
  { name: "विकास संघवी", city: "इंदौर", review: "शनि शांति जाप ने मेरी साढ़े साती के समय बहुत सहायता की।", rating: 5 },
  { name: "अंजलि शाह", city: "अहमदाबाद", review: "Custom Jap Request सेवा अद्भुत है — मेरी समस्या के अनुसार जाप मिला।", rating: 4 },
  { name: "राहुल मेहता", city: "सूरत", review: "गुणवत्ता व प्रमाणिकता दोनों उत्तम हैं। हर सप्ताह नया कंटेंट मिलता है।", rating: 5 },
  { name: "सीमा बोहरा", city: "उदयपुर", review: "बच्चों के लिए कथाएँ बहुत सरल व प्रेरक हैं।", rating: 5 },
  { name: "मनीष कोठारी", city: "मुंबई", review: "महामृत्युंजय जाप ने पारिवारिक स्वास्थ्य संकट के समय मन को संबल दिया।", rating: 4 },
];

async function run() {
  const db = await ensureDb();
  console.log("Database ready.");

  await db.execute("DELETE FROM japs");
  await db.execute("DELETE FROM articles");
  await db.execute("DELETE FROM testimonials");

  for (const jap of JAPS) await createJap(jap);
  console.log(`Inserted ${JAPS.length} japs`);

  for (const article of ARTICLES) await createArticle(article);
  console.log(`Inserted ${ARTICLES.length} articles`);

  for (const testimonial of TESTIMONIALS) await createTestimonial(testimonial);
  console.log(`Inserted ${TESTIMONIALS.length} testimonials`);

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@karmaknocksback.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const existingAdmin = await findAdminByEmail(adminEmail);
  if (!existingAdmin) {
    await createAdminUser({ name: "Site Admin", email: adminEmail, password: adminPassword, role: "superadmin" });
    console.log(`Created admin user: ${adminEmail} (password: ${adminPassword})`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  await getSettings(); // creates the default settings row if it doesn't exist yet
  console.log("Settings ready.");
  console.log("Seeding complete.");
}

run().catch((err) => { console.error(err); process.exit(1); });
