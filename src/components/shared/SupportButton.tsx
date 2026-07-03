"use client";

import { useState } from "react";
import { Heart, X, ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";

const AMOUNTS = ["₹51", "₹101", "₹501", "₹1001"];

export default function SupportButton() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Hide on shop page — shop has its own donation context
  if (pathname.startsWith("/shop")) return null;

  return (
    <>
      {/* Fixed catchy button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Support Us"
        className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 rounded-full py-3 pl-3.5 pr-5 shadow-2xl transition-all duration-300 hover:scale-105 hover:pr-6"
        style={{
          background: "linear-gradient(135deg, #f7d8a3 0%, #c89b3c 55%, #9c7726 100%)",
          boxShadow: "0 4px 24px rgba(200,155,60,0.55), 0 0 0 3px rgba(200,155,60,0.15), 0 1px 0 rgba(255,255,255,0.4) inset",
        }}
      >
        {/* Pulsing heart icon */}
        <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/30">
          <Heart size={14} className="fill-charcoal text-charcoal" />
          <span className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-60" />
        </span>
        <div className="text-left">
          <p className="font-sans text-[10px] font-black uppercase tracking-widest text-charcoal/70 leading-none">Support</p>
          <p className="font-sans text-sm font-bold text-charcoal leading-tight">KarmaKnocksBack</p>
        </div>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Popup card */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-72 rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 0 0 1px rgba(200,155,60,0.25), 0 24px 64px rgba(0,0,0,0.35)" }}
        >
          {/* Dark header */}
          <div
            className="relative px-5 pt-6 pb-5 text-center"
            style={{ background: "linear-gradient(160deg, #1a0800 0%, #2d1200 100%)" }}
          >
            {/* Top gold line */}
            <div className="absolute top-0 left-8 right-8 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(200,155,60,0.9), transparent)" }} />

            <button onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-warm-white/35 hover:text-warm-white transition-colors">
              <X size={15} />
            </button>

            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: "linear-gradient(135deg, rgba(200,155,60,0.3), rgba(200,155,60,0.1))", border: "1px solid rgba(200,155,60,0.4)" }}>
              <Heart size={24} className="text-gold fill-current" />
            </div>

            <p className="font-display-hi text-xl text-warm-white mb-2">हमें Support करें</p>
            <p className="font-hindi text-[11px] text-warm-white/55 leading-relaxed">
              आपके सहयोग का{" "}
              <span className="text-gold font-semibold">50% दान</span>{" "}
              में जाता है। बाकी से वेबसाइट, production व content चलता है।
              प्रभु की कृपा से जो बचे वह हमारे लिए।
            </p>
          </div>

          {/* White body */}
          <div className="bg-white px-5 pt-5 pb-5">
            <p className="font-sans text-[10px] uppercase tracking-widest text-charcoal/35 mb-3 text-center">
              Choose an amount
            </p>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {AMOUNTS.map((amt) => (
                <a key={amt}
                  href={`https://rzp.io/rzp/karmaknocksback`}
                  target="_blank" rel="noopener noreferrer"
                  className="rounded-xl border-2 border-charcoal/8 py-2.5 text-center font-display text-sm font-bold text-charcoal/65 transition-all hover:border-gold hover:text-gold-deep hover:bg-gold/8 hover:scale-105">
                  {amt}
                </a>
              ))}
            </div>

            <a
              href="https://rzp.io/rzp/karmaknocksback"
              target="_blank" rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-sans text-sm font-bold text-charcoal transition-transform hover:scale-[1.02] mb-3"
              style={{
                background: "linear-gradient(135deg, #f7d8a3, #c89b3c)",
                boxShadow: "0 4px 16px rgba(200,155,60,0.4)",
              }}
            >
              <Heart size={14} className="fill-current" />
              Donate via UPI / Card
              <ExternalLink size={12} />
            </a>

            <p className="font-sans text-[10px] text-charcoal/30 text-center">
              🙏 हर योगदान का स्वागत है — चाहे ₹1 भी हो
            </p>
          </div>
        </div>
      )}
    </>
  );
}
