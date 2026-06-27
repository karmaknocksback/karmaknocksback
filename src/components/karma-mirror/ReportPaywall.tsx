"use client";

import { useState } from "react";
import { Lock, Sparkles, Target, RefreshCw, Brain, Leaf } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

const LOCKED_FEATURES = [
  { icon: Target, text: "ट्रिगर मैप — क्या चीजें आपको instantly react करवाती हैं" },
  { icon: RefreshCw, text: "भावनात्मक लूप — आपके repeating patterns का गहरा विश्लेषण" },
  { icon: Brain, text: "मनोवैज्ञानिक व्याख्या — आधुनिक psychology की नजर से" },
  { icon: Leaf, text: "जैन दृष्टिकोण — आत्मशुद्धि का मार्ग" },
  { icon: Sparkles, text: "पूर्ण अभ्यास योजना + कुंडली प्रतिबिंब" },
];

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function ReportPaywall({ sessionId }: { sessionId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setLoading(true);
    setError(null);

    try {
      // Create order
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, amountInr: 99, purpose: "Karma Mirror Full Report" }),
      });
      const orderData = await orderRes.json();

      if (orderData.alreadyUnlocked) {
        window.location.reload();
        return;
      }

      // Razorpay not configured — fall back to UPI link
      if (orderData.razorpayUnavailable && orderData.fallbackPayUrl) {
        window.open(orderData.fallbackPayUrl, "_blank");
        setLoading(false);
        return;
      }

      if (!orderData.orderId) throw new Error("Order creation failed");

      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Razorpay script failed to load");

      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "KarmaKnocksBack",
        description: "Karma Mirror — पूरी रिपोर्ट",
        image: "/images/logo.png",
        prefill: {
          name: orderData.prefill?.name || "",
          email: orderData.prefill?.email || "",
        },
        theme: { color: "#c89b3c" },
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          // Verify server-side and unlock
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              referenceCode: orderData.referenceCode,
              sessionId,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            window.location.reload();
          } else {
            setError("Payment verified but unlock failed — please refresh the page.");
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });
      rzp.open();
    } catch (err) {
      console.error("[ReportPaywall] payment error:", err);
      setError("कुछ त्रुटि हुई। कृपया पुनः प्रयास करें।");
      setLoading(false);
    }
  }

  return (
    <GlassCard className="overflow-hidden">
      {/* Blurred preview */}
      <div className="relative">
        <div className="p-6 sm:p-8 opacity-20 blur-[3px] pointer-events-none select-none">
          <h2 className="font-display-hi text-xl text-charcoal mb-4">🎯 ट्रिगर मैप</h2>
          <p className="font-hindi text-sm text-charcoal/75 leading-relaxed">
            आपका सबसे बड़ा trigger है — जब कोई आपकी बात को बीच में काटता है या आपकी मेहनत को नजरअंदाज करता है। यह pattern आपके early life experiences से जुड़ा हुआ है...
          </p>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ background: "linear-gradient(180deg, rgba(255,249,240,0.2) 0%, rgba(255,249,240,0.97) 40%)" }}>
          <Lock size={32} className="text-gold-deep mb-3" />
          <h3 className="font-display-hi text-2xl text-charcoal mb-1">पूरी रिपोर्ट अनलॉक करें</h3>
          <p className="font-hindi text-charcoal/55 text-sm">एक बार भुगतान, हमेशा के लिए access</p>
        </div>
      </div>

      {/* What's inside */}
      <div className="px-6 sm:px-8 py-5 border-t border-charcoal/8">
        <p className="font-hindi text-xs uppercase tracking-wider text-charcoal/40 mb-4">पूरी रिपोर्ट में मिलेगा</p>
        <div className="space-y-3">
          {LOCKED_FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 mt-0.5">
                <Icon size={12} className="text-gold-deep" />
              </span>
              <p className="font-hindi text-sm text-charcoal/70">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Price + CTA */}
      <div className="p-6 sm:p-8 border-t border-charcoal/8 text-center">
        <p className="font-display text-5xl font-bold text-charcoal mb-1">₹99</p>
        <p className="font-hindi text-xs text-charcoal/45 mb-6">एकमुश्त · कोई subscription नहीं</p>

        {error && (
          <p className="font-hindi text-xs text-red-500 mb-4">{error}</p>
        )}

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full rounded-full py-4 font-hindi font-semibold text-lg text-charcoal disabled:opacity-60 mb-4 transition-transform hover:scale-[1.02]"
          style={{
            background: "linear-gradient(135deg, #f7d8a3, #c89b3c)",
            boxShadow: "0 0 30px rgba(200,155,60,0.35)",
          }}
        >
          {loading ? "प्रतीक्षा करें..." : "अभी भुगतान करें — ₹99"}
        </button>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          {["UPI", "GPay", "PhonePe", "Cards", "NetBanking"].map(m => (
            <span key={m} className="font-sans text-[11px] text-charcoal/35 border border-charcoal/10 px-2 py-0.5 rounded">{m}</span>
          ))}
        </div>
        <p className="font-hindi text-[11px] text-charcoal/30 mt-3">
          Razorpay द्वारा सुरक्षित · भुगतान के तुरंत बाद रिपोर्ट unlock होगी
        </p>
      </div>
    </GlassCard>
  );
}
