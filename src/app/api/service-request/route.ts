import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRequest } from "@/lib/repo/requests";
import { sendAdminNotification, sendEmail } from "@/lib/email";
import { contactAckTemplate } from "@/lib/email-templates";

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

    await sendAdminNotification("Service Inquiry", {
      "नाम": data.name, "ईमेल": data.email, "फ़ोन": data.phone,
      "सेवा": data.service, "आवश्यकता": data.requirement, "बजट": data.budget,
    });
    await sendEmail({
      to: data.email,
      subject: `आपकी सेवा पूछताछ प्राप्त हुई — KarmaKnocksBack`,
      html: contactAckTemplate(data.name, `सेवा: ${data.service}`),
    });

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("[api/service-request] error:", err);
    return NextResponse.json({ success: false, error: "अमान्य डेटा" }, { status: 400 });
  }
}
