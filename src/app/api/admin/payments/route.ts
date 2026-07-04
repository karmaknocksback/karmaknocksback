import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listPayments, createPayment } from "@/lib/repo/payments";
import { requireAdmin } from "@/lib/require-admin";
import { sendEmail } from "@/lib/email";
import { SITE } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const status = req.nextUrl.searchParams.get("status") || undefined;
  return NextResponse.json({ payments: await listPayments(status) });
}

const createSchema = z.object({
  linkedRequestType: z.enum(["custom_jap", "service"]).optional().nullable(),
  linkedRequestId: z.string().optional().nullable(),
  customerName: z.string().min(1),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  amountInr: z.number().positive(),
  note: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json();
    const data = createSchema.parse(body);
    const payment = await createPayment(data);

    const payUrl = `${SITE.url}/pay/${payment.referenceCode}`;

    if (data.customerEmail) {
      await sendEmail({
        to: data.customerEmail,
        subject: `भुगतान अनुरोध — ₹${data.amountInr} | KarmaKnocksBack`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
            <p style="font-size:18px;color:#9c7726;font-weight:600;">कर्म KarmaKnocksBack</p>
            <h2 style="color:#1a1a1a;font-size:18px;">नमस्ते ${data.customerName} जी,</h2>
            <p style="color:#1a1a1a;font-size:14px;line-height:1.6;">
              आपके अनुरोध हेतु राशि <strong>₹${data.amountInr}</strong> का भुगतान लिंक तैयार है${data.note ? ` — ${data.note}` : ""}।
            </p>
            <a href="${payUrl}" style="display:inline-block;margin:16px 0;padding:12px 28px;background:linear-gradient(120deg,#9c7726,#c89b3c);color:#fff9f0;text-decoration:none;border-radius:999px;font-weight:600;">
              भुगतान करें
            </a>
            <p style="color:#1a1a1a;font-size:13px;">या यह लिंक खोलें: ${payUrl}</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true, payment, payUrl });
  } catch (err) {
    console.error("[api/admin/payments] create error:", err);
    return NextResponse.json({ error: "भुगतान अनुरोध बनाने में त्रुटि" }, { status: 400 });
  }
}
