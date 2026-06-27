import GlassCard from "@/components/shared/GlassCard";
import { ArrowRight } from "lucide-react";

export default function ServiceCard({
  titleHi,
  description,
  startingPrice,
  onSelect,
  selected,
}: {
  titleHi: string;
  description: string;
  startingPrice: string;
  onSelect: () => void;
  selected: boolean;
}) {
  return (
    <GlassCard
      glow
      className={`p-6 flex flex-col h-full ${selected ? "ring-2 ring-gold-deep" : ""}`}
    >
      <h3 className="font-display-hi text-xl text-charcoal">{titleHi}</h3>
      <p className="font-hindi mt-2 text-sm text-charcoal/65 leading-relaxed flex-1">
        {description}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-sans text-sm text-gold-deep font-semibold">
          {startingPrice} से शुरू
        </span>
        <button
          onClick={onSelect}
          className="flex items-center gap-1 font-hindi text-xs text-charcoal/70 hover:text-gold-deep"
        >
          चुनें <ArrowRight size={13} />
        </button>
      </div>
    </GlassCard>
  );
}
