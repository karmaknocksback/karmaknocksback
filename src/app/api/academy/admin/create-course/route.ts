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

function extractYtId(url: string): string {
  const m = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return m?.[1] || "";
}

export async function POST(req: NextRequest) {
  try {
    await ensureAcademyDb();
    const body: Body = await req.json();

    if (!body.title?.trim() || !body.slug?.trim()) {
      return NextResponse.json({ success:false, message:"Title and slug are required." }, {status:400});
    }
    if (!body.videos?.length) {
      return NextResponse.json({ success:false, message:"At least one video is required." }, {status:400});
    }

    // Default category
    await dbRun(
      `INSERT OR IGNORE INTO academy_categories (name,name_hi,slug,icon,color,order_index) VALUES (?,?,?,?,?,?)`,
      ["General","सामान्य","general","📚","#FF9800",10]
    );
    const cat = await dbGet<{id:number}>("SELECT id FROM academy_categories WHERE slug=?",["general"]);

    const slug = body.slug.toLowerCase().replace(/[^a-z0-9-]/g,"").replace(/^-|-$/g,"");

    // Check for duplicate slug
    const existing = await dbGet<{id:number}>("SELECT id FROM academy_courses WHERE slug=?",[slug]);
    if (existing) {
      return NextResponse.json({ success:false, message:`A course with slug "${slug}" already exists. Change the title.` }, {status:409});
    }

    // Create course — all values parameterized
    await dbRun(
      `INSERT INTO academy_courses
       (title,title_hi,slug,description,category_id,difficulty,language,total_videos,passing_marks,stars_reward,is_published,is_featured,is_free)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        body.title.trim(),
        body.titleHi?.trim() || "",
        slug,
        body.description?.trim() || "",
        cat?.id ?? null,
        body.difficulty || "beginner",
        "hi",
        body.videos.length,
        body.passingPercent || 60,
        body.starsReward || 100,
        1, 1, 1
      ]
    );

    const course = await dbGet<{id:number}>("SELECT id FROM academy_courses WHERE slug=?",[slug]);
    if (!course) return NextResponse.json({ success:false, message:"Course insert failed." }, {status:500});

    // Insert videos
    for (const v of body.videos) {
      const ytId = v.youtubeId || extractYtId(v.url);
      await dbRun(
        `INSERT INTO academy_videos
         (course_id,title,title_hi,youtube_url,youtube_id,duration_seconds,sequence_order,is_mandatory,stars_on_complete,is_published)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [course.id, v.title || "Video", v.titleHi || "", v.url, ytId, v.durationSeconds || 900, v.order, 1, 15, 1]
      );
    }

    let quizId: number | null = null;

    if (body.mcqs?.length > 0) {
      // Create quiz
      await dbRun(
        `INSERT INTO academy_quizzes
         (course_id,title,title_hi,time_limit_minutes,passing_percent,max_attempts,cooldown_hours,shuffle_questions,stars_on_pass,stars_on_perfect,is_published)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [course.id, body.title + " — Quiz", (body.titleHi || body.title) + " — परीक्षा",
         30, body.passingPercent || 60, 3, 24, 1, 50, 80, 1]
      );

      const quiz = await dbGet<{id:number}>("SELECT id FROM academy_quizzes WHERE course_id=?",[course.id]);
      quizId = quiz?.id ?? null;

      if (quiz) {
        const ansMap: Record<string,number> = {A:0,B:1,C:2,D:3};
        const total = body.mcqs.length;

        for (let i = 0; i < total; i++) {
          const m = body.mcqs[i];
          const opts = [m.optA, m.optB, m.optC, m.optD].filter(Boolean);
          if (opts.length < 2) continue;

          const ci = ansMap[m.answer?.toUpperCase()] ?? 0;
          const correct = opts[ci] || opts[0];
          const difficulty = i < Math.floor(total/3) ? "easy" : i < Math.floor(2*total/3) ? "medium" : "hard";

          // ALL values as parameters — no string literals in SQL
          await dbRun(
            `INSERT INTO academy_questions
             (quiz_id,question_text,question_hi,question_type,options,correct_answer,marks,negative_marks,difficulty,order_index,is_active)
             VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            [quiz.id, m.question, m.question, "single", JSON.stringify(opts), JSON.stringify(correct), 1, 0, difficulty, i+1, 1]
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Course "${body.title}" published! ${body.videos.length} video(s) + ${body.mcqs?.length || 0} MCQs added.`,
      courseId: course.id,
      quizId,
      courseUrl: `/academy/courses/${slug}`,
    });

  } catch (err) {
    console.error("Create course error:", err);
    return NextResponse.json({
      success: false,
      message: err instanceof Error ? err.message : "Failed to create course."
    }, {status:500});
  }
}
