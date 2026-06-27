import { NextResponse } from "next/server";
import { listAllQuestionRows } from "@/lib/repo/km-assessment";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  return NextResponse.json({ questions: listAllQuestionRows() });
}
