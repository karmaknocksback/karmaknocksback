import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createContactMessage } from "@/lib/repo/requests";
import { sendContactAck, sendAdminNotification } from "@/lib/email";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const id = await createContactMessage(data);

    await sendAdminNotification("संपर्क संदेश", {
      "नाम": data.name, "ईमेल": data.email,
      "विषय": data.subject, "संदेश": data.message,
    });

    await sendContactAck(data.email, data.name, data.subject);

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("[api/contact] error:", err);
    return NextResponse.json({ success: false, error: "अमान्य डेटा" }, { status: 400 });
  }
}
