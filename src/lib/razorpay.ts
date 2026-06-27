/**
 * Razorpay integration — replaces the manual UPI-link approach.
 * Benefits over plain UPI links:
 * - Automatic payment confirmation via webhooks (no manual "mark paid")
 * - Works on all devices with Razorpay's hosted checkout (handles UPI,
 *   cards, netbanking, wallets — user picks)
 * - Test mode works with Razorpay test keys (rzp_test_*)
 *
 * SETUP (one-time, ~5 minutes):
 * 1. RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are already in .env.local
 * 2. To enable automatic payment confirmation:
 *    - Go to razorpay.com/app/webhooks → Add Webhook
 *    - URL: https://yourdomain.com/api/webhooks/razorpay
 *    - Events: payment.captured
 *    - Copy the Webhook Secret into .env.local as RAZORPAY_WEBHOOK_SECRET
 * 3. Without webhook secret set, payments still work but you'd need to
 *    manually verify in the dashboard or poll the order status.
 */
import crypto from "crypto";
import Razorpay from "razorpay";

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

export const razorpay = KEY_ID && KEY_SECRET
  ? new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET })
  : null;

export const razorpayKeyId = KEY_ID || null;

export interface RazorpayOrderResult {
  orderId: string;
  amount: number; // in paise
  currency: string;
  keyId: string;
}

/** Create a Razorpay order for a given amount in INR */
export async function createRazorpayOrder(
  amountInr: number,
  receiptId: string,
  notes?: Record<string, string>
): Promise<RazorpayOrderResult | null> {
  if (!razorpay || !KEY_ID) {
    console.warn("[razorpay] RAZORPAY_KEY_ID/SECRET not configured");
    return null;
  }
  const order = await razorpay.orders.create({
    amount: Math.round(amountInr * 100), // Razorpay uses paise
    currency: "INR",
    receipt: receiptId.slice(0, 40), // max 40 chars
    notes: notes || {},
  });
  return {
    orderId: order.id as string,
    amount: order.amount as number,
    currency: order.currency as string,
    keyId: KEY_ID,
  };
}

/** Verify the payment signature returned by Razorpay checkout —
 * MUST be called before marking any payment as successful. */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!KEY_SECRET) return false;
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(body)
    .digest("hex");
  return expected === signature;
}

/** Verify a Razorpay webhook signature — called in the webhook handler
 * to confirm the request genuinely came from Razorpay. */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  if (!WEBHOOK_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
}
