import { NextResponse } from "next/server";
import { dbRun, dbGet } from "@/lib/db";
import { ensureAcademyDb } from "@/lib/academy/schema";
import mcqRaw from "@/lib/rishabdev-mcq.json";

interface MCQItem { id:number; q:string; opts?:string[]; a?:string; b?:string; c?:string; d?:string; ans:string; }

export async function POST() {
  await ensureAcademyDb();
  const mcqs = mcqRaw as unknown as MCQItem[];

  // Ensure category
  await dbRun(
    `INSERT OR IGNORE INTO academy_categories (name,name_hi,slug,description,icon,color,order_index) VALUES (?,?,?,?,?,?,?)`,
    ["Tirthankaras","तीर्थंकर","tirthankaras","24 Tirthankaras stories","🌟","#FFD700",1]
  );
  const cat = await dbGet<{id:number}>("SELECT id FROM academy_categories WHERE slug=?",["tirthankaras"]);

  // Create course
  await dbRun(
    `INSERT OR IGNORE INTO academy_courses
     (title,title_hi,slug,description,category_id,difficulty,language,total_videos,passing_marks,stars_reward,is_published,is_featured,is_free,tags,seo_title)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      "Bhagwan Rishabdev - First Tirthankar",
      "भगवान ऋषभदेव — प्रथम तीर्थंकर",
      "bhagwan-rishabdev",
      "Complete story of Bhagwan Rishabdev. Learn about his life, teachings, Kevalgyan and path to Moksha.",
      cat?.id ?? null,
      "beginner","hi",2,60,100,1,1,1,
      "rishabdev,tirthankar,jain,adinath",
      "भगवान ऋषभदेव | Jain Learning Academy"
    ]
  );

  const course = await dbGet<{id:number}>("SELECT id FROM academy_courses WHERE slug=?",["bhagwan-rishabdev"]);
  if (!course) return NextResponse.json({error:"Course not found after insert"},{status:500});

  // Add videos
  const videos = [
    ["bhagwan-rishabdev-1","भगवान ऋषभदेव — Part 1 | जीवन परिचय","भाग १","https://youtu.be/-3hEMg_hzLY","-3hEMg_hzLY",1200,1,"भगवान ऋषभदेव के जीवन का प्रथम भाग — जन्म, बाल्यकाल और राज्यकाल।",1,15],
    ["bhagwan-rishabdev-2","भगवान ऋषभदेव — Part 2 | दीक्षा और मोक्ष","भाग २","https://youtu.be/F8LL5b57R9M","F8LL5b57R9M",1200,2,"दीक्षा, तपस्या, प्रथम आहार और केवल ज्ञान प्राप्ति।",1,15],
  ];

  for (const v of videos) {
    await dbRun(
      `INSERT OR IGNORE INTO academy_videos
       (course_id,title,title_hi,youtube_url,youtube_id,duration_seconds,sequence_order,description,is_mandatory,stars_on_complete,is_published)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [course.id, v[1], v[2], v[3], v[4], v[5], v[6], v[7], v[8], v[9], 1]
    );
  }

  // Create quiz
  await dbRun(
    `INSERT OR IGNORE INTO academy_quizzes
     (course_id,title,title_hi,description,time_limit_minutes,passing_percent,max_attempts,cooldown_hours,shuffle_questions,stars_on_pass,stars_on_perfect,is_published)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [course.id,
     "भगवान ऋषभदेव — ज्ञान परीक्षा",
     "Bhagwan Rishabdev Quiz",
     "Test your knowledge about Bhagwan Rishabdev",
     30, 60, 3, 24, 1, 50, 80, 1]
  );

  const quiz = await dbGet<{id:number}>("SELECT id FROM academy_quizzes WHERE course_id=?",[course.id]);
  if (!quiz) return NextResponse.json({error:"Quiz not found after insert"},{status:500});

  // Insert questions — ALL values as parameters, no SQL literals
  const ansMap: Record<string,number> = {A:0,B:1,C:2,D:3};
  let inserted = 0;

  for (let i = 0; i < mcqs.length; i++) {
    const m = mcqs[i];
    
    // Build options array
    let opts: string[];
    if (m.opts) {
      opts = m.opts;
    } else {
      opts = [m.a||"",m.b||"",m.c||"",m.d||""].filter(Boolean);
    }
    if (opts.length < 2) continue;

    const ci = ansMap[m.ans?.toUpperCase()] ?? 0;
    const correctAnswer = opts[ci] || opts[0];
    const difficulty = i < 30 ? "easy" : i < 70 ? "medium" : "hard";

    await dbRun(
      `INSERT OR IGNORE INTO academy_questions
       (quiz_id,question_text,question_hi,question_type,options,correct_answer,marks,negative_marks,difficulty,order_index,is_active)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [quiz.id, m.q, m.q, "single", JSON.stringify(opts), JSON.stringify(correctAnswer), 1, 0, difficulty, i+1, 1]
    );
    inserted++;
  }

  return NextResponse.json({
    success: true,
    message: `Course seeded! 2 videos + ${inserted} MCQ questions added.`,
    courseId: course.id,
    quizId: quiz.id,
  });
}
