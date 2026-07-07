import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/academy/auth";
import { submitQuizAttempt, canAttemptQuiz } from "@/lib/academy/repo/quiz";
export async function POST(req: NextRequest, { params }: { params: Promise<{id:string}> }) {
  const token = req.cookies.get("academy_token")?.value;
  const user = token ? await getUserFromToken(token) : null;
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!user.email_verified) return NextResponse.json({ error: "Please verify your email first" }, { status: 403 });
  const { id } = await params;
  const { courseId, check } = await req.json();
  if (check) {
    const canAttempt = await canAttemptQuiz(user.id, Number(id));
    return NextResponse.json(canAttempt);
  }
  const { answers } = await req.json().catch(() => ({answers:{}}));
  const result = await submitQuizAttempt(user.id, Number(id), courseId, answers||{});
  return NextResponse.json(result);
}
