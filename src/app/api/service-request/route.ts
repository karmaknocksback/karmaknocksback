import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRequest } from "@/lib/repo/requests";
import { notifyAdminAllChannels, rowsToHtml, sendAcknowledgment } from "@/lib/email";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  service: z.string().min(2),
  requirement: z.string().min(5),
  budget: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const id = await createServiceRequest(data);

    await notifyAdminAllChannels(
      `नया Service Inquiry — ${data.service}`,
      rowsToHtml({
        नाम: data.name,
        ईमेल: data.email,
        फ़ोन: data.phone,
        सेवा: data.service,
        आवश्यकता: data.requirement,
        बजट: data.budget,
      }),
      `नया Service Inquiry: ${data.name} — ${data.service}`
    );

    await sendAcknowledgment({
      to: data.email,
      name: data.name,
      title: "आपकी सेवा पूछताछ प्राप्त हो गई है",
      bodyHtml: `<p style="color:#1a1a1a;font-size:14px;">सेवा: <strong>${data.service}</strong></p>`,
    });

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("[api/service-request] error:", err);
    return NextResponse.json({ success: false, error: "अमान्य डेटा" }, { status: 400 });
  }
}
