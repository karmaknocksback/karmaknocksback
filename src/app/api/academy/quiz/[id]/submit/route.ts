import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/academy/auth";
import { submitQuizAttempt, canAttemptQuiz } from "@/lib/academy/repo/quiz";

export async function POST(req: NextRequest, { params }: { params: Promise<{id:string}> }) {
  const token = req.cookies.get("academy_token")?.value || req.headers.get("authorization")?.replace("Bearer ","");
  const user = token ? await getUserFromToken(token) : null;
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!user.email_verified) return NextResponse.json({ error: "Please verify your email first" }, { status: 403 });
  const { id } = await params;
  const { courseId, answers } = await req.json();

  const canAttempt = await canAttemptQuiz(user.id, Number(id));
  if (!canAttempt.canAttempt) return NextResponse.json({ error: canAttempt.reason }, { status: 403 });

  const result = await submitQuizAttempt(user.id, Number(id), courseId, answers || {});
  return NextResponse.json(result);
}
