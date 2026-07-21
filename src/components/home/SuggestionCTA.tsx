"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";

export default function SuggestionCTA() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setStatus("loading");
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Anonymous Visitor",
          email: "no-reply@karmaknocksback.com",
          subject: "जाप सुझाव (Home CTA)",
          message: value,
        }),
      });
    } finally {
      setStatus("done");
      setValue("");
    }
  }

  return (
    <section className="px-5 sm:px-8 py-24">
      <div
        className="max-w-3xl mx-auto relative overflow-hidden rounded-3xl text-center px-8 sm:px-16 py-16"
        style={{
          background: "linear-gradient(135deg, #1a0800 0%, #2d1200 50%, #1a0800 100%)",
          boxShadow:
            "0 0 0 1px rgba(200,155,60,0.2), 0 0 80px rgba(200,155,60,0.12), 0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo.webp"
          alt=""
          aria-hidden
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 h-full opacity-10 pointer-events-none select-none"
        />
        <div
          className="absolute top-0 left-1/4 right-1/4 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(200,155,60,0.8), transparent)",
          }}
        />
        <div className="relative">
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-gold mb-5">
            आपका सुझाव
          </p>
          <h2 className="font-display-hi text-3xl sm:text-4xl text-warm-white mb-4">
            आप किस जाप का इंतजार कर रहे हैं?
          </h2>
          <p className="font-hindi text-warm-white/55 text-sm sm:text-base mb-10">
            अपना सुझाव भेजें — हम उसे जल्द ही लाइब्रेरी में जोड़ने का प्रयास
            करेंगे।
          </p>
          {status === "done" ? (
            <p className="font-hindi text-gold text-lg">
              सुझाव प्राप्त हुआ, धन्यवाद! 🙏
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
            >
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="जैसे: हनुमान चालीसा जाप, सरस्वती मंत्र…"
                className="flex-1 rounded-full border border-gold/20 bg-white/5 px-5 py-3.5 font-hindi text-sm text-warm-white placeholder:text-warm-white/30 outline-none focus:border-gold/50 backdrop-blur-sm"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-hindi text-sm font-medium text-charcoal disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #f7d8a3, #c89b3c)",
                  boxShadow: "0 0 20px rgba(200,155,60,0.4)",
                }}
              >
                <Send size={15} /> भेजें
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
