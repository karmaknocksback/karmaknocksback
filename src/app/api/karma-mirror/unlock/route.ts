import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, unlockReport } from "@/lib/repo/km-assessment";
import { createPayment, getPaymentByReference } from "@/lib/repo/payments";
import { SITE } from "@/lib/constants";

const schema = z.object({ sessionId: z.string().min(1) });

// POST — create a ₹99 UPI payment link for this session
export async function POST(req: NextRequest) {
  try {
    const { sessionId } = schema.parse(await req.json());
    const session = await getSession(sessionId);
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    if (session.reportUnlocked) {
      return NextResponse.json({ alreadyUnlocked: true });
    }

    const payment = await createPayment({
      linkedRequestType: "custom_jap",
      linkedRequestId: sessionId,
      customerName: session.name || `KM Session ${sessionId}`,
      customerEmail: session.email || undefined,
      amountInr: 99,
      note: `Karma Mirror Full Report — Session ${sessionId}`,
    });

    const payUrl = `${SITE.url}/pay/${payment.referenceCode}`;
    return NextResponse.json({ success: true, payUrl, referenceCode: payment.referenceCode });
  } catch (err) {
    console.error("[api/karma-mirror/unlock] error:", err);
    return NextResponse.json({ error: "त्रुटि हुई" }, { status: 400 });
  }
}

// GET /api/karma-mirror/unlock?sessionId=X&ref=CODE — check if paid and unlock
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  const ref = req.nextUrl.searchParams.get("ref");
  if (!sessionId) return NextResponse.json({ error: "missing sessionId" }, { status: 400 });

  const session = await getSession(sessionId);
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Already unlocked
  if (session.reportUnlocked) return NextResponse.json({ unlocked: true });

  // Check payment status
  if (ref) {
    const payment = await getPaymentByReference(ref);
    if (payment && payment.status === "paid" && payment.linkedRequestId === sessionId) {
      unlockReport(sessionId);
      return NextResponse.json({ unlocked: true });
    }
  }

  return NextResponse.json({ unlocked: false });
}
