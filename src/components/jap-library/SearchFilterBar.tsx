"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent, useTransition } from "react";
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
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(sp.get("q") || "");
  const [showFilters, setShowFilters] = useState(false);

  const sort = sp.get("sort") || "views";
  const categories = (sp.get("category") || "").split(",").filter(Boolean);
  const planets = (sp.get("planet") || "").split(",").filter(Boolean);
  const duration = sp.get("duration") || "";
  const activeCount = categories.length + planets.length + (duration ? 1 : 0);

  function navigate(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const current: Record<string, string> = {
      q: sp.get("q") || "",
      category: sp.get("category") || "",
      planet: sp.get("planet") || "",
      duration: sp.get("duration") || "",
      sort: sp.get("sort") || "views",
    };
    const merged = { ...current, ...overrides };
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v); });
    startTransition(() => {
      router.push(`/jap-library${params.toString() ? `?${params}` : ""}`, { scroll: false });
    });
  }

  function toggleCategory(cat: string) {
    const next = categories.includes(cat)
      ? categories.filter((c) => c !== cat)
      : [...categories, cat];
    navigate({ category: next.join(",") || undefined });
  }

  function togglePlanet(p: string) {
    const next = planets.includes(p)
      ? planets.filter((x) => x !== p)
      : [...planets, p];
    navigate({ planet: next.join(",") || undefined });
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    navigate({ q: q || undefined });
  }

  function clearAll() {
    setQ("");
    startTransition(() => router.push("/jap-library", { scroll: false }));
  }

  return (
    <div className={cn("space-y-4", isPending && "opacity-70 pointer-events-none")}>
      {/* Top bar */}
      <div className="flex gap-2.5 max-w-3xl mx-auto">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="जाप, मंत्र, ग्रह खोजें…"
            className="w-full rounded-full border border-charcoal/10 bg-white py-3 pl-11 pr-4 font-hindi text-sm outline-none focus:border-gold-deep shadow-sm"
          />
        </form>

        {/* Sort */}
        <div className="relative shrink-0">
          <select
            value={sort}
            onChange={(e) => navigate({ sort: e.target.value })}
            className="appearance-none h-full rounded-full border border-charcoal/10 bg-white py-3 pl-4 pr-9 font-hindi text-sm outline-none focus:border-gold-deep cursor-pointer shadow-sm"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "shrink-0 flex items-center gap-2 rounded-full border px-4 py-3 font-hindi text-sm transition-colors shadow-sm",
            showFilters || activeCount > 0
              ? "bg-gold-deep text-warm-white border-gold-deep"
              : "border-charcoal/10 bg-white text-charcoal/65"
          )}
        >
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">फ़िल्टर</span>
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/30 text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Active chips */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2 justify-center items-center">
          {categories.map((c) => (
            <button key={c} onClick={() => toggleCategory(c)}
              className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 border border-gold/25 px-3 py-1 font-hindi text-xs text-gold-deep">
              {JAP_CATEGORY_LABELS_HI[c] || c} <X size={10} />
            </button>
          ))}
          {planets.map((p) => (
            <button key={p} onClick={() => togglePlanet(p)}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 font-hindi text-xs text-indigo-600">
              {PLANET_LABELS_HI[p] || p} <X size={10} />
            </button>
          ))}
          {duration && (
            <button onClick={() => navigate({ duration: undefined })}
              className="inline-flex items-center gap-1.5 rounded-full bg-charcoal/8 border border-charcoal/15 px-3 py-1 font-hindi text-xs text-charcoal/60">
              {DURATION_BUCKETS.find(d => d.value === duration)?.label} <X size={10} />
            </button>
          )}
          <button onClick={clearAll} className="font-hindi text-xs text-red-400 underline">सभी हटाएं</button>
        </div>
      )}

      {/* Filter panel */}
      {showFilters && (
        <div className="rounded-2xl border border-charcoal/10 bg-white p-5 max-w-3xl mx-auto shadow-sm space-y-5">
          <Group label="श्रेणी — एक या अधिक चुनें">
            {JAP_CATEGORIES.map((c) => (
              <Chip key={c} active={categories.includes(c)} onClick={() => toggleCategory(c)}>
                {JAP_CATEGORY_LABELS_HI[c]}
              </Chip>
            ))}
          </Group>

          <div className="h-px bg-charcoal/8" />

          <Group label="ग्रह — एक या अधिक चुनें">
            {PLANETS.map((p) => (
              <Chip key={p} active={planets.includes(p)} onClick={() => togglePlanet(p)}>
                {PLANET_LABELS_HI[p]}
              </Chip>
            ))}
          </Group>

          <div className="h-px bg-charcoal/8" />

          <Group label="अवधि">
            {DURATION_BUCKETS.map((d) => (
              <Chip
                key={d.value}
                active={duration === d.value}
                onClick={() => navigate({ duration: duration === d.value ? undefined : d.value })}
              >
                {d.label}
              </Chip>
            ))}
          </Group>

          <div className="flex justify-end">
            <button onClick={() => setShowFilters(false)}
              className="font-hindi text-xs text-charcoal/50 rounded-full border border-charcoal/10 px-4 py-1.5 hover:bg-charcoal/5">
              बंद करें
            </button>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isPending && (
        <p className="text-center font-hindi text-xs text-charcoal/40 animate-pulse">लोड हो रहा है…</p>
      )}
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-sans text-[10px] uppercase tracking-wider text-charcoal/40 mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 font-hindi text-xs border transition-all",
        active
          ? "bg-gold-deep text-warm-white border-gold-deep shadow-sm"
          : "border-charcoal/10 text-charcoal/65 hover:border-gold-deep/40 hover:bg-gold/5"
      )}>
      {children}
    </button>
  );
}
