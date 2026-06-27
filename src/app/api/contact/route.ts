import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createContactMessage } from "@/lib/repo/requests";
import { notifyAdminAllChannels, rowsToHtml, sendAcknowledgment } from "@/lib/email";

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

    await notifyAdminAllChannels(
      `नया संपर्क संदेश — ${data.subject}`,
      rowsToHtml({
        नाम: data.name,
        ईमेल: data.email,
        फ़ोन: data.phone || "—",
        विषय: data.subject,
        संदेश: data.message,
      }),
      `नया संपर्क संदेश: ${data.name} — ${data.subject}`
    );

    await sendAcknowledgment({
      to: data.email,
      name: data.name,
      title: "आपका संदेश प्राप्त हो गया है",
      bodyHtml: `<p style="color:#1a1a1a;font-size:14px;">विषय: <strong>${data.subject}</strong></p>`,
    });

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("[api/contact] error:", err);
    return NextResponse.json({ success: false, error: "अमान्य डेटा" }, { status: 400 });
  }
}
