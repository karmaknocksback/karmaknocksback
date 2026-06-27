"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const TARGETS = [108, 1008];

export default function JapCounter() {
  const [target, setTarget] = useState(108);
  const [count, setCount] = useState(0);

  const progress = Math.min(100, (count / target) * 100);
  const complete = count >= target;

  return (
    <div className="glass-card gold-glow rounded-2xl p-6 text-center">
      <p className="font-hindi text-sm font-semibold text-charcoal/70 mb-4">
        जाप काउंटर
      </p>

      <div className="flex justify-center gap-2 mb-5">
        {TARGETS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTarget(t);
              setCount(0);
            }}
            className={cn(
              "rounded-full px-4 py-1.5 font-sans text-xs border transition-colors",
              target === t
                ? "bg-gold-deep text-warm-white border-gold-deep"
                : "border-charcoal/15 text-charcoal/60"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <button
        onClick={() => setCount((c) => Math.min(target, c + 1))}
        className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-saffron/60 to-gold/40 text-charcoal shadow-inner active:scale-95 transition-transform"
        aria-label="जाप गिनें"
      >
        <svg className="absolute inset-0" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(200,155,60,0.15)" strokeWidth="6" />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#9C7726"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 46}`}
            strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress / 100)}`}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <span className="font-display text-2xl text-gold-deep">{count}</span>
      </button>

      <p className="mt-4 font-hindi text-xs text-charcoal/55">
        {complete ? "जाप पूर्ण हुआ 🙏" : `${target - count} बाकी`}
      </p>

      <button
        onClick={() => setCount(0)}
        className="mt-3 inline-flex items-center gap-1.5 font-hindi text-xs text-gold-deep underline-offset-4 hover:underline"
      >
        <RotateCcw size={13} /> पुनः आरंभ करें
      </button>
    </div>
  );
}
