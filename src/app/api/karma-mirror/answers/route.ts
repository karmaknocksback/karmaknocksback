import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { saveAnswers, getSession } from "@/lib/repo/km-assessment";

const schema = z.object({
  sessionId: z.string().min(1),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      value: z.number().int().min(1).max(5),
    })
  ).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const session = await getSession(data.sessionId);
    if (!session) {
      return NextResponse.json({ success: false, error: "सत्र नहीं मिला" }, { status: 404 });
    }

    await saveAnswers(data.sessionId, data.answers);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/karma-mirror/answers] error:", err);
    return NextResponse.json({ success: false, error: "उत्तर सहेजने में त्रुटि" }, { status: 400 });
  }
}
