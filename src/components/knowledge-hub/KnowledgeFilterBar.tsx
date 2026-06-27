"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { KNOWLEDGE_CATEGORY_LABELS_HI } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Props {
  categories: string[];
}

export default function KnowledgeFilterBar({ categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const category = searchParams.get("category") || "";

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    router.push(`/knowledge-hub?${params.toString()}`);
  }

  function setCategory(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || params.get("category") === value) params.delete("category");
    else params.set("category", value);
    router.push(`/knowledge-hub?${params.toString()}`);
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="लेख, विषय खोजें…"
          className="w-full rounded-full border border-charcoal/10 bg-white py-3.5 pl-12 pr-5 font-hindi text-sm outline-none focus:border-gold-deep"
        />
      </form>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full px-3.5 py-1.5 font-hindi text-xs transition-colors border",
              category === c
                ? "bg-gold-deep text-warm-white border-gold-deep"
                : "border-charcoal/10 text-charcoal/65 hover:border-gold-deep/40"
            )}
          >
            {KNOWLEDGE_CATEGORY_LABELS_HI[c] || c}
          </button>
        ))}
      </div>
    </div>
  );
}
