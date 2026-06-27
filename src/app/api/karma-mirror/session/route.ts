import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/repo/km-assessment";

const schema = z.object({
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  name: z.string().max(100).optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const data = schema.parse(body);
    const session = await createSession({
      experienceLevel: data.experienceLevel,
      name: data.name,
      email: data.email || undefined,
    });
    return NextResponse.json({ success: true, session });
  } catch (err) {
    console.error("[api/karma-mirror/session] error:", err);
    return NextResponse.json({ success: false, error: "सत्र शुरू करने में त्रुटि" }, { status: 400 });
  }
}
