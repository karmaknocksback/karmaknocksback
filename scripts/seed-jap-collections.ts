/**
 * Seeds the "All Jain Japs" hierarchical directory: main collections
 * (Bhaktamar Stotra, 64 Riddhis) each with numbered sub-items.
 *
 * IMPORTANT — this is honestly partial, not a complete 48+64 dataset:
 *
 *  - Bhaktamar Stotra verses 1-14: real, traditional verse-purpose labels
 *    sourced from Acharya Vidyasagar Ji's tradition (vidyasagar.net),
 *    a genuine, attributed Digambar source. Verses 15-48 are seeded as
 *    structural placeholders (slug reserved, sequence intact,
 *    content_status='pending') rather than fabricated — getting the rest
 *    accurately requires more research than this pass did.
 *  - The 64 Riddhis: these are real, documented in classical Jain
 *    Agamic/Charananuyog literature, but they are traditionally
 *    descriptions of spiritual attainments (siddhis) of advanced monks
 *    through deep tapas — NOT a catalog of "chant this for that
 *    problem" remedies. The collection is framed accordingly: as
 *    devotional/contemplative reading, not problem-specific prescription.
 *    Only 6 of 64 have real sourced definitions seeded here; the rest
 *    are pending placeholders.
 *
 * Safe to re-run — upserts by (collection, sequence_number)/slug.
 * Usage: npm run seed:jap-collections
 */
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { upsertCollection, upsertItem, type JapCollectionItem } from "../src/lib/repo/jap-collections";
import { slugify } from "../src/lib/utils";

const VIDYASAGAR_SOURCE_NOTE =
  "स्रोत: आचार्य विद्यासागर जी महाराज की परंपरा (vidyasagar.net) — दिगंबर स्रोत। श्लोक 1-14 के उद्देश्य इस स्रोत से सत्यापित हैं; शेष श्लोकों पर शोध जारी है।";

function bhaktamarItem(
  seq: number,
  collectionId: string,
  purposeHi: string | null,
  status: "researched" | "pending"
): Omit<JapCollectionItem, "_id"> {
  const titleHi = purposeHi ? `श्लोक ${seq}: ${purposeHi}` : `श्लोक ${seq}`;
  return {
    collectionId,
    sequenceNumber: seq,
    slug: `bhaktamar-shlok-${seq}`,
    titleHi,
    purposeHi: purposeHi || undefined,
    granthReference: status === "researched" ? "भक्तामर स्तोत्र, आचार्य मानतुंग — परंपरागत काव्य-फल सूची" : undefined,
    sourceConfidence: status === "researched" ? "traditional" : "community",
    seoTitle: status === "researched" ? `भक्तामर स्तोत्र श्लोक ${seq} – ${purposeHi} | अर्थ व लाभ` : `भक्तामर स्तोत्र श्लोक ${seq}`,
    metaDescription: status === "researched"
      ? `भक्तामर स्तोत्र का ${seq}वां श्लोक — ${purposeHi}। आचार्य मानतुंग रचित इस श्लोक का पारंपरिक महत्व व उपयोग जानें।`
      : undefined,
    contentStatus: status,
  };
}

function riddhiItem(
  seq: number,
  collectionId: string,
  nameHi: string | null,
  definitionHi: string | null,
  status: "researched" | "pending"
): Omit<JapCollectionItem, "_id"> {
  const titleHi = nameHi || `ऋद्धि ${seq}`;
  return {
    collectionId,
    sequenceNumber: seq,
    slug: nameHi ? `riddhi-${seq}-${slugify(nameHi)}` : `riddhi-${seq}`,
    titleHi,
    purposeHi: definitionHi || undefined,
    granthReference: status === "researched" ? "त्रिलोकप्रज्ञप्ति / चरणानुयोग — गणधर परमेष्ठी एवं ऋद्धियाँ" : undefined,
    sourceConfidence: status === "researched" ? "traditional" : "community",
    seoTitle: nameHi ? `${nameHi} – जैन ऋद्धि का अर्थ` : `ऋद्धि ${seq}`,
    metaDescription: definitionHi ? definitionHi.slice(0, 155) : undefined,
    contentStatus: status,
  };
}

async function run() {
  // ===== Bhaktamar Stotra =====
  const bhaktamar = await upsertCollection({
    slug: "bhaktamar-stotra",
    nameHi: "भक्तामर स्तोत्र",
    nameEn: "Bhaktamar Stotra",
    descriptionHi:
      "आचार्य मानतुंग रचित भक्तामर स्तोत्र जैन परंपरा का सबसे प्रसिद्ध स्तोत्र है। दिगंबर परंपरा अनुसार इसमें 48 श्लोक हैं (श्वेतांबर परंपरा 44 मानती है — यहाँ दिगंबर गणना को वरीयता दी गई है)। प्रत्येक श्लोक को परंपरागत रूप से एक विशेष मंत्र व उद्देश्य से जोड़ा जाता है।",
    totalItems: 48,
    sourceNoteHi: VIDYASAGAR_SOURCE_NOTE,
    displayOrder: 1,
  });

  const BHAKTAMAR_PURPOSES: Record<number, string> = {
    1: "सर्वविघ्न विनाशक", 2: "शत्रु तथा शिरपीड़ानाशक", 3: "सर्वसिद्धिदायक",
    4: "जल-जंतु भयमोचक", 5: "नेत्ररोग संहारक", 6: "सरस्वती विद्या प्रसारक",
    7: "सर्व संकट निवारक", 8: "सर्वारिष्ट योग निवारक", 9: "भय-पापनाशक",
    10: "विष निवारक", 11: "वांछापूरक", 12: "गजभय निवारक",
    13: "चोर व अग्नि भय निवारक", 14: "आधि-व्याधिनाशक",
  };

  let bhaktamarResearched = 0;
  for (let seq = 1; seq <= 48; seq++) {
    const purpose = BHAKTAMAR_PURPOSES[seq] || null;
    const status = purpose ? "researched" : "pending";
    if (purpose) bhaktamarResearched++;
    await upsertItem(bhaktamarItem(seq, bhaktamar._id, purpose, status));
  }
  console.log(`Bhaktamar Stotra: seeded 48 item slots, ${bhaktamarResearched} with researched traditional purpose, ${48 - bhaktamarResearched} pending further research.`);

  // ===== 64 Riddhis =====
  const riddhi = await upsertCollection({
    slug: "64-riddhi",
    nameHi: "64 ऋद्धि",
    nameEn: "64 Riddhis",
    descriptionHi:
      "जैन आगम साहित्य (चरणानुयोग) में वर्णित 64 ऋद्धियाँ विशेष आध्यात्मिक सिद्धियाँ हैं, जो गहन तप व साधना से उच्च कोटि के मुनियों को प्राप्त होती हैं — जैसे दूर से शब्द/स्वाद ग्रहण करने की क्षमता, अद्वितीय बुद्धि-शक्ति आदि। महत्वपूर्ण: ये रोज़मर्रा की समस्याओं के लिए 'यह करें तो वह मिलेगा' प्रकार के उपाय नहीं हैं — परंपरागत रूप से ये साधु-साध्वियों की उच्च आध्यात्मिक अवस्था के वर्णन हैं। यहाँ इन्हें भक्ति, ज्ञान-वृद्धि व जिज्ञासा भाव से पढ़ने हेतु प्रस्तुत किया गया है।",
    totalItems: 64,
    sourceNoteHi: "स्रोत: त्रिलोकप्रज्ञप्ति/चरणानुयोग साहित्य — गणधर परमेष्ठी एवं ऋद्धियाँ अध्याय। केवल आंशिक सूची शोधित; शेष पर कार्य जारी है।",
    displayOrder: 2,
  });

  const RIDDHI_DEFINITIONS: Record<number, [string, string]> = {
    1: ["सम्भिन्न श्रोतृत्व ऋद्धि", "विशाल क्षेत्र में फैले भिन्न-भिन्न शब्दों को एक साथ सुनकर अलग-अलग पहचानने की क्षमता।"],
    2: ["दूरास्वादित्व ऋद्धि", "सामान्य इन्द्रिय-क्षेत्र से बाहर, दूर स्थित विविध रसों के स्वाद को जानने की क्षमता।"],
    3: ["वादित्व बुद्धि ऋद्धि", "शास्त्रार्थ में विपक्षियों को निरुत्तर करने व तत्वों की गहन परीक्षा करने की बुद्धि-शक्ति।"],
    4: ["चौदह पूर्वित्व ऋद्धि", "संपूर्ण आगम साहित्य (चौदह पूर्व) में पारंगत होने की सिद्धि — श्रुतकेवली मुनियों को प्राप्त।"],
    5: ["बीजबुद्धि ऋद्धि", "एक ही मूल पद को सुनकर उसके आश्रय से संपूर्ण श्रुत (शास्त्र-ज्ञान) को समझ लेने की बुद्धि-शक्ति।"],
    6: ["अक्षीणमहालय ऋद्धि", "सीमित क्षेत्र में असंख्यात प्राणियों को समाहित कर सकने की अतिशय सिद्धि।"],
  };

  let riddhiResearched = 0;
  for (let seq = 1; seq <= 64; seq++) {
    const entry = RIDDHI_DEFINITIONS[seq];
    const status = entry ? "researched" : "pending";
    if (entry) riddhiResearched++;
    await upsertItem(riddhiItem(seq, riddhi._id, entry?.[0] || null, entry?.[1] || null, status));
  }
  console.log(`64 Riddhi: seeded 64 item slots, ${riddhiResearched} with researched classical definition, ${64 - riddhiResearched} pending further research.`);

  console.log("\nSeeding complete. Use the admin panel to fill in remaining 'pending' entries as they're researched.");
}

run().catch((e) => { console.error(e); process.exit(1); });
