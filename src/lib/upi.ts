/**
 * UPI payment request links — uses the standard UPI URI scheme
 * (`upi://pay?...`), which any UPI app (GPay, PhonePe, Paytm, BHIM, bank
 * apps) understands. This deliberately does NOT go through a payment
 * gateway (Razorpay/PayU/Cashfree/etc.) — those require business KYC
 * verification, an approval process, and take a transaction fee. A plain
 * UPI link needs none of that: just the business owner's own UPI ID
 * (VPA), configured in /admin/settings.
 *
 * IMPORTANT, stated honestly: this means there's no automatic payment
 * confirmation. A UPI deep link opens the payer's UPI app with the
 * amount pre-filled, but nothing tells this server when (or whether)
 * the payment actually completes — there's no webhook, because there's
 * no gateway in the loop. The admin must manually verify the payment
 * arrived (check their bank/UPI app) and mark it as paid in
 * /admin/payments, optionally recording the UTR/reference number from
 * their bank statement. This is a real, accepted trade-off for a
 * zero-setup, zero-fee payment flow — not a corner cut silently.
 */

export interface UpiLinkInput {
  upiId: string;
  payeeName: string;
  amountInr: number;
  note: string;
  referenceCode: string;
}

export function buildUpiLink(input: UpiLinkInput): string {
  const params = new URLSearchParams({
    pa: input.upiId, // payee address (VPA)
    pn: input.payeeName, // payee name
    am: input.amountInr.toFixed(2), // amount
    cu: "INR",
    tn: input.note, // transaction note
    tr: input.referenceCode, // transaction reference (helps the admin match it later)
  });
  return `upi://pay?${params.toString()}`;
}
