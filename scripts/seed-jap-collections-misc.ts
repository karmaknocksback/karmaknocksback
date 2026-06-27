/**
 * Seeds the "विविध जैन मंत्र" (misc Jain mantras) collection — the 4th
 * source document the site owner provided (daslakshan-dharma mantras,
 * lashu/sarvagraha shanti, rog-nivarak, mahamrityunjay, nandishwar/
 * pushpanjali/siddhachakra vidhan mantras, ghantakarna mantra).
 *
 * This was genuinely missed in the first community-content import pass
 * (only Bhaktamar/64-Riddhi/Navgrah were seeded then) — not a bug the
 * site owner needs to work around, a real gap on this build's side.
 *
 * Same honesty standard as the other community seed: source is the site
 * owner's own document, which itself cites no specific text/page
 * reference for any individual mantra — so every item here is
 * sourceConfidence: "community", same as the rest of this batch. No
 * medical/financial overclaim language appears in the source material
 * for this set, so no sanitization was needed here (unlike the Bhaktamar
 * single-shloka document), but confidence tier stays community regardless
 * since no specific granth/page citation was given for these.
 *
 * Usage: npm run seed:jap-collections-misc
 */
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { upsertCollection, upsertItem, getCollectionBySlug, type JapCollectionItem } from "../src/lib/repo/jap-collections";

type ItemSeed = Omit<JapCollectionItem, "_id" | "collectionId" | "sequenceNumber" | "slug" | "sourceConfidence" | "contentStatus">;

const ITEMS: ItemSeed[] = [
  {
    titleHi: "दशलक्षण धर्म मंत्र",
    mantraPranam: "ॐ ह्रीं [धर्म का नाम] धर्माङ्गाय नमः",
    purposeHi: "दशलक्षण पर्व के दौरान प्रत्येक दिन एक धर्म (उत्तम क्षमा, मार्दव, आर्जव आदि) के नाम के साथ जप — उस गुण के स्मरण व आत्मसात के लिए।",
    whenToDoHi: "दशलक्षण पर्व के दस दिनों में, प्रतिदिन संबंधित धर्म के साथ",
  },
  {
    titleHi: "षोडशकारण व्रत मंत्र",
    mantraPranam: "ॐ ह्रीं श्री दर्शनविशुद्धि आदि षोडशकारणेभ्यो नमः",
    purposeHi: "तीर्थंकर-प्रकृति के सोलह कारण-भावनाओं के स्मरण हेतु पारंपरिक जप।",
  },
  {
    titleHi: "मंगलदायक मंत्र",
    mantraPranam: "ॐ ह्रीं वरे सुवरे असिआउसा नमः",
    purposeHi: "सामान्य मंगल-कामना व शुभारंभ हेतु।",
  },
  {
    titleHi: "ऐश्वर्यदायक मंत्र",
    mantraPranam: "ॐ ह्रीं असिआउसा नमः स्वाहा",
    purposeHi: "समृद्धि व ऐश्वर्य की भावना सहित जप।",
  },
  {
    titleHi: "सर्वसिद्धिदायक मंत्र (वृषभनाथ)",
    mantraPranam: "ॐ ह्रीं क्लीं श्रीं अर्ह श्री वृषभनाथ-तीर्थंकराय नमः",
    purposeHi: "प्रथम तीर्थंकर वृषभनाथ की आराधना सहित सर्वसिद्धि हेतु जप।",
  },
  {
    titleHi: "लघु शान्ति मंत्र",
    mantraPranam: "ॐ ह्रीं अर्ह असिआउसा सर्वशान्ति कुरुत कुरुत स्वाहा",
    purposeHi: "सामान्य शांति व कल्याण हेतु संक्षिप्त जप।",
  },
  {
    titleHi: "सर्वग्रह शान्ति मंत्र",
    mantraPranam: "ॐ ह्रां ह्रीं हूं हौं हः असिआउसा सर्व-शान्तिं कुरु कुरु स्वाहा",
    purposeHi: "ग्रह-संबंधी अशांति में सामान्य शांति हेतु जप।",
  },
  {
    titleHi: "रोगनिवारक मंत्र (सन्मति देव)",
    mantraPranam: "ॐ ह्रीं सकल-रोगहराय श्री सन्मति देवाय नमः",
    purposeHi: "स्वास्थ्य-लाभ की भावना सहित जप — चिकित्सकीय उपचार का विकल्प नहीं, उसके साथ सहायक भावना के रूप में।",
  },
  {
    titleHi: "शान्तिकारक मंत्र (शांतिनाथ)",
    mantraPranam: "ॐ ह्रीं परमशान्ति विधायक श्री शान्तिनाथाय नमः",
    purposeHi: "सोलहवें तीर्थंकर शांतिनाथ की आराधना सहित मानसिक शांति हेतु जप।",
  },
  {
    titleHi: "महामृत्युंजय मंत्र (जैन परंपरा)",
    mantraPranam: "ॐ ह्रां णमो अरिहन्ताणं... (अरिहंत से साधु तक पंच-परमेष्ठी पद) मम सर्व-ग्रहारिष्टान् निवारय...",
    purposeHi: "गंभीर संकट व आरोग्य-कामना की भावना सहित जप — दीपक व धूप के साथ, नियमबद्ध रहकर करने की परंपरा है। दूसरे के लिए जप करते समय 'मम' के स्थान पर उनका नाम लिया जाता है।",
    whenToDoHi: "दीप प्रज्ज्वलित कर, धूप देकर, नैष्ठिक रहकर",
  },
  {
    titleHi: "नन्दीश्वर व्रत मंत्र",
    mantraPranam: "ॐ ह्रीं नन्दीश्वरसंज्ञाय नमः",
    purposeHi: "नंदीश्वर द्वीप से संबंधित व्रत-आराधना में प्रयुक्त (इस व्रत में आदि आठ मंत्र होने का उल्लेख स्रोत में है, यहाँ प्रथम मंत्र दिया गया है)।",
  },
  {
    titleHi: "पुष्पांजलि व्रत मंत्र",
    mantraPranam: "ॐ ह्रीं पंचमेरुसम्बन्धि अशीति-जिनालयेभ्यो नमः",
    purposeHi: "पंच मेरु संबंधी अस्सी जिनालयों के स्मरण सहित पुष्पांजलि व्रत में जप।",
  },
  {
    titleHi: "सिद्धचक्र विधान मंत्र",
    mantraPranam: "ॐ ह्रीं अहं असि-आ-उ-सा नमः स्वाहा",
    purposeHi: "सिद्धचक्र विधान/पूजन में प्रयुक्त मूल मंत्र।",
  },
  {
    titleHi: "घंटाकर्ण मंत्र",
    mantraPranam: "ॐ ह्रीं घंटाकर्णो महावीर; सर्वव्याधि-विनाशकः...",
    purposeHi: "व्याधि, भय व बाधा-निवारण की भावना सहित जप।",
    whenToDoHi: "स्रोत अनुसार 21 बार जप राज-भय, चोर-भय व अग्नि आदि से रक्षा-भावना हेतु बताया गया है।",
    jaapCountNote: "21 बार",
  },
];

async function run() {
  const collection = await upsertCollection({
    slug: "vividh-jain-mantra",
    nameHi: "विविध जैन मंत्र",
    nameEn: "Miscellaneous Jain Mantras",
    descriptionHi:
      "नित्य पाठ, शांति-रक्षा व विशेष विधानों से जुड़े विविध जैन मंत्रों का संकलन — दशलक्षण धर्म, षोडशकारण व्रत, लघु/सर्वग्रह शांति, रोगनिवारक, महामृत्युंजय, नंदीश्वर/पुष्पांजलि/सिद्धचक्र विधान व घंटाकर्ण मंत्र सहित।",
    totalItems: ITEMS.length,
    sourceNoteHi:
      "यह संग्रह साइट के स्वामी द्वारा प्रदत्त सामग्री से लिया गया है, जिसमें किसी विशिष्ट ग्रंथ/पृष्ठ का संदर्भ नहीं दिया गया था — अतः सभी प्रविष्टियाँ सामुदायिक (community) स्तर पर चिह्नित हैं, स्वतंत्र रूप से सत्यापित नहीं।",
    displayOrder: 3,
  });

  let count = 0;
  for (const item of ITEMS) {
    count++;
    const slug = `vividh-mantra-${count}`;
    await upsertItem({
      collectionId: collection._id,
      sequenceNumber: count,
      slug,
      titleHi: item.titleHi,
      mantraPranam: item.mantraPranam,
      purposeHi: item.purposeHi,
      whenToDoHi: item.whenToDoHi,
      jaapCountNote: item.jaapCountNote,
      sourceConfidence: "community",
      seoTitle: `${item.titleHi} | अर्थ व उपयोग`,
      metaDescription: item.purposeHi?.slice(0, 155),
      contentStatus: "researched",
    });
  }

  // Re-fetch to confirm the actual stored count, not just the loop count
  const stored = await getCollectionBySlug("vividh-jain-mantra");
  console.log(`विविध जैन मंत्र: seeded ${count}/${stored?.totalItems} items (all community tier).`);
}

run().catch((e) => { console.error(e); process.exit(1); });
