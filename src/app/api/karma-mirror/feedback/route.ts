import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { saveFeedback, getSession } from "@/lib/repo/km-assessment";

const schema = z.object({
  sessionId: z.string().min(1),
  section: z.string().max(50).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const session = await getSession(data.sessionId);
    if (!session) {
      return NextResponse.json({ success: false, error: "सत्र नहीं मिला" }, { status: 404 });
    }

    await saveFeedback(data);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/karma-mirror/feedback] error:", err);
    return NextResponse.json({ success: false, error: "फीडबैक सहेजने में त्रुटि" }, { status: 400 });
  }
}
