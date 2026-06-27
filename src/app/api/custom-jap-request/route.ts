import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCustomJapRequest } from "@/lib/repo/requests";
import { notifyAdminAllChannels, rowsToHtml, sendAcknowledgment } from "@/lib/email";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  whatsapp: z.string().min(5),
  country: z.string().min(2),
  purpose: z.string().min(2),
  detailedProblem: z.string().min(5),
  preferredVoice: z.string(),
  musicType: z.string(),
  durationMinutes: z.string(),
  urgency: z.enum(["Normal", "Urgent"]),
  budget: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const id = await createCustomJapRequest(data);

    await notifyAdminAllChannels(
      `नया Custom Jap Request — ${data.fullName}`,
      rowsToHtml({
        "पूरा नाम": data.fullName,
        ईमेल: data.email,
        फ़ोन: data.phone,
        WhatsApp: data.whatsapp,
        देश: data.country,
        उद्देश्य: data.purpose,
        समस्या: data.detailedProblem,
        स्वर: data.preferredVoice,
        संगीत: data.musicType,
        अवधि: `${data.durationMinutes} मिनट`,
        प्राथमिकता: data.urgency,
        बजट: data.budget,
      }),
      `नया Custom Jap Request: ${data.fullName} — ${data.purpose} (बजट: ${data.budget})`
    );

    await sendAcknowledgment({
      to: data.email,
      name: data.fullName,
      title: "आपका Custom Jap Request प्राप्त हो गया है",
      bodyHtml: `
        <p style="color:#1a1a1a;font-size:14px;">उद्देश्य: <strong>${data.purpose}</strong></p>
        <p style="color:#1a1a1a;font-size:14px;">हमारी टीम आपके अनुरोध की समीक्षा करेगी और शुल्क तय होने के बाद आपको भुगतान लिंक भेजा जाएगा।</p>
      `,
    });

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("[api/custom-jap-request] error:", err);
    return NextResponse.json({ success: false, error: "अमान्य डेटा" }, { status: 400 });
  }
}
