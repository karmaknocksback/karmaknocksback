"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, ExternalLink, TrendingUp } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { SHOP_CATEGORIES, MERCHANT_INFO } from "@/lib/shop-constants";

interface Product {
  _id: string; name: string; nameHi: string; descriptionHi: string;
  imageUrl: string; affiliateUrl: string; merchant: string; category: string;
  subcategory?: string; priceDisplay?: string; priceInr?: number;
  badge?: string; tags: string[]; active: boolean; displayOrder: number; clicks: number;
}

const EMPTY: Omit<Product, "_id" | "clicks"> = {
  name: "", nameHi: "", descriptionHi: "", imageUrl: "", affiliateUrl: "",
  merchant: "amazon", category: "mala", subcategory: "",
  priceDisplay: "", priceInr: undefined, badge: "", tags: [],
  active: true, displayOrder: 0,
};

const ALL_TAGS = [
  "igi-certified","gia-certified","govt-lab","natural","lab-grown",
  "ring","pendant","loose-stone","bracelet",
  "cotton","silk","jain-wear",
  "hindi","english","gujarati",
  "certified","premium","eco-friendly","handmade",
];

export default function AdminShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<(typeof EMPTY & { _id?: string }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState("all");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/affiliate-products")
      .then((r) => r.json())
      .then((data) => { if (!cancelled) { setProducts(data.products || []); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function load() {
    const res = await fetch("/api/admin/affiliate-products");
    const data = await res.json();
    setProducts(data.products || []);
  }

  async function save() {
    setSaving(true);
    const method = editing?._id ? "PUT" : "POST";
    const url = editing?._id ? `/api/admin/affiliate-products/${editing._id}` : "/api/admin/affiliate-products";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    setSaving(false);
    setEditing(null);
    load();
  }

  async function del(id: string) {
    if (!confirm("इस उत्पाद को हटाएं?")) return;
    await fetch(`/api/admin/affiliate-products/${id}`, { method: "DELETE" });
    load();
  }

  function toggleTag(tag: string) {
    if (!editing) return;
    const tags = editing.tags || [];
    setEditing({ ...editing, tags: tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag] });
  }

  const visible = filterCat === "all" ? products : products.filter(p => p.category === filterCat);
  const activeCategory = SHOP_CATEGORIES.find(c => c.id === editing?.category);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display-hi text-3xl text-charcoal">Affiliate Shop</h1>
          <p className="font-hindi text-sm text-charcoal/50 mt-1">{products.length} उत्पाद · {products.reduce((a, p) => a + p.clicks, 0)} total clicks</p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-deep to-gold px-5 py-2.5 font-hindi text-sm text-warm-white">
          <Plus size={15} /> नया उत्पाद
        </button>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        <button onClick={() => setFilterCat("all")}
          className={`rounded-full px-3.5 py-1.5 font-hindi text-xs border ${filterCat === "all" ? "bg-gold-deep text-warm-white border-gold-deep" : "border-charcoal/15 text-charcoal/60"}`}>
          सभी ({products.length})
        </button>
        {SHOP_CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setFilterCat(cat.id)}
            className={`rounded-full px-3.5 py-1.5 font-hindi text-xs border ${filterCat === cat.id ? "bg-gold-deep text-warm-white border-gold-deep" : "border-charcoal/15 text-charcoal/60"}`}>
            {cat.nameHi} ({products.filter(p => p.category === cat.id).length})
          </button>
        ))}
      </div>

      {loading ? <p className="font-hindi text-charcoal/50">लोड हो रहा है...</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((p) => {
            const merchant = MERCHANT_INFO[p.merchant] || MERCHANT_INFO.other;
            return (
              <GlassCard key={p._id} className="p-4">
                <div className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.imageUrl} alt={p.nameHi} className="w-16 h-16 object-contain rounded-lg bg-charcoal/5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-hindi text-sm font-medium text-charcoal truncate">{p.nameHi}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-[9px] font-bold text-white rounded-full px-1.5 py-0.5" style={{ background: merchant.color }}>{merchant.label}</span>
                      <span className="text-[9px] text-charcoal/40 font-sans">{p.category}{p.subcategory ? ` / ${p.subcategory}` : ""}</span>
                    </div>
                    {p.priceDisplay && <p className="font-display text-sm font-semibold text-gold-deep mt-1">{p.priceDisplay}</p>}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 font-sans text-xs text-charcoal/40"><TrendingUp size={10} /> {p.clicks}</span>
                      <span className={`text-[9px] rounded-full px-2 py-0.5 ${p.active ? "bg-green-100 text-green-700" : "bg-charcoal/10 text-charcoal/40"}`}>{p.active ? "Active" : "Hidden"}</span>
                    </div>
                    {p.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-1">
                        {p.tags.slice(0, 3).map(t => <span key={t} className="text-[9px] bg-charcoal/8 rounded px-1.5 py-0.5 text-charcoal/50">{t}</span>)}
                        {p.tags.length > 3 && <span className="text-[9px] text-charcoal/35">+{p.tags.length - 3}</span>}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-charcoal/8">
                  <a href={p.affiliateUrl} target="_blank" rel="noopener noreferrer" className="font-hindi text-xs text-charcoal/40 hover:text-gold-deep flex items-center gap-1"><ExternalLink size={10} /> Preview</a>
                  <button onClick={() => setEditing({ ...p })} className="font-hindi text-xs text-charcoal/50 ml-auto hover:text-gold-deep flex items-center gap-1"><Edit2 size={10} /> Edit</button>
                  <button onClick={() => del(p._id)} className="font-hindi text-xs text-red-400 hover:text-red-600 flex items-center gap-1"><Trash2 size={10} /> Delete</button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-5 overflow-y-auto" onClick={() => setEditing(null)}>
          <div className="bg-warm-white rounded-2xl p-7 max-w-lg w-full space-y-4 my-5" onClick={e => e.stopPropagation()}>
            <h3 className="font-display-hi text-xl text-charcoal">{editing._id ? "उत्पाद संपादित करें" : "नया उत्पाद जोड़ें"}</h3>

            {[
              { key: "nameHi", label: "नाम (हिंदी) *", placeholder: "स्फटिक जाप माला" },
              { key: "name", label: "Name (English)", placeholder: "Sphatik Jap Mala" },
              { key: "affiliateUrl", label: "Affiliate Link *", placeholder: "https://amzn.to/..." },
              { key: "imageUrl", label: "Product Image URL *", placeholder: "https://..." },
              { key: "priceDisplay", label: "Price Display", placeholder: "₹599" },
              { key: "badge", label: "Badge", placeholder: "Best Seller / Top Pick" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="font-hindi text-xs text-charcoal/60 mb-1 block">{label}</label>
                <input value={(editing as unknown as Record<string, string>)[key] || ""}
                  onChange={e => setEditing({ ...editing, [key]: e.target.value })}
                  placeholder={placeholder} className="kkb-input" />
              </div>
            ))}

            <div>
              <label className="font-hindi text-xs text-charcoal/60 mb-1 block">विवरण (हिंदी)</label>
              <textarea value={editing.descriptionHi || ""} onChange={e => setEditing({ ...editing, descriptionHi: e.target.value })}
                rows={2} className="kkb-input" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-hindi text-xs text-charcoal/60 mb-1 block">Category *</label>
                <select value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value, subcategory: "" })} className="kkb-input">
                  {SHOP_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
                </select>
              </div>
              <div>
                <label className="font-hindi text-xs text-charcoal/60 mb-1 block">Subcategory</label>
                <select value={editing.subcategory || ""} onChange={e => setEditing({ ...editing, subcategory: e.target.value })} className="kkb-input">
                  <option value="">— चुनें —</option>
                  {activeCategory?.subcategories.map(s => (
                    <option key={s} value={s}>{activeCategory.subcategoryLabels[s as keyof typeof activeCategory.subcategoryLabels] || s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-hindi text-xs text-charcoal/60 mb-1 block">Merchant</label>
                <select value={editing.merchant} onChange={e => setEditing({ ...editing, merchant: e.target.value })} className="kkb-input">
                  {Object.entries(MERCHANT_INFO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="font-hindi text-xs text-charcoal/60 mb-1 block">Price (₹ for filter)</label>
                <input type="number" value={editing.priceInr || ""}
                  onChange={e => setEditing({ ...editing, priceInr: Number(e.target.value) || undefined })}
                  placeholder="599" className="kkb-input" />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="font-hindi text-xs text-charcoal/60 mb-2 block">Tags (filter के लिए)</label>
              <div className="flex flex-wrap gap-2">
                {ALL_TAGS.map(tag => (
                  <button key={tag} type="button" onClick={() => toggleTag(tag)}
                    className={`rounded-full px-2.5 py-1 text-[11px] border transition-colors ${(editing.tags || []).includes(tag) ? "bg-gold-deep text-warm-white border-gold-deep" : "border-charcoal/15 text-charcoal/55"}`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-hindi text-xs text-charcoal/60 mb-1 block">Display Order</label>
                <input type="number" value={editing.displayOrder} onChange={e => setEditing({ ...editing, displayOrder: Number(e.target.value) })} className="kkb-input" />
              </div>
              <label className="flex items-center gap-2 font-hindi text-sm text-charcoal/75 pt-5">
                <input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} />
                Active (दिखाएं)
              </label>
            </div>

            {editing.imageUrl && (
              <div className="rounded-xl bg-charcoal/5 p-3 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={editing.imageUrl} alt="preview" className="h-24 object-contain" />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={save} disabled={saving}
                className="rounded-full bg-gradient-to-r from-gold-deep to-gold px-6 py-2.5 font-hindi text-sm text-warm-white disabled:opacity-60">
                {saving ? "सहेज रहे हैं..." : "सहेजें"}
              </button>
              <button onClick={() => setEditing(null)} className="font-hindi text-sm text-charcoal/50">रद्द करें</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
