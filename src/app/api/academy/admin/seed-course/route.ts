import { NextResponse } from "next/server";
import { dbRun, dbGet } from "@/lib/db";
import { ensureAcademyDb } from "@/lib/academy/schema";
import mcqRaw from "@/lib/rishabdev-mcq.json";

interface MCQItem { id:number; q:string; opts:string[]; ans:string; }

export const dynamic = "force-dynamic";
export async function POST() {
  await ensureAcademyDb();
  const mcqs = mcqRaw as MCQItem[];

  // Delete existing course if present (for re-seeding)
  const existingCourse = await dbGet<{id:number}>("SELECT id FROM academy_courses WHERE slug=?",["bhagwan-rishabdev"]);
  if (existingCourse) {
    await dbRun("DELETE FROM academy_quiz_attempts WHERE course_id=?", [existingCourse.id]);
    await dbRun("DELETE FROM academy_questions WHERE quiz_id IN (SELECT id FROM academy_quizzes WHERE course_id=?)", [existingCourse.id]);
    await dbRun("DELETE FROM academy_quizzes WHERE course_id=?", [existingCourse.id]);
    await dbRun("DELETE FROM academy_videos WHERE course_id=?", [existingCourse.id]);
    await dbRun("DELETE FROM academy_courses WHERE id=?", [existingCourse.id]);
  }

  await dbRun(`INSERT OR IGNORE INTO academy_categories (name,name_hi,slug,description,icon,color,order_index)
    VALUES (?,?,?,?,?,?,?)`,
    ["Tirthankaras","तीर्थंकर","tirthankaras","24 Tirthankaras stories","🌟","#FFD700",1]);

  const cat = await dbGet<{id:number}>("SELECT id FROM academy_categories WHERE slug=?",["tirthankaras"]);

  await dbRun(`INSERT OR IGNORE INTO academy_courses
    (title,title_hi,slug,description,category_id,difficulty,language,total_videos,passing_marks,stars_reward,is_published,is_featured,is_free,tags,seo_title)
    VALUES (?,?,?,?,?,?,?,?,?,?,1,1,1,?,?)`,
    ["Bhagwan Rishabdev - First Tirthankar","भगवान ऋषभदेव — प्रथम तीर्थंकर",
     "bhagwan-rishabdev",
     "Complete story of Bhagwan Rishabdev. Learn about his life, teachings, the first Dana Teertha, Kevalgyan and path to Moksha.",
     cat?.id||null,"beginner","hi",2,60,100,
     "rishabdev,tirthankar,jain,adinath",
     "भगवान ऋषभदेव | Jain Learning Academy"]);

  const course = await dbGet<{id:number}>("SELECT id FROM academy_courses WHERE slug=?",["bhagwan-rishabdev"]);
  if(!course) return NextResponse.json({error:"Course failed"},{status:500});

  const videos=[
    {title:"भगवान ऋषभदेव — Part 1 | जीवन परिचय",title_hi:"भाग १",youtube_url:"https://youtu.be/-3hEMg_hzLY",youtube_id:"-3hEMg_hzLY",duration_seconds:1200,sequence_order:1,description:"भगवान ऋषभदेव के जीवन का प्रथम भाग — जन्म, बाल्यकाल और राज्यकाल।",is_mandatory:1,stars_on_complete:15},
    {title:"भगवान ऋषभदेव — Part 2 | दीक्षा और मोक्ष",title_hi:"भाग २",youtube_url:"https://youtu.be/F8LL5b57R9M",youtube_id:"F8LL5b57R9M",duration_seconds:1200,sequence_order:2,description:"दीक्षा, तपस्या, प्रथम आहार और केवल ज्ञान प्राप्ति।",is_mandatory:1,stars_on_complete:15},
  ];
  for(const v of videos){
    await dbRun(`INSERT OR IGNORE INTO academy_videos
      (course_id,title,title_hi,youtube_url,youtube_id,duration_seconds,sequence_order,description,is_mandatory,stars_on_complete,is_published)
      VALUES (?,?,?,?,?,?,?,?,?,?,1)`,
      [course.id,v.title,v.title_hi,v.youtube_url,v.youtube_id,v.duration_seconds,v.sequence_order,v.description,v.is_mandatory,v.stars_on_complete]);
  }

  await dbRun(`INSERT OR IGNORE INTO academy_quizzes
    (course_id,title,title_hi,description,time_limit_minutes,passing_percent,max_attempts,cooldown_hours,shuffle_questions,stars_on_pass,stars_on_perfect,is_published)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,1)`,
    [course.id,"भगवान ऋषभदेव — ज्ञान परीक्षा","Bhagwan Rishabdev Quiz",
     "Test your knowledge","30",60,3,24,1,50,80]);

  const quiz = await dbGet<{id:number}>("SELECT id FROM academy_quizzes WHERE course_id=?",[course.id]);
  if(!quiz) return NextResponse.json({error:"Quiz failed"},{status:500});

  const ansMap:Record<string,number>={A:0,B:1,C:2,D:3};
  for(let i=0;i<mcqs.length;i++){
    const m=mcqs[i];
    const ci=ansMap[m.ans]??0;
    await dbRun(`INSERT OR IGNORE INTO academy_questions
      (quiz_id,question_text,question_hi,question_type,options,correct_answer,marks,negative_marks,difficulty,order_index,is_active)
      VALUES (?,?,?,?,?,?,?,?,?,?,1)`,
      [quiz.id,m.q,m.q,"single",JSON.stringify(m.opts),JSON.stringify(m.opts[ci]),1,0,
       i<30?"easy":i<70?"medium":"hard",i+1]);
  }

  return NextResponse.json({success:true,message:`Course seeded! 2 videos + ${mcqs.length} MCQs.`,courseId:course.id,quizId:quiz.id});
}
