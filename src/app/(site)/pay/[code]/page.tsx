"use client";

import { useEffect, useState, use as usePromise } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

interface PaymentInfo {
  referenceCode: string;
  customerName: string;
  amountInr: number;
  note?: string;
  status: "pending" | "paid" | "cancelled";
  upiLink: string | null;
  qrDataUrl: string | null;
  upiId: string | null;
  payeeName: string;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PayPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = usePromise(params);
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    fetch(`/api/payments/${code}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => setPayment(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [code]);

  async function handleRazorpay() {
    if (!payment) return;
    setPaying(true);
    try {
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: payment.referenceCode,
          amountInr: payment.amountInr,
          purpose: payment.note || "KarmaKnocksBack Payment",
        }),
      });
      const orderData = await orderRes.json();

      // Fall back to UPI if Razorpay not configured
      if (orderData.razorpayUnavailable && payment.upiLink) {
        window.open(payment.upiLink, "_blank");
        setPaying(false);
        return;
      }

      if (!orderData.orderId) throw new Error("Order creation failed");

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Razorpay failed to load");

      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "KarmaKnocksBack",
        description: payment.note || "भुगतान",
        image: "/images/logo.png",
        prefill: { name: payment.customerName },
        theme: { color: "#c89b3c" },
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              referenceCode: orderData.referenceCode,
              sessionId: payment.referenceCode,
            }),
          });
          setPaid(true);
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      rzp.open();
    } catch (err) {
      console.error("[pay page] payment error:", err);
      setPaying(false);
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-md px-5 py-24 text-center font-hindi text-charcoal/50">लोड हो रहा है...</div>;
  }
  if (notFound || !payment) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <p className="font-hindi text-charcoal/60">यह भुगतान लिंक मान्य नहीं है।</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <GlassCard glow className="p-8 text-center">
        <p className="font-hindi text-xs uppercase tracking-[0.2em] text-gold-deep mb-2">कर्म KarmaKnocksBack</p>
        <p className="font-hindi text-sm text-charcoal/60 mb-1">नमस्ते {payment.customerName} जी</p>
        {payment.note && <p className="font-hindi text-sm text-charcoal/70 mb-4">{payment.note}</p>}

        <p className="font-display text-5xl text-charcoal font-semibold my-5">
          ₹{payment.amountInr.toLocaleString("en-IN")}
        </p>

        {(payment.status === "paid" || paid) && (
          <div className="flex flex-col items-center gap-2 py-6">
            <CheckCircle2 size={48} className="text-green-600" />
            <p className="font-hindi text-green-700 font-medium">भुगतान सफलतापूर्वक प्राप्त हुआ!</p>
          </div>
        )}

        {payment.status === "cancelled" && (
          <div className="flex flex-col items-center gap-2 py-6">
            <XCircle size={48} className="text-red-400" />
            <p className="font-hindi text-red-500 font-medium">यह भुगतान अनुरोध रद्द कर दिया गया है</p>
          </div>
        )}

        {payment.status === "pending" && !paid && (
          <>
            <button
              onClick={handleRazorpay}
              disabled={paying}
              className="w-full rounded-full py-4 font-hindi font-semibold text-lg text-charcoal disabled:opacity-60 mb-4"
              style={{
                background: "linear-gradient(135deg, #f7d8a3, #c89b3c)",
                boxShadow: "0 0 30px rgba(200,155,60,0.4)",
              }}
            >
              {paying ? "प्रतीक्षा करें..." : "UPI / Card से भुगतान करें"}
            </button>

            {payment.qrDataUrl && (
              <details className="mt-4 text-left">
                <summary className="font-hindi text-xs text-charcoal/45 cursor-pointer text-center mb-3">
                  या UPI QR code से scan करें ↓
                </summary>
                <div className="flex flex-col items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={payment.qrDataUrl} alt="UPI QR" width={200} height={200} className="rounded-xl border border-charcoal/10" />
                </div>
              </details>
            )}

            <p className="font-hindi text-[11px] text-charcoal/40 mt-4">
              Ref: {payment.referenceCode} · Razorpay द्वारा सुरक्षित
            </p>
          </>
        )}
      </GlassCard>
    </div>
  );
}
