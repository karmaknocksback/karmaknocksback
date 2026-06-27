import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateQuestionRow } from "@/lib/repo/km-assessment";
import { requireAdmin } from "@/lib/require-admin";

const updateSchema = z.object({
  textHi: z.string().min(3),
  trait: z.enum(["krodh", "maan", "maya", "lobh", "bhaya", "moh"]),
  reverseScored: z.boolean(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  try {
    const body = await req.json();
    const data = updateSchema.parse(body);
    const question = await updateQuestionRow(id, data);
    if (!question) return NextResponse.json({ error: "नहीं मिला" }, { status: 404 });
    return NextResponse.json({ success: true, question });
  } catch (err) {
    console.error("[api/admin/karma-mirror/questions/:id] error:", err);
    return NextResponse.json({ error: "अपडेट में त्रुटि" }, { status: 400 });
  }
}
