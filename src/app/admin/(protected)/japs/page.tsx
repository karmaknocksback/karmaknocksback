"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ChevronDown, Search, X, Check } from "lucide-react";
import type { JapData } from "@/types";
import { JAP_CATEGORIES, JAP_CATEGORY_LABELS_HI } from "@/lib/constants";

export default function AdminJapsPage() {
  const [japs, setJaps] = useState<JapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState("all");
  const [filterFeatured, setFilterFeatured] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [showCatDropdown, setShowCatDropdown] = useState(false);

  // Inline category edit state
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatVal, setEditingCatVal] = useState("");
  const [editingCatCustom, setEditingCatCustom] = useState(false);
  const [savingCat, setSavingCat] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/japs")
      .then(r => r.json())
      .then(d => { if (!cancelled) { setJaps(d.japs || []); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function load() {
    const res = await fetch("/api/admin/japs");
    const data = await res.json();
    setJaps(data.japs || []);
  }

  async function handleDelete(id: string) {
    if (!confirm("क्या आप वाकई इस जाप को हटाना चाहते हैं?")) return;
    await fetch(`/api/admin/japs/${id}`, { method: "DELETE" });
    load();
  }

  // Start inline category edit
  function startEditCat(jap: JapData) {
    setEditingCatId(jap._id);
    setEditingCatVal(jap.category);
    setEditingCatCustom(!JAP_CATEGORIES.includes(jap.category as (typeof JAP_CATEGORIES)[number]));
  }

  // Save inline category
  async function saveEditCat(id: string) {
    if (!editingCatVal.trim()) return;
    setSavingCat(true);
    await fetch(`/api/admin/japs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: editingCatVal }),
    });
    setSavingCat(false);
    setEditingCatId(null);
    load();
  }

  function cancelEditCat() {
    setEditingCatId(null);
    setEditingCatVal("");
    setEditingCatCustom(false);
  }

  const filtered = useMemo(() => {
    return japs.filter((j) => {
      if (filterCat !== "all" && j.category !== filterCat) return false;
      if (filterFeatured === "yes" && !j.featured) return false;
      if (filterFeatured === "no" && j.featured) return false;
      if (searchQ && !j.titleHi.includes(searchQ) && !j.title.toLowerCase().includes(searchQ.toLowerCase())) return false;
      return true;
    });
  }, [japs, filterCat, filterFeatured, searchQ]);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = { all: japs.length };
    japs.forEach((j) => { counts[j.category] = (counts[j.category] || 0) + 1; });
    return counts;
  }, [japs]);

  // All unique categories (known + custom)
  const allCategories = useMemo(() => {
    const custom = [...new Set(japs.map(j => j.category))].filter(c => !JAP_CATEGORIES.includes(c as (typeof JAP_CATEGORIES)[number]));
    return [...JAP_CATEGORIES, ...custom];
  }, [japs]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display-hi text-3xl text-charcoal">जाप प्रबंधन</h1>
          <p className="font-hindi text-sm text-charcoal/50 mt-0.5">कुल {japs.length} जाप · {filtered.length} दिख रहे हैं</p>
        </div>
        <Link href="/admin/japs/new"
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-deep to-gold px-5 py-2.5 font-hindi text-sm text-warm-white">
          <Plus size={16} /> नया जाप
        </Link>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap gap-3 mb-5 p-4 rounded-2xl border border-charcoal/8 bg-charcoal/[0.02]">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
          <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="नाम खोजें..."
            className="w-full rounded-lg border border-charcoal/10 bg-white py-2 pl-9 pr-3 font-hindi text-sm outline-none focus:border-gold-deep" />
          {searchQ && <button onClick={() => setSearchQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40"><X size={12} /></button>}
        </div>

        {/* Category dropdown */}
        <div className="relative">
          <button onClick={() => setShowCatDropdown(!showCatDropdown)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 font-hindi text-sm transition-colors ${filterCat !== "all" ? "bg-gold-deep text-warm-white border-gold-deep" : "bg-white border-charcoal/10 text-charcoal/70"}`}>
            <span className="font-sans text-xs opacity-60">श्रेणी:</span>
            {filterCat === "all" ? "सभी" : JAP_CATEGORY_LABELS_HI[filterCat as keyof typeof JAP_CATEGORY_LABELS_HI] || filterCat}
            <ChevronDown size={13} className={showCatDropdown ? "rotate-180" : ""} />
          </button>
          {showCatDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowCatDropdown(false)} />
              <div className="absolute left-0 top-full mt-1 z-20 w-56 rounded-xl border border-charcoal/10 bg-white shadow-xl overflow-hidden">
                <div className="max-h-72 overflow-y-auto">
                  {[{ id: "all", label: "सभी श्रेणियाँ" }, ...allCategories.map(c => ({ id: c, label: JAP_CATEGORY_LABELS_HI[c as keyof typeof JAP_CATEGORY_LABELS_HI] || c }))].map(({ id, label }) => (
                    <button key={id} onClick={() => { setFilterCat(id); setShowCatDropdown(false); }}
                      className={`flex w-full items-center justify-between px-4 py-2.5 font-hindi text-sm text-left hover:bg-charcoal/5 ${filterCat === id ? "bg-gold/10 text-gold-deep font-medium" : "text-charcoal/70"}`}>
                      <span>{label}</span>
                      <span className="text-xs text-charcoal/35">{catCounts[id] || 0}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <select value={filterFeatured} onChange={(e) => setFilterFeatured(e.target.value)}
          className="rounded-lg border border-charcoal/10 bg-white px-3 py-2 font-hindi text-sm text-charcoal/70 outline-none">
          <option value="all">फीचर्ड: सभी</option>
          <option value="yes">फीचर्ड: हाँ</option>
          <option value="no">फीचर्ड: नहीं</option>
        </select>

        {(filterCat !== "all" || filterFeatured !== "all" || searchQ) && (
          <button onClick={() => { setFilterCat("all"); setFilterFeatured("all"); setSearchQ(""); }}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-hindi text-xs text-red-500">
            <X size={12} /> हटाएं
          </button>
        )}
      </div>

      {loading ? (
        <p className="font-hindi text-charcoal/50">लोड हो रहा है...</p>
      ) : filtered.length === 0 ? (
        <p className="font-hindi text-charcoal/50 py-8 text-center">कोई जाप नहीं मिला।</p>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-charcoal/5">
              <tr>
                <Th>शीर्षक</Th>
                <Th>श्रेणी</Th>
                <Th>अवधि</Th>
                <Th>Views</Th>
                <Th>फीचर्ड</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {filtered.map((jap) => (
                <tr key={jap._id} className="hover:bg-charcoal/[0.02] transition-colors">
                  <Td>
                    <p className="font-hindi text-sm font-medium text-charcoal">{jap.titleHi}</p>
                    <p className="font-sans text-xs text-charcoal/35">/{jap.slug.slice(0, 36)}{jap.slug.length > 36 ? "…" : ""}</p>
                  </Td>

                  {/* Inline category edit */}
                  <Td>
                    {editingCatId === jap._id ? (
                      <div className="flex flex-col gap-1.5 min-w-48">
                        <select
                          value={editingCatCustom ? "__custom__" : editingCatVal}
                          onChange={(e) => {
                            if (e.target.value === "__custom__") {
                              setEditingCatCustom(true);
                              setEditingCatVal("");
                            } else {
                              setEditingCatCustom(false);
                              setEditingCatVal(e.target.value);
                            }
                          }}
                          className="rounded border border-charcoal/20 px-2 py-1 font-hindi text-xs outline-none focus:border-gold-deep w-full"
                        >
                          {allCategories.map(c => (
                            <option key={c} value={c}>{JAP_CATEGORY_LABELS_HI[c as keyof typeof JAP_CATEGORY_LABELS_HI] || c}</option>
                          ))}
                          <option value="__custom__">+ नई श्रेणी</option>
                        </select>
                        {editingCatCustom && (
                          <input
                            type="text"
                            value={editingCatVal}
                            onChange={(e) => setEditingCatVal(e.target.value)}
                            placeholder="नई श्रेणी का नाम"
                            autoFocus
                            className="rounded border border-charcoal/20 px-2 py-1 font-hindi text-xs outline-none focus:border-gold-deep w-full"
                            onKeyDown={(e) => { if (e.key === "Enter") saveEditCat(jap._id); if (e.key === "Escape") cancelEditCat(); }}
                          />
                        )}
                        <div className="flex gap-1">
                          <button onClick={() => saveEditCat(jap._id)} disabled={savingCat || !editingCatVal.trim()}
                            className="flex items-center gap-1 rounded px-2 py-0.5 bg-green-100 text-green-700 font-sans text-xs disabled:opacity-50">
                            <Check size={10} /> {savingCat ? "…" : "Save"}
                          </button>
                          <button onClick={cancelEditCat} className="flex items-center gap-1 rounded px-2 py-0.5 bg-charcoal/8 text-charcoal/50 font-sans text-xs">
                            <X size={10} /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 group">
                        <span className="rounded-full bg-charcoal/8 px-2.5 py-0.5 font-hindi text-xs">
                          {JAP_CATEGORY_LABELS_HI[jap.category as keyof typeof JAP_CATEGORY_LABELS_HI] || jap.category}
                        </span>
                        <button
                          onClick={() => startEditCat(jap)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-charcoal/40 hover:text-gold-deep"
                          title="श्रेणी बदलें"
                        >
                          <Pencil size={12} />
                        </button>
                      </div>
                    )}
                  </Td>

                  <Td>{jap.durationMinutes} min</Td>
                  <Td>{jap.views ?? 0}</Td>
                  <Td>
                    <span className={`rounded-full px-2 py-0.5 font-hindi text-xs ${jap.featured ? "bg-green-100 text-green-700" : "bg-charcoal/5 text-charcoal/40"}`}>
                      {jap.featured ? "हाँ" : "नहीं"}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/japs/${jap._id}/edit`} className="text-gold-deep hover:text-gold">
                        <Pencil size={15} />
                      </Link>
                      <button onClick={() => handleDelete(jap._id)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-4 py-3 font-hindi text-xs font-semibold text-charcoal/55">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 font-sans text-sm text-charcoal/75">{children}</td>;
}
