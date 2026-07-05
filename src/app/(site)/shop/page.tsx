import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, ShoppingBag, Filter } from "lucide-react";
import { listActiveProducts, getShopCategoryCounts } from "@/lib/repo/affiliate";
import GlassCard from "@/components/shared/GlassCard";
import {
  SHOP_CATEGORIES, BUDGET_FILTERS, MERCHANT_INFO, getCategoryById,
} from "@/lib/shop-constants";

export const metadata: Metadata = {
  title: "Spiritual Shop | KarmaKnocksBack",
  description: "जैन पूजा सामग्री, रत्न, माला, पुस्तकें व ध्यान उत्पाद — हमारी अनुशंसित खरीदारी।",
  alternates: { canonical: "/shop" },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    subcategory?: string;
    budget?: string;
    tags?: string;
    merchant?: string;
  }>;
}

export default async function ShopPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const tagList = sp.tags ? sp.tags.split(",").filter(Boolean) : [];

  const [products, counts] = await Promise.all([
    listActiveProducts({
      category: sp.category,
      subcategory: sp.subcategory,
      budget: sp.budget,
      tags: tagList,
      merchant: sp.merchant,
    }),
    getShopCategoryCounts(),
  ]);

  const activeCategory = sp.category ? getCategoryById(sp.category) : null;

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { category: sp.category, subcategory: sp.subcategory, budget: sp.budget, tags: sp.tags, merchant: sp.merchant, ...overrides };
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v); });
    const q = params.toString();
    return `/shop${q ? `?${q}` : ""}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ShoppingBag size={18} className="text-gold-deep" />
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-gold-deep">KarmaKnocksBack Shop</p>
        </div>
        <h1 className="font-display-hi text-3xl sm:text-4xl text-charcoal mb-2">
          जैन आध्यात्मिक उत्पाद
        </h1>
        <p className="font-hindi text-sm text-charcoal/50 max-w-lg mx-auto">
          हमारे द्वारा अनुशंसित पूजा सामग्री, रत्न, माला व ध्यान उत्पाद
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-60 shrink-0 space-y-5">
          {/* Categories */}
          <div>
            <p className="font-sans text-[10px] uppercase tracking-wider text-charcoal/40 mb-3">Categories</p>
            <div className="space-y-0.5">
              <Link href="/shop"
                className={`flex items-center justify-between rounded-lg px-3 py-2 font-sans text-sm transition-colors ${!sp.category ? "bg-gold/15 text-gold-deep font-medium" : "text-charcoal/65 hover:bg-charcoal/5"}`}>
                <span>🛍️ All Products</span>
                <span className="text-[10px] text-charcoal/40">{counts.all || 0}</span>
              </Link>
              {SHOP_CATEGORIES.map((cat) => (
                <Link key={cat.id} href={buildUrl({ category: cat.id, subcategory: undefined })}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 font-hindi text-sm transition-colors ${sp.category === cat.id ? "bg-gold/15 text-gold-deep font-medium" : "text-charcoal/65 hover:bg-charcoal/5"}`}>
                  <span className="truncate">{cat.nameHi}</span>
                  {counts[cat.id] ? <span className="text-[10px] text-charcoal/40 ml-1">{counts[cat.id]}</span> : null}
                </Link>
              ))}
            </div>
          </div>

          {/* Budget filter */}
          <div>
            <p className="font-sans text-[10px] uppercase tracking-wider text-charcoal/40 mb-3 flex items-center gap-1.5">
              <Filter size={10} /> Budget
            </p>
            <div className="space-y-1">
              {BUDGET_FILTERS.map((b) => (
                <Link key={b.id} href={buildUrl({ budget: sp.budget === b.id ? undefined : b.id })}
                  className={`block rounded-lg px-3 py-1.5 font-hindi text-xs transition-colors ${sp.budget === b.id ? "bg-gold/15 text-gold-deep" : "text-charcoal/60 hover:bg-charcoal/5"}`}>
                  {sp.budget === b.id ? "✓ " : ""}{b.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Gemstone filters (only when gemstones selected) */}
          {activeCategory?.id === "gemstones" && (
            <>
              <div>
                <p className="font-sans text-[10px] uppercase tracking-wider text-charcoal/40 mb-3">रूप</p>
                <div className="flex flex-wrap gap-1.5">
                  {activeCategory.filters.form.map((f) => {
                    const active = tagList.includes(f);
                    const newTags = active ? tagList.filter((t) => t !== f) : [...tagList, f];
                    return (
                      <Link key={f} href={buildUrl({ tags: newTags.join(",") || undefined })}
                        className={`rounded-full px-2.5 py-1 font-hindi text-[11px] border transition-colors ${active ? "bg-gold-deep text-warm-white border-gold-deep" : "border-charcoal/15 text-charcoal/60"}`}>
                        {activeCategory.filters.formLabels[f as keyof typeof activeCategory.filters.formLabels]}
                      </Link>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="font-sans text-[10px] uppercase tracking-wider text-charcoal/40 mb-3">प्रमाणन</p>
                <div className="flex flex-wrap gap-1.5">
                  {activeCategory.filters.certification.map((c) => {
                    const active = tagList.includes(c);
                    const newTags = active ? tagList.filter((t) => t !== c) : [...tagList, c];
                    return (
                      <Link key={c} href={buildUrl({ tags: newTags.join(",") || undefined })}
                        className={`rounded-full px-2.5 py-1 font-hindi text-[11px] border transition-colors ${active ? "bg-gold-deep text-warm-white border-gold-deep" : "border-charcoal/15 text-charcoal/60"}`}>
                        {activeCategory.filters.certLabels[c as keyof typeof activeCategory.filters.certLabels]}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </aside>

        <div className="flex-1 min-w-0">
          {/* Mobile category pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 lg:hidden">
            <Link href="/shop"
              className={`shrink-0 rounded-full px-3.5 py-1.5 font-sans text-xs border ${!sp.category ? "bg-gold-deep text-warm-white border-gold-deep" : "border-charcoal/15 text-charcoal/60"}`}>
              All
            </Link>
            {SHOP_CATEGORIES.map((cat) => (
              <Link key={cat.id} href={buildUrl({ category: cat.id, subcategory: undefined })}
                className={`shrink-0 rounded-full px-3.5 py-1.5 font-hindi text-xs border ${sp.category === cat.id ? "bg-gold-deep text-warm-white border-gold-deep" : "border-charcoal/15 text-charcoal/60"}`}>
                {cat.nameHi}
              </Link>
            ))}
          </div>

          {/* Subcategory pills */}
          {activeCategory && (
            <div className="flex gap-2 flex-wrap mb-5">
              {activeCategory.subcategories.map((sub) => (
                <Link key={sub} href={buildUrl({ subcategory: sp.subcategory === sub ? undefined : sub })}
                  className={`rounded-full px-3.5 py-1.5 font-hindi text-xs border transition-colors ${sp.subcategory === sub ? "bg-charcoal text-warm-white border-charcoal" : "border-charcoal/15 text-charcoal/60 hover:border-charcoal/30"}`}>
                  {activeCategory.subcategoryLabels[sub as keyof typeof activeCategory.subcategoryLabels] || sub}
                </Link>
              ))}
            </div>
          )}

          {/* Active filter display */}
          {(sp.category || sp.budget || sp.tags || sp.merchant) && (
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="font-sans text-xs text-charcoal/40">Filter:</span>
              {sp.category && <span className="rounded-full bg-gold/10 px-2.5 py-0.5 font-hindi text-xs text-gold-deep">{activeCategory?.nameHi}</span>}
              {sp.budget && <span className="rounded-full bg-gold/10 px-2.5 py-0.5 font-hindi text-xs text-gold-deep">{BUDGET_FILTERS.find(b => b.id === sp.budget)?.label}</span>}
              {tagList.map(t => <span key={t} className="rounded-full bg-charcoal/8 px-2.5 py-0.5 font-hindi text-xs text-charcoal/60">{t}</span>)}
              <Link href="/shop" className="font-sans text-xs text-red-400 underline">Clear</Link>
            </div>
          )}

          {/* Product count */}
          <p className="font-sans text-xs text-charcoal/40 mb-4">{products.length} products found</p>

          {/* Product grid */}
          {products.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag size={36} className="text-charcoal/20 mx-auto mb-4" />
              <p className="font-sans text-charcoal/45 mb-2">No products in this category yet.</p>
              <p className="font-hindi text-xs text-charcoal/30">
                Admin से उत्पाद जोड़ें: <Link href="/admin/shop" className="text-gold-deep underline">/admin/shop</Link>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => {
                const merchant = MERCHANT_INFO[product.merchant] || MERCHANT_INFO.other;
                return (
                  <GlassCard key={product._id} className="overflow-hidden group hover:-translate-y-0.5 transition-all duration-300">
                    <div className="relative aspect-square bg-charcoal/5 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={product.imageUrl} alt={product.nameHi}
                        className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300" />
                      {product.badge && (
                        <span className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-hindi font-semibold text-warm-white"
                          style={{ background: "linear-gradient(135deg, #9c7726, #c89b3c)" }}>
                          {product.badge}
                        </span>
                      )}
                      <span className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-sans font-bold text-white"
                        style={{ background: merchant.color }}>
                        {merchant.label}
                      </span>
                      {product.tags.includes("igi-certified") && (
                        <span className="absolute bottom-2 left-2 rounded-full bg-green-600 px-2 py-0.5 text-[9px] font-sans font-bold text-white">
                          ✓ IGI
                        </span>
                      )}
                      {product.tags.includes("gia-certified") && (
                        <span className="absolute bottom-2 left-2 rounded-full bg-blue-700 px-2 py-0.5 text-[9px] font-sans font-bold text-white">
                          ✓ GIA
                        </span>
                      )}
                    </div>
                    <div className="p-3.5">
                      <p className="font-hindi text-xs font-medium text-charcoal leading-snug mb-1 line-clamp-2">
                        {product.nameHi}
                      </p>
                      <p className="font-hindi text-[11px] text-charcoal/45 mb-3 line-clamp-1">
                        {product.descriptionHi}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        {product.priceDisplay ? (
                          <span className="font-display text-sm font-semibold text-gold-deep">{product.priceDisplay}</span>
                        ) : <span />}
                        <a href={`/api/shop/click/${product._id}`} target="_blank" rel="noopener noreferrer sponsored"
                          className="inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 font-hindi text-xs font-medium text-charcoal transition-transform hover:scale-105"
                          style={{ background: "linear-gradient(135deg, #f7d8a3, #c89b3c)" }}>
                          Buy Now <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}

          {/* Affiliate disclaimer */}
          <p className="font-hindi text-[11px] text-charcoal/30 text-center mt-8">
            * Purchasing via these links earns KarmaKnocksBack a small affiliate commission at no extra cost to you. 🙏
          </p>
        </div>
      </div>
    </div>
  );
}
