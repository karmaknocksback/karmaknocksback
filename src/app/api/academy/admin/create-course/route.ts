import { NextRequest, NextResponse } from "next/server";
import { dbRun, dbGet } from "@/lib/db";
import { ensureAcademyDb } from "@/lib/academy/schema";

interface VideoInput { url:string; youtubeId:string; title:string; titleHi:string; durationSeconds:number; order:number; }
interface MCQInput  { question:string; optA:string; optB:string; optC:string; optD:string; answer:string; }
interface Body {
  title:string; titleHi:string; slug:string; description:string;
  difficulty:string; passingPercent:number; starsReward:number;
  videos:VideoInput[]; mcqs:MCQInput[];
}

export async function POST(req: NextRequest) {
  try {
    await ensureAcademyDb();
    const body: Body = await req.json();

    // Validate
    if (!body.title?.trim() || !body.slug?.trim()) {
      return NextResponse.json({ success:false, message:"Title and slug are required." }, { status:400 });
    }
    if (!body.videos?.length) {
      return NextResponse.json({ success:false, message:"At least one video is required." }, { status:400 });
    }

    // Ensure default category
    await dbRun(`INSERT OR IGNORE INTO academy_categories (name,name_hi,slug,icon,color,order_index)
      VALUES (?,?,?,?,?,?)`, ["General","सामान्य","general","📚","#FF9800",10]);
    const cat = await dbGet<{id:number}>("SELECT id FROM academy_categories WHERE slug=?",["general"]);

    // Create course
    const slug = body.slug.toLowerCase().replace(/[^a-z0-9-]/g,"").replace(/^-|-$/g,"");
    await dbRun(`INSERT OR IGNORE INTO academy_courses
      (title,title_hi,slug,description,category_id,difficulty,language,total_videos,
       passing_marks,stars_reward,is_published,is_featured,is_free)
      VALUES (?,?,?,?,?,?,?,?,?,?,1,1,1)`,
      [body.title.trim(), body.titleHi?.trim()||"", slug,
       body.description?.trim()||"", cat?.id||null, body.difficulty||"beginner",
       "hi", body.videos.length, body.passingPercent||60, body.starsReward||100]);

    const course = await dbGet<{id:number}>("SELECT id FROM academy_courses WHERE slug=?",[slug]);
    if (!course) return NextResponse.json({ success:false, message:"Course already exists with this slug. Change the title or slug." }, { status:409 });

    // Insert videos
    for (const v of body.videos) {
      const ytId = v.youtubeId || (v.url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1]||"");
      await dbRun(`INSERT INTO academy_videos
        (course_id,title,title_hi,youtube_url,youtube_id,duration_seconds,sequence_order,is_mandatory,stars_on_complete,is_published)
        VALUES (?,?,?,?,?,?,?,1,15,1)`,
        [course.id, v.title||`Video ${v.order}`, v.titleHi||"",
         v.url, ytId, v.durationSeconds||900, v.order]);
    }

    let quizId: number|null = null;

    // Create quiz + questions if MCQs provided
    if (body.mcqs?.length > 0) {
      await dbRun(`INSERT INTO academy_quizzes
        (course_id,title,title_hi,time_limit_minutes,passing_percent,max_attempts,cooldown_hours,shuffle_questions,stars_on_pass,stars_on_perfect,is_published)
        VALUES (?,?,?,30,?,3,24,1,50,80,1)`,
        [course.id, body.title+" — Quiz", body.titleHi+" — परीक्षा", body.passingPercent||60]);

      const quiz = await dbGet<{id:number}>("SELECT id FROM academy_quizzes WHERE course_id=?",[course.id]);
      quizId = quiz?.id || null;

      if (quiz) {
        const ansMap: Record<string,number> = {A:0,B:1,C:2,D:3};
        for (let i=0; i<body.mcqs.length; i++) {
          const m = body.mcqs[i];
          const opts = [m.optA, m.optB, m.optC, m.optD].filter(Boolean);
          const ci = ansMap[m.answer?.toUpperCase()]??0;
          const correct = opts[ci] || opts[0];
          await dbRun(`INSERT INTO academy_questions
            (quiz_id,question_text,question_hi,question_type,options,correct_answer,marks,negative_marks,difficulty,order_index,is_active)
            VALUES (?,?,?,"single",?,?,1,0,?,?,1)`,
            [quiz.id, m.question, m.question, JSON.stringify(opts), JSON.stringify(correct),
             i<Math.floor(body.mcqs.length/3)?"easy":i<Math.floor(2*body.mcqs.length/3)?"medium":"hard", i+1]);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Course "${body.title}" published! ${body.videos.length} video(s) + ${body.mcqs?.length||0} MCQs added.`,
      courseId: course.id,
      quizId,
      courseUrl: `/academy/courses/${slug}`,
    });

  } catch (err) {
    console.error("Create course error:", err);
    return NextResponse.json({ success:false, message: err instanceof Error ? err.message : "Failed to create course." }, { status:500 });
  }
}
