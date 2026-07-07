import { NextRequest, NextResponse } from "next/server";
import { getQuizQuestions } from "@/lib/academy/repo/quiz";
import { dbGet } from "@/lib/db";
export async function GET(_: NextRequest, { params }: { params: Promise<{id:string}> }) {
  const { id } = await params;
  const quiz = await dbGet<{id:number;title:string;time_limit_minutes:number;passing_percent:number;max_attempts:number;shuffle_questions:number}>( "SELECT id,title,time_limit_minutes,passing_percent,max_attempts,shuffle_questions FROM academy_quizzes WHERE id=?", [id]);
  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  const questions = await getQuizQuestions(quiz.id, quiz.shuffle_questions===1);
  const safeQs = questions.map(q=>({ id:q.id, question_text:q.question_text, question_hi:q.question_hi, question_type:q.question_type, options:JSON.parse(q.options), marks:q.marks, hint:q.hint, image_url:q.image_url, difficulty:q.difficulty }));
  return NextResponse.json({ quiz, questions: safeQs });
}
