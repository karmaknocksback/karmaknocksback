import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getPaymentByReference } from "@/lib/repo/payments";
import { getSettings } from "@/lib/repo/settings";
import { buildUpiLink } from "@/lib/upi";

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const payment = await getPaymentByReference(code);
  if (!payment) {
    return NextResponse.json({ error: "भुगतान अनुरोध नहीं मिला" }, { status: 404 });
  }

  const settings = await getSettings();
  let upiLink: string | null = null;
  let qrDataUrl: string | null = null;

  if (payment.status === "pending" && settings.upiId) {
    upiLink = buildUpiLink({
      upiId: settings.upiId,
      payeeName: settings.upiPayeeName || settings.siteName,
      amountInr: payment.amountInr,
      note: payment.note || "KarmaKnocksBack",
      referenceCode: payment.referenceCode,
    });
    try {
      qrDataUrl = await QRCode.toDataURL(upiLink, { width: 280, margin: 1 });
    } catch (err) {
      console.error("[api/payments/:code] QR generation failed:", err);
    }
  }

  return NextResponse.json({
    referenceCode: payment.referenceCode,
    customerName: payment.customerName,
    amountInr: payment.amountInr,
    note: payment.note,
    status: payment.status,
    upiLink,
    qrDataUrl,
    upiId: settings.upiId || null,
    payeeName: settings.upiPayeeName || settings.siteName,
  });
}
