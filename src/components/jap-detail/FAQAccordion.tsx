"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FAQItem } from "@/types";

export default function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  if (!items?.length) return null;

  return (
    <div className="divide-y divide-charcoal/8">
      {items.map((item, i) => (
        <div key={i} className="py-3">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-3 text-left"
            aria-expanded={open === i}
          >
            <span className="font-hindi text-sm font-medium text-charcoal">
              {item.question}
            </span>
            <ChevronDown
              size={16}
              className={cn(
                "shrink-0 text-gold-deep transition-transform",
                open === i && "rotate-180"
              )}
            />
          </button>
          {open === i && (
            <p className="font-hindi mt-2 text-sm text-charcoal/65 leading-relaxed">
              {item.answer}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
