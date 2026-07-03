import type { Metadata } from "next";
import { ExternalLink, ShoppingBag, Tag } from "lucide-react";
import { listActiveProducts, listDistinctCategories } from "@/lib/repo/affiliate";
import GlassCard from "@/components/shared/GlassCard";
import Link from "next/link";

export const metadata: Metadata = {
  title: "जैन आध्यात्मिक उत्पाद | KarmaKnocksBack Shop",
  description: "जैन पूजा सामग्री, माला, ध्यान उत्पाद व आध्यात्मिक पुस्तकें — हमारी अनुशंसित खरीदारी सूची।",
};

export const dynamic = "force-dynamic";

const MERCHANT_BADGES: Record<string, { label: string; color: string }> = {
  amazon: { label: "Amazon", color: "#FF9900" },
  flipkart: { label: "Flipkart", color: "#2874F0" },
  meesho: { label: "Meesho", color: "#F43397" },
  other: { label: "Shop", color: "#9c7726" },
};

const CATEGORY_LABELS: Record<string, string> = {
  spiritual: "🪔 पूजा सामग्री",
  books: "📚 पुस्तकें",
  meditation: "🧘 ध्यान उत्पाद",
  mala: "📿 माला",
  incense: "🌿 अगरबत्ती",
  idols: "🕉️ मूर्तियाँ",
  all: "सभी उत्पाद",
};

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ShopPage({ searchParams }: PageProps) {
  const { category } = await searchParams;
  const [products, categories] = await Promise.all([
    listActiveProducts(category),
    listDistinctCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-3">
          <ShoppingBag size={20} className="text-gold-deep" />
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-gold-deep">KarmaKnocksBack Shop</p>
        </div>
        <h1 className="font-display-hi text-3xl sm:text-4xl text-charcoal mb-3">
          जैन आध्यात्मिक उत्पाद
        </h1>
        <p className="font-hindi text-charcoal/55 max-w-xl mx-auto">
          हमारी अनुशंसित पूजा सामग्री, माला, पुस्तकें व ध्यान उत्पाद। ये सभी विश्वसनीय विक्रेताओं से हैं।
        </p>
        <p className="font-hindi text-xs text-charcoal/35 mt-2">
          * इन लिंक्स से खरीदारी पर हमें affiliate commission मिलती है, आपकी कीमत समान रहती है।
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        <Link
          href="/shop"
          className={`rounded-full px-4 py-1.5 font-hindi text-xs border transition-colors ${
            !category ? "bg-gold-deep text-warm-white border-gold-deep" : "border-charcoal/15 text-charcoal/60"
          }`}
        >
          सभी उत्पाद
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/shop?category=${cat}`}
            className={`rounded-full px-4 py-1.5 font-hindi text-xs border transition-colors ${
              category === cat ? "bg-gold-deep text-warm-white border-gold-deep" : "border-charcoal/15 text-charcoal/60"
            }`}
          >
            {CATEGORY_LABELS[cat] || cat}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag size={40} className="text-charcoal/20 mx-auto mb-4" />
          <p className="font-hindi text-charcoal/45">अभी कोई उत्पाद उपलब्ध नहीं है।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product) => {
            const merchant = MERCHANT_BADGES[product.merchant] || MERCHANT_BADGES.other;
            return (
              <GlassCard key={product._id} className="overflow-hidden group hover:-translate-y-0.5 transition-transform">
                {/* Product image */}
                <div className="relative aspect-square bg-charcoal/5 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl}
                    alt={product.nameHi}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.badge && (
                    <span className="absolute top-2 left-2 rounded-full px-2.5 py-0.5 text-[10px] font-hindi font-semibold text-warm-white"
                      style={{ background: "linear-gradient(135deg, #9c7726, #c89b3c)" }}>
                      {product.badge}
                    </span>
                  )}
                  {/* Merchant badge */}
                  <span
                    className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-sans font-bold text-white"
                    style={{ background: merchant.color }}
                  >
                    {merchant.label}
                  </span>
                </div>

                {/* Product info */}
                <div className="p-4">
                  <p className="font-hindi font-medium text-charcoal text-sm leading-snug mb-1">
                    {product.nameHi}
                  </p>
                  <p className="font-hindi text-xs text-charcoal/50 mb-3 line-clamp-2">
                    {product.descriptionHi}
                  </p>

                  <div className="flex items-center justify-between">
                    {product.priceDisplay && (
                      <span className="font-display text-base font-semibold text-gold-deep flex items-center gap-1">
                        <Tag size={12} />
                        {product.priceDisplay}
                      </span>
                    )}
                    <a
                      href={`/api/shop/click/${product._id}`}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="ml-auto inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-hindi text-xs font-medium text-charcoal transition-all hover:scale-105"
                      style={{ background: "linear-gradient(135deg, #f7d8a3, #c89b3c)" }}
                    >
                      खरीदें
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
