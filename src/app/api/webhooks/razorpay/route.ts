import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { getPaymentByReference, markPaymentPaid } from "@/lib/repo/payments";
import { unlockReport } from "@/lib/repo/km-assessment";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";

  // If webhook secret is configured, verify authenticity
  if (process.env.RAZORPAY_WEBHOOK_SECRET) {
    const valid = verifyWebhookSignature(rawBody, signature);
    if (!valid) {
      console.error("[webhook/razorpay] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  let event: { event: string; payload?: { payment?: { entity?: Record<string, unknown> } } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.event === "payment.captured") {
    const payment = event.payload?.payment?.entity;
    if (!payment) return NextResponse.json({ ok: true });

    const paymentId = payment.id as string;
    const notes = payment.notes as Record<string, string> | null;
    const referenceCode = notes?.referenceCode;
    const sessionId = notes?.sessionId;

    if (referenceCode) {
      const dbPayment = await getPaymentByReference(referenceCode);
      if (dbPayment && dbPayment.status !== "paid") {
        markPaymentPaid(dbPayment._id, paymentId, `Razorpay webhook`);
        console.log(`[webhook] Payment ${referenceCode} marked paid via webhook`);
      }
    }

    if (sessionId) {
      await unlockReport(sessionId);
      console.log(`[webhook] Report unlocked for session ${sessionId} via webhook`);
    }
  }

  return NextResponse.json({ ok: true });
}
