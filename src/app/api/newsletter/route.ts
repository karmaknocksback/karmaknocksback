import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { upsertNewsletterSubscriber } from "@/lib/repo/newsletter";

const schema = z.object({
  email: z.string().email(),
  whatsapp: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    upsertNewsletterSubscriber(data.email, data.whatsapp);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/newsletter] error:", err);
    return NextResponse.json({ success: false, error: "अमान्य ईमेल" }, { status: 400 });
  }
}
