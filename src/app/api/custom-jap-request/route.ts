import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCustomJapRequest } from "@/lib/repo/requests";
import { sendCustomJapAck, sendAdminNotification } from "@/lib/email";

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

    await sendAdminNotification("Custom Jap Request", {
      "नाम": data.fullName, "ईमेल": data.email,
      "उद्देश्य": data.purpose, "विवरण": data.detailedProblem,
      "बजट": data.budget,
    });

    await sendCustomJapAck(data.email, data.fullName, data.purpose);

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("[api/custom-jap-request] error:", err);
    return NextResponse.json({ success: false, error: "अमान्य डेटा" }, { status: 400 });
  }
}
