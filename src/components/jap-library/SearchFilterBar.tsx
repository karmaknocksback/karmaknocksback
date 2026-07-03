"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import {
  JAP_CATEGORIES, JAP_CATEGORY_LABELS_HI,
  PLANETS, PLANET_LABELS_HI,
  DURATION_BUCKETS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "views", label: "सर्वाधिक देखे गए" },
  { value: "newest", label: "नवीनतम" },
  { value: "duration-asc", label: "सबसे छोटा" },
  { value: "duration-desc", label: "सबसे लंबा" },
];

export default function SearchFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [showFilters, setShowFilters] = useState(false);

  // Multi-select: comma-separated in URL
  const categories = (searchParams.get("category") || "").split(",").filter(Boolean);
  const planets = (searchParams.get("planet") || "").split(",").filter(Boolean);
  const duration = searchParams.get("duration") || "";
  const sort = searchParams.get("sort") || "views";

  const activeCount = categories.length + planets.length + (duration ? 1 : 0);

  function buildParams(overrides: Record<string, string | string[]>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (!v || (Array.isArray(v) && v.length === 0)) params.delete(k);
      else params.set(k, Array.isArray(v) ? v.join(",") : v);
    });
    return params.toString();
  }

  function toggleMulti(key: string, current: string[], value: string) {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    router.push(`/jap-library?${buildParams({ [key]: next })}`);
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    router.push(`/jap-library?${buildParams({ q })}`);
  }

  function clearAll() {
    router.push(`/jap-library?sort=${sort}`);
    setQ("");
  }

  return (
    <div className="space-y-4">
      {/* Search + Sort row */}
      <div className="flex gap-3 max-w-3xl mx-auto">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="जाप, मंत्र, ग्रह खोजें…"
            className="w-full rounded-full border border-charcoal/10 bg-white py-3 pl-11 pr-4 font-hindi text-sm outline-none focus:border-gold-deep"
          />
        </form>

        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => router.push(`/jap-library?${buildParams({ sort: e.target.value })}`)}
            className="appearance-none rounded-full border border-charcoal/10 bg-white py-3 pl-4 pr-9 font-hindi text-sm outline-none focus:border-gold-deep cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 rounded-full border px-4 py-3 font-hindi text-sm transition-colors",
            showFilters || activeCount > 0
              ? "bg-gold-deep text-warm-white border-gold-deep"
              : "border-charcoal/10 text-charcoal/65"
          )}
        >
          <SlidersHorizontal size={15} />
          फ़िल्टर
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/30 text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Active filter chips */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 justify-center">
          {categories.map((c) => (
            <Chip key={c} active onRemove={() => toggleMulti("category", categories, c)}>
              {JAP_CATEGORY_LABELS_HI[c as keyof typeof JAP_CATEGORY_LABELS_HI] || c}
            </Chip>
          ))}
          {planets.map((p) => (
            <Chip key={p} active onRemove={() => toggleMulti("planet", planets, p)}>
              {PLANET_LABELS_HI[p as keyof typeof PLANET_LABELS_HI] || p}
            </Chip>
          ))}
          {duration && (
            <Chip active onRemove={() => router.push(`/jap-library?${buildParams({ duration: "" })}`)}>
              {DURATION_BUCKETS.find((d) => d.value === duration)?.label || duration}
            </Chip>
          )}
          <button onClick={clearAll} className="font-hindi text-xs text-charcoal/45 underline ml-1">
            सभी हटाएं
          </button>
        </div>
      )}

      {/* Filter panel */}
      {showFilters && (
        <div className="rounded-2xl border border-charcoal/10 bg-white p-5 max-w-3xl mx-auto space-y-5 shadow-sm">
          <FilterGroup label="श्रेणी (एक या अधिक चुनें)">
            {JAP_CATEGORIES.map((c) => (
              <MultiChip
                key={c}
                active={categories.includes(c)}
                onClick={() => toggleMulti("category", categories, c)}
              >
                {JAP_CATEGORY_LABELS_HI[c]}
              </MultiChip>
            ))}
          </FilterGroup>

          <FilterGroup label="ग्रह (एक या अधिक चुनें)">
            {PLANETS.map((p) => (
              <MultiChip
                key={p}
                active={planets.includes(p)}
                onClick={() => toggleMulti("planet", planets, p)}
              >
                {PLANET_LABELS_HI[p]}
              </MultiChip>
            ))}
          </FilterGroup>

          <FilterGroup label="अवधि">
            {DURATION_BUCKETS.map((d) => (
              <MultiChip
                key={d.value}
                active={duration === d.value}
                onClick={() => router.push(`/jap-library?${buildParams({ duration: duration === d.value ? "" : d.value })}`)}
              >
                {d.label}
              </MultiChip>
            ))}
          </FilterGroup>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-sans text-[10px] uppercase tracking-wider text-charcoal/40 mb-2.5">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function MultiChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 font-hindi text-xs transition-all border",
        active
          ? "bg-gold-deep text-warm-white border-gold-deep"
          : "border-charcoal/10 text-charcoal/65 hover:border-gold-deep/40"
      )}
    >
      {children}
    </button>
  );
}

function Chip({ active, onRemove, children }: { active: boolean; onRemove: () => void; children: React.ReactNode }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-hindi text-xs border",
      active ? "bg-gold/15 text-gold-deep border-gold/30" : "border-charcoal/10 text-charcoal/60"
    )}>
      {children}
      <button onClick={onRemove} className="hover:text-red-500"><X size={11} /></button>
    </span>
  );
}
