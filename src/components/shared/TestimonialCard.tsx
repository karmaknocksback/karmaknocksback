import { Star } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import type { TestimonialData } from "@/types";

export default function TestimonialCard({ t }: { t: TestimonialData }) {
  return (
    <GlassCard className="p-6 h-full flex flex-col">
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={15}
            className={i < t.rating ? "fill-gold text-gold" : "text-gold/20"}
          />
        ))}
      </div>
      <p className="font-hindi text-sm text-charcoal/80 leading-relaxed flex-1">
        “{t.review}”
      </p>
      <div className="mt-4 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 font-display text-sm text-gold-deep">
          {t.name.charAt(0)}
        </span>
        <div>
          <p className="font-hindi text-sm font-medium text-charcoal">{t.name}</p>
          <p className="font-sans text-xs text-charcoal/50">{t.city}</p>
        </div>
      </div>
    </GlassCard>
  );
}
