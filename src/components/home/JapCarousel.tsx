"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import JapCard from "@/components/shared/JapCard";
import type { JapData } from "@/types";

export default function JapCarousel({ japs }: { japs: JapData[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollBy(amount: number) {
    scrollerRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  if (!japs.length) {
    return (
      <p className="font-hindi text-center text-charcoal/50 py-10">
        जाप लाइब्रेरी अभी तैयार हो रही है — कृपया शीघ्र पुनः देखें।
      </p>
    );
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x"
      >
        {japs.map((jap) => (
          <div key={jap._id} className="w-[78%] sm:w-[320px] shrink-0 snap-start">
            <JapCard jap={jap} />
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-center gap-3">
        <button
          aria-label="पीछे"
          onClick={() => scrollBy(-340)}
          className="rounded-full border border-gold/30 p-2.5 text-gold-deep hover:bg-gold/10"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          aria-label="आगे"
          onClick={() => scrollBy(340)}
          className="rounded-full border border-gold/30 p-2.5 text-gold-deep hover:bg-gold/10"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
