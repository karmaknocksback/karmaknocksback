"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import {
  JAP_CATEGORIES,
  JAP_CATEGORY_LABELS_HI,
  PLANETS,
  PLANET_LABELS_HI,
  DURATION_BUCKETS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function SearchFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");

  const category = searchParams.get("category") || "";
  const planet = searchParams.get("planet") || "";
  const duration = searchParams.get("duration") || "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/jap-library?${params.toString()}`);
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    router.push(`/jap-library?${params.toString()}`);
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="जाप, मंत्र, ग्रह खोजें…"
          className="w-full rounded-full border border-charcoal/10 bg-white py-3.5 pl-12 pr-5 font-hindi text-sm outline-none focus:border-gold-deep"
        />
      </form>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <FilterGroup label="श्रेणी">
          {JAP_CATEGORIES.map((c) => (
            <Chip
              key={c}
              active={category === c}
              onClick={() => updateParam("category", c)}
            >
              {JAP_CATEGORY_LABELS_HI[c]}
            </Chip>
          ))}
        </FilterGroup>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <FilterGroup label="ग्रह">
          {PLANETS.map((p) => (
            <Chip key={p} active={planet === p} onClick={() => updateParam("planet", p)}>
              {PLANET_LABELS_HI[p]}
            </Chip>
          ))}
        </FilterGroup>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <FilterGroup label="अवधि">
          {DURATION_BUCKETS.map((d) => (
            <Chip
              key={d.value}
              active={duration === d.value}
              onClick={() => updateParam("duration", d.value)}
            >
              {d.label}
            </Chip>
          ))}
        </FilterGroup>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <span className="font-sans text-[11px] uppercase tracking-wider text-charcoal/40 mr-1">
        {label}
      </span>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 font-hindi text-xs transition-colors border",
        active
          ? "bg-gold-deep text-warm-white border-gold-deep"
          : "border-charcoal/10 text-charcoal/65 hover:border-gold-deep/40"
      )}
    >
      {children}
    </button>
  );
}
