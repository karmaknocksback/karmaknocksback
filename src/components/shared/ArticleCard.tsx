import Link from "next/link";
import { Clock } from "lucide-react";
import { KNOWLEDGE_CATEGORY_LABELS_HI } from "@/lib/constants";
import { readingTime } from "@/lib/utils";
import type { ArticleData } from "@/types";

// Category-specific gradient covers when no thumbnail
const CATEGORY_COVERS: Record<string, { gradient: string; emoji: string; text: string }> = {
  Swadhyay:       { gradient: "linear-gradient(135deg,#7C3AED,#4F46E5)", emoji: "📖", text: "स्वाध्याय" },
  Philosophy:     { gradient: "linear-gradient(135deg,#D97706,#92400E)", emoji: "🕉️", text: "जैन दर्शन" },
  Stories:        { gradient: "linear-gradient(135deg,#16A34A,#065F46)", emoji: "📚", text: "जैन कथाएँ" },
  "Jain Stories": { gradient: "linear-gradient(135deg,#16A34A,#065F46)", emoji: "📚", text: "जैन कथाएँ" },
  Kids:           { gradient: "linear-gradient(135deg,#EC4899,#BE185D)", emoji: "🌈", text: "बाल कोना" },
  History:        { gradient: "linear-gradient(135deg,#DC2626,#7F1D1D)", emoji: "🏛", text: "जैन इतिहास" },
  Meditation:     { gradient: "linear-gradient(135deg,#0891B2,#0E7490)", emoji: "🧘", text: "ध्यान" },
  Science:        { gradient: "linear-gradient(135deg,#0284C7,#075985)", emoji: "🔬", text: "विज्ञान" },
};

function getCover(category: string) {
  return CATEGORY_COVERS[category] || { gradient: "linear-gradient(135deg,#B91C1C,#7C2D12)", emoji: "🕉️", text: category };
}

export default function ArticleCard({ article }: { article: ArticleData }) {
  const hasImage = /^https?:\/\//.test(article.thumbnail || "");
  const cover = getCover(article.category);

  return (
    <Link href={`/knowledge-hub/${article.slug}`} className="block h-full group">
      <div className="h-full rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white" style={{border:"1px solid #E2E8F0"}}>
        
        {/* Cover Image — 16:10 ratio, prominent */}
        <div className="relative overflow-hidden" style={{aspectRatio:"16/10"}}>
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            /* Beautiful category cover when no image */
            <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden" style={{background:cover.gradient}}>
              {/* Pattern overlay */}
              <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.4) 1px,transparent 1px)",backgroundSize:"18px 18px"}}/>
              {/* Shine */}
              <div className="absolute inset-0" style={{background:"linear-gradient(135deg,rgba(255,255,255,0.2) 0%,transparent 50%)"}}/>
              <div className="relative text-center">
                <div className="text-5xl mb-2 drop-shadow-lg">{cover.emoji}</div>
                <p className="font-hindi font-black text-white text-sm opacity-90">{cover.text}</p>
              </div>
            </div>
          )}

          {/* Category badge on image */}
          <div className="absolute top-3 left-3">
            <span className="rounded-full px-3 py-1 font-hindi font-black text-[10px] text-white shadow-lg"
              style={{background:"rgba(0,0,0,0.55)",backdropFilter:"blur(6px)"}}>
              {KNOWLEDGE_CATEGORY_LABELS_HI[article.category] || article.category}
            </span>
          </div>

          {/* Reading time badge */}
          <div className="absolute bottom-3 right-3">
            <div className="flex items-center gap-1 rounded-full px-2.5 py-1" style={{background:"rgba(0,0,0,0.55)",backdropFilter:"blur(6px)"}}>
              <Clock size={10} className="text-white"/>
              <span className="font-sans text-white text-[10px] font-bold">{readingTime(article.content)} min</span>
            </div>
          </div>
        </div>

        {/* Content below image */}
        <div className="p-4">
          <h3 className="font-hindi font-black text-base text-gray-900 leading-snug mb-2 line-clamp-2">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="font-hindi text-xs text-gray-600 line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between mt-3 pt-3" style={{borderTop:"1px solid #F1F5F9"}}>
            <span className="font-sans text-[10px] text-gray-400">{article.author || "KarmaKnocksBack"}</span>
            <span className="font-sans text-xs font-bold text-amber-600 group-hover:text-amber-800">पढ़ें →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
