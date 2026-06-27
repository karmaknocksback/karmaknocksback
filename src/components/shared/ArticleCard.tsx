import Link from "next/link";
import { Clock } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import Bilingual from "@/components/shared/Bilingual";
import { KNOWLEDGE_CATEGORY_LABELS_HI } from "@/lib/constants";
import { readingTime } from "@/lib/utils";
import type { ArticleData } from "@/types";

export default function ArticleCard({ article }: { article: ArticleData }) {
  const hasImage = /^https?:\/\//.test(article.thumbnail || "");

  return (
    <Link href={`/knowledge-hub/${article.slug}`} className="block h-full">
      <GlassCard glow className="h-full overflow-hidden flex flex-col">
        <div className="relative aspect-[16/10] w-full bg-gradient-to-br from-gold/25 to-saffron/40 flex items-center justify-center overflow-hidden">
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.thumbnail}
              alt={article.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <span className="font-display-hi text-2xl text-gold-deep/70 px-4 text-center">
              {KNOWLEDGE_CATEGORY_LABELS_HI[article.category] || article.category}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-display-hi text-lg text-charcoal leading-snug">
            <Bilingual hi={article.title} en={article.titleEn} />
          </h3>
          <p className="font-hindi mt-1.5 text-xs text-charcoal/60 line-clamp-2">
            <Bilingual hi={article.excerpt} en={article.excerptEn} />
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-charcoal/45">
            <Clock size={12} />
            <span className="font-sans text-xs">
              {readingTime(article.content)} मिनट पढ़ें
            </span>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
