import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createRazorpayOrder } from "@/lib/razorpay";
import { getSession } from "@/lib/repo/km-assessment";
import { createPayment } from "@/lib/repo/payments";

const schema = z.object({
  sessionId: z.string().min(1),
  amountInr: z.number().positive().default(99),
  purpose: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, amountInr, purpose } = schema.parse(body);

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (session.reportUnlocked) {
      return NextResponse.json({ alreadyUnlocked: true });
    }

    // Create an internal payment record for tracking
    const payment = await createPayment({
      linkedRequestType: "custom_jap",
      linkedRequestId: sessionId,
      customerName: session.name || `KM-${sessionId}`,
      customerEmail: session.email || undefined,
      amountInr,
      note: purpose || `Karma Mirror Report — Session ${sessionId}`,
    });

    // Create the Razorpay order
    const order = await createRazorpayOrder(amountInr, payment.referenceCode, {
      sessionId,
      referenceCode: payment.referenceCode,
      purpose: purpose || "karma_mirror_report",
    });

    if (!order) {
      // Razorpay not configured — fall back to manual UPI flow
      const { SITE } = await import("@/lib/constants");
      return NextResponse.json({
        fallbackPayUrl: `${SITE.url}/pay/${payment.referenceCode}`,
        referenceCode: payment.referenceCode,
        razorpayUnavailable: true,
      });
    }

    return NextResponse.json({
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      keyId: order.keyId,
      referenceCode: payment.referenceCode,
      prefill: {
        name: session.name || "",
        email: session.email || "",
      },
    });
  } catch (err) {
    console.error("[api/razorpay/order] error:", err);
    return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
  }
}
