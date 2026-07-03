"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, ExternalLink, TrendingUp } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";

interface Product {
  _id: string; name: string; nameHi: string; descriptionHi: string;
  imageUrl: string; affiliateUrl: string; merchant: string; category: string;
  priceDisplay?: string; badge?: string; active: boolean;
  displayOrder: number; clicks: number;
}

const EMPTY: Omit<Product, "_id" | "clicks"> = {
  name: "", nameHi: "", descriptionHi: "", imageUrl: "", affiliateUrl: "",
  merchant: "amazon", category: "spiritual", priceDisplay: "", badge: "",
  active: true, displayOrder: 0,
};

const CATEGORIES = ["spiritual", "books", "meditation", "mala", "incense", "idols"];
const MERCHANTS = ["amazon", "flipkart", "meesho", "other"];

export default function AdminShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<(typeof EMPTY & { _id?: string }) | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/affiliate-products")
      .then((r) => r.json())
      .then((data) => { if (!cancelled) { setProducts(data.products || []); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/affiliate-products");
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }

  async function save() {
    setSaving(true);
    const method = editing?._id ? "PUT" : "POST";
    const url = editing?._id ? `/api/admin/affiliate-products/${editing._id}` : "/api/admin/affiliate-products";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setSaving(false);
    setEditing(null);
    load();
  }

  async function del(id: string) {
    if (!confirm("इस उत्पाद को हटाएं?")) return;
    await fetch(`/api/admin/affiliate-products/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display-hi text-3xl text-charcoal">Affiliate Shop</h1>
          <p className="font-hindi text-sm text-charcoal/50 mt-1">
            उत्पाद जोड़ें — Amazon/Flipkart affiliate links के साथ
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY })}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-deep to-gold px-5 py-2.5 font-hindi text-sm text-warm-white"
        >
          <Plus size={15} /> नया उत्पाद
        </button>
      </div>

      {loading ? (
        <p className="font-hindi text-charcoal/50">लोड हो रहा है...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <GlassCard key={p._id} className="p-4">
              <div className="flex gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imageUrl} alt={p.nameHi} className="w-16 h-16 object-contain rounded-lg bg-charcoal/5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-hindi text-sm font-medium text-charcoal truncate">{p.nameHi}</p>
                  <p className="font-sans text-[10px] text-charcoal/40 uppercase mt-0.5">{p.merchant} · {p.category}</p>
                  {p.priceDisplay && <p className="font-display text-sm font-semibold text-gold-deep mt-1">{p.priceDisplay}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 font-sans text-xs text-charcoal/40">
                      <TrendingUp size={10} /> {p.clicks} clicks
                    </span>
                    <span className={`text-[10px] rounded-full px-2 py-0.5 ${p.active ? "bg-green-100 text-green-700" : "bg-charcoal/10 text-charcoal/40"}`}>
                      {p.active ? "Active" : "Hidden"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-charcoal/8">
                <a href={p.affiliateUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 font-hindi text-xs text-charcoal/40 hover:text-gold-deep">
                  <ExternalLink size={11} /> Preview
                </a>
                <button onClick={() => setEditing({ ...p })}
                  className="flex items-center gap-1 font-hindi text-xs text-charcoal/50 ml-auto hover:text-gold-deep">
                  <Edit2 size={11} /> Edit
                </button>
                <button onClick={() => del(p._id)}
                  className="flex items-center gap-1 font-hindi text-xs text-red-400 hover:text-red-600">
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5 overflow-y-auto"
          onClick={() => setEditing(null)}>
          <div className="bg-warm-white rounded-2xl p-7 max-w-lg w-full space-y-4 my-5"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display-hi text-xl text-charcoal">
              {editing._id ? "उत्पाद संपादित करें" : "नया उत्पाद जोड़ें"}
            </h3>

            {[
              { key: "nameHi", label: "नाम (हिंदी)", placeholder: "जैन पूजा थाली" },
              { key: "name", label: "Name (English)", placeholder: "Jain Puja Thali" },
              { key: "descriptionHi", label: "विवरण", placeholder: "शुद्ध चांदी की जैन पूजा थाली..." },
              { key: "imageUrl", label: "Product Image URL", placeholder: "https://..." },
              { key: "affiliateUrl", label: "Affiliate Link", placeholder: "https://amzn.to/..." },
              { key: "priceDisplay", label: "Price Display", placeholder: "₹599" },
              { key: "badge", label: "Badge (optional)", placeholder: "Best Seller" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="font-hindi text-xs text-charcoal/60 mb-1 block">{label}</label>
                {key === "descriptionHi" ? (
                  <textarea
                    value={(editing as unknown as Record<string, string>)[key] || ""}
                    onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                    rows={2} placeholder={placeholder} className="kkb-input"
                  />
                ) : (
                  <input
                    value={(editing as unknown as Record<string, string>)[key] || ""}
                    onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                    placeholder={placeholder} className="kkb-input"
                  />
                )}
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-hindi text-xs text-charcoal/60 mb-1 block">Merchant</label>
                <select value={editing.merchant}
                  onChange={(e) => setEditing({ ...editing, merchant: e.target.value })}
                  className="kkb-input capitalize">
                  {MERCHANTS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="font-hindi text-xs text-charcoal/60 mb-1 block">Category</label>
                <select value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="kkb-input">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-hindi text-xs text-charcoal/60 mb-1 block">Display Order</label>
                <input type="number" value={editing.displayOrder}
                  onChange={(e) => setEditing({ ...editing, displayOrder: Number(e.target.value) })}
                  className="kkb-input" />
              </div>
              <label className="flex items-center gap-2 font-hindi text-sm text-charcoal/75 pt-5">
                <input type="checkbox" checked={editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })} />
                Active (दिखाएं)
              </label>
            </div>

            {/* Image preview */}
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
              <button onClick={() => setEditing(null)} className="font-hindi text-sm text-charcoal/50">
                रद्द करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
