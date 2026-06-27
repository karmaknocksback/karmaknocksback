import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { getPaymentByReference, markPaymentPaid } from "@/lib/repo/payments";
import { unlockReport } from "@/lib/repo/km-assessment";

const schema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  referenceCode: z.string(),
  sessionId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Verify the signature — this is critical, never skip
    const valid = verifyRazorpaySignature(
      data.razorpay_order_id,
      data.razorpay_payment_id,
      data.razorpay_signature
    );

    if (!valid) {
      console.error("[razorpay/verify] Invalid signature", data);
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }

    // Mark payment as paid
    const payment = await getPaymentByReference(data.referenceCode);
    if (payment) {
      markPaymentPaid(payment._id, data.razorpay_payment_id, `Razorpay Order: ${data.razorpay_order_id}`);
    }

    // Unlock the report
    unlockReport(data.sessionId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[razorpay/verify] error:", err);
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}
