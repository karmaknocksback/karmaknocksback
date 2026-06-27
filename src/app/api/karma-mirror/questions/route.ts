import { NextResponse } from "next/server";
import { listLiveQuestions } from "@/lib/repo/km-assessment";

export async function GET() {
  const questions = await listLiveQuestions();
  return NextResponse.json({ questions });
}
