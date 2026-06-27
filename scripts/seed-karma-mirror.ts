/**
 * Seeds Karma Mirror's DB-backed tables:
 *  - km_questions: thin mirror of lib/karma-mirror/questions.ts (FK target for answers)
 *  - km_archetypes: thin mirror of lib/karma-mirror/archetypes.ts (FK target for reports)
 *  - km_practices: the actual practice recommendation catalog, admin-editable from here on
 *
 * Run this AFTER `npm run seed` and (if you want real content links) AFTER
 * `npm run import:vidiq`, since it searches the already-imported japs to
 * link practices to real videos rather than guessing at slugs.
 *
 * Usage: npm run seed:karma-mirror
 */
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { dbRun, dbGet, dbAll, ensureDb } from "../src/lib/db";
import { KM_QUESTIONS } from "../src/lib/karma-mirror/questions";
import { KM_ARCHETYPES } from "../src/lib/karma-mirror/archetypes";
import { listJaps } from "../src/lib/repo/japs";
import { createPractice } from "../src/lib/repo/km-practices";

async function seedQuestions() {
  await ensureDb();
  const sql = `INSERT INTO km_questions (stable_id, trait, question_type, text_hi, order_index, options_json)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(stable_id) DO UPDATE SET
       question_type = excluded.question_type, order_index = excluded.order_index,
       options_json = excluded.options_json`;
  for (const [i, q] of KM_QUESTIONS.entries()) {
    await dbRun(sql, [q.id, q.trait, q.type, q.text, i, JSON.stringify(q.options)]);
    if (i > 0 && i % 10 === 0) await new Promise((r) => setTimeout(r, 200));
  }
  console.log(`Seeded ${KM_QUESTIONS.length} questions into km_questions (existing admin-edited text/trait preserved on re-run).`);
}

async function seedArchetypes() {
  await ensureDb();
  const archSql = `INSERT INTO km_archetypes (
      slug, name_hi, name_en, dominant_traits, description, strengths,
      weaknesses, karmic_loop, trigger_map, healing_path, jain_lens, psych_lens
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      name_hi=excluded.name_hi, name_en=excluded.name_en,
      dominant_traits=excluded.dominant_traits, description=excluded.description,
      strengths=excluded.strengths, weaknesses=excluded.weaknesses,
      karmic_loop=excluded.karmic_loop, trigger_map=excluded.trigger_map,
      healing_path=excluded.healing_path, jain_lens=excluded.jain_lens, psych_lens=excluded.psych_lens`;
  for (const a of KM_ARCHETYPES) {
    await dbRun(archSql, [a.slug, a.nameHi, a.nameEn, JSON.stringify(a.dominantTraits), a.description,
      JSON.stringify(a.strengths), JSON.stringify(a.weaknesses), a.karmicLoop,
      JSON.stringify(a.triggerMap), a.healingPath, a.jainLens, a.psychLens]);
  }
  console.log(`Seeded ${KM_ARCHETYPES.length} archetypes into km_archetypes.`);
}

/** Best-effort search for a real jap to link a practice to. Returns null
 * (instruction-text-only practice) rather than guessing badly — a missing
 * link is much safer than a wrong one. */
async function findJap(query: string) {
  const results = await listJaps({ q: query });
  return results[0] || null;
}

async function seedPractices() {
  await ensureDb();
  const countRow = await dbGet<{ c: number }>("SELECT COUNT(*) as c FROM km_practices");
  const existingCount = countRow?.c ?? 0;
  if (existingCount > 0) {
    console.log(`km_practices already has ${existingCount} rows — skipping (delete rows manually or via admin to reseed).`);
    return;
  }

  const navkar = await findJap("नवकार मंत्र");
  const kshama = await findJap("क्षमा");
  // Note: deliberately not auto-linking a jap for general anxiety/fear relief —
  // this channel's "शांति" content is almost entirely grah-dosh (planetary
  // pacification) material, not general inner-peace content, and a wrong
  // link is worse than no link. Revisit once more suitable content exists,
  // or link manually via the admin panel.

  const practices = [
    {
      practiceName: "नवकार मंत्र जाप",
      category: "jap" as const,
      targetTraits: ["krodh"],
      durationMinutes: 10,
      difficulty: "beginner" as const,
      benefits: ["मन की तुरंत शांति", "प्रतिक्रिया और शब्द के बीच ठहराव बनाना"],
      instructionText: "जब गुस्सा उठे, रुकें और 3 बार नवकार मंत्र का जाप करें — फिर ही प्रतिक्रिया दें।",
      linkedJapId: navkar?._id,
    },
    {
      practiceName: "क्षमा-भावना चिंतन",
      category: "contemplation" as const,
      targetTraits: ["krodh", "maan"],
      durationMinutes: 10,
      difficulty: "beginner" as const,
      benefits: ["क्रोध को पकड़े रहने की आदत कम करना", "रिश्तों में भार कम होना"],
      instructionText: "रोज़ रात किसी एक व्यक्ति को मन से क्षमा करने का अभ्यास करें — चाहे बात छोटी हो या बड़ी।",
      linkedJapId: kshama?._id,
    },
    {
      practiceName: "मैत्री भावना",
      category: "bhavana" as const,
      targetTraits: ["krodh"],
      durationMinutes: 8,
      difficulty: "intermediate" as const,
      benefits: ["सभी के प्रति सद्भावना बढ़ाना", "क्रोध के तुरंत भड़कने की प्रवृत्ति कम करना"],
      instructionText: "ध्यान में बैठकर बारी-बारी से अपने, अपने प्रियजनों, और जिनसे तनाव है — सभी के लिए मित्रता की भावना भेजें।",
    },
    {
      practiceName: "अपरिग्रह चिंतन",
      category: "contemplation" as const,
      targetTraits: ["moh", "lobh"],
      durationMinutes: 12,
      difficulty: "intermediate" as const,
      benefits: ["आसक्ति को पहचानना और धीरे ढीला करना", "वर्तमान में संतोष बढ़ाना"],
      instructionText: "किसी एक चीज़ या व्यक्ति के प्रति अपनी पकड़ को बिना जज किए देखें — सिर्फ देखना है, छोड़ना नहीं, अभी।",
    },
    {
      practiceName: "वैराग्य भावना",
      category: "bhavana" as const,
      targetTraits: ["moh"],
      durationMinutes: 10,
      difficulty: "advanced" as const,
      benefits: ["भावनात्मक निर्भरता कम करना", "अपनी पहचान को रिश्तों से थोड़ा अलग देखना"],
      instructionText: "हर चीज़ की अस्थिरता पर चिंतन करें — यह जानना कि जुड़ाव स्वाभाविक है, पर हर जुड़ाव बदलता है।",
    },
    {
      practiceName: "विनय अभ्यास",
      category: "daily_ritual" as const,
      targetTraits: ["maan"],
      durationMinutes: 5,
      difficulty: "beginner" as const,
      benefits: ["अहंकार को नरम करना", "सुनने और झुकने की क्षमता बढ़ाना"],
      instructionText: "रोज़ किसी एक व्यक्ति से बिना बहस के, खुले मन से एक बात सीखने की कोशिश करें — चाहे वह उम्र या अनुभव में आपसे छोटा ही हो।",
    },
    {
      practiceName: "विनय/नम्रता चिंतन",
      category: "contemplation" as const,
      targetTraits: ["maan"],
      durationMinutes: 8,
      difficulty: "intermediate" as const,
      benefits: ["आत्म-छवि और वास्तविकता के बीच का अंतर देखना", "तुलना की मानसिक चर्चा कम करना"],
      instructionText: "अपनी किसी हाल की गलती को बिना सफाई के, सिर्फ स्वीकार करते हुए लिखें।",
    },
    {
      practiceName: "अपरिग्रह अभ्यास",
      category: "daily_ritual" as const,
      targetTraits: ["lobh"],
      durationMinutes: 10,
      difficulty: "beginner" as const,
      benefits: ["देने में सहजता बढ़ाना", "संतोष का अभ्यास"],
      instructionText: "सप्ताह में एक बार कोई एक चीज़ ऐसी दें जिसकी आपको ज़रूरत नहीं, किसी ज़रूरतमंद को।",
    },
    {
      practiceName: "शांति जाप",
      category: "jap" as const,
      targetTraits: ["bhaya"],
      durationMinutes: 15,
      difficulty: "beginner" as const,
      benefits: ["चिंता और बेचैनी कम करना", "वर्तमान क्षण में लौटना"],
      instructionText: "जब चिंता बढ़े, शांत बैठकर शांति-केंद्रित किसी जाप को सुनें — शब्दों के साथ श्वास को भी धीमा करें।",
    },
    {
      practiceName: "विश्वास-समर्पण अभ्यास",
      category: "journaling" as const,
      targetTraits: ["bhaya", "moh"],
      durationMinutes: 10,
      difficulty: "intermediate" as const,
      benefits: ["नियंत्रण की अत्यधिक आवश्यकता को छोड़ना सीखना", "अनिश्चितता के साथ सहज होना"],
      instructionText: "जिस बात की चिंता हो, उसे लिख लें — फिर लिखें कि इसमें आपके नियंत्रण में क्या है, और क्या नहीं।",
    },
    {
      practiceName: "स्वाध्याय — आत्म-निरीक्षण",
      category: "swadhyay" as const,
      targetTraits: ["maya"],
      durationMinutes: 15,
      difficulty: "intermediate" as const,
      benefits: ["स्वयं के प्रति अधिक सच्चाई", "मुखौटों को पहचानना"],
      instructionText: "किसी जैन ग्रंथ का एक छोटा अंश पढ़ें, फिर लिखें कि आज आपने कहाँ अपनी सच्ची भावना छुपाई।",
    },
  ];

  for (const p of practices) {
    await createPractice(p);
  }
  console.log(`Seeded ${practices.length} practices into km_practices (linked to real japs where a match was found).`);
}

async function main() {
  await seedQuestions();
  await seedArchetypes();
  await seedPractices();
  console.log("Karma Mirror seeding complete.");
}
main().catch((e) => { console.error(e); process.exit(1); });
