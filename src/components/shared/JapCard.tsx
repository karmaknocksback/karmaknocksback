import Link from "next/link";
import { Clock, PlayCircle } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import Bilingual from "@/components/shared/Bilingual";
import { JAP_CATEGORY_LABELS_HI } from "@/lib/constants";
import { PURPOSE_TAG_LABELS_HI, type PurposeTag } from "@/lib/jap-library/purpose-tags";
import type { JapData } from "@/types";

export default function JapCard({ jap }: { jap: JapData }) {
  const hasImage = /^https?:\/\//.test(jap.thumbnail || "");

  return (
    <Link href={`/jap-library/${jap.slug}`} className="block h-full group">
      <GlassCard glow className="h-full overflow-hidden flex flex-col">
        <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-saffron/50 to-gold/30 flex items-center justify-center overflow-hidden">
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={jap.thumbnail}
              alt={jap.titleHi}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <span className="font-display-hi text-3xl text-gold-deep/70">
              {jap.titleHi.slice(0, 2)}
            </span>
          )}
          <span className="absolute top-3 left-3 rounded-full bg-black/70 px-2.5 py-1 font-sans text-[11px] text-white">
            {JAP_CATEGORY_LABELS_HI[jap.category] || jap.category}
          </span>
          <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-charcoal/20">
            <PlayCircle className="text-warm-white" size={36} />
          </span>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-display-hi text-lg text-charcoal leading-snug">
            <Bilingual hi={jap.titleHi} en={jap.titleEn} />
          </h3>
          <p className="font-hindi mt-1 text-xs text-charcoal/60 line-clamp-2">
            <Bilingual hi={jap.purpose} en={jap.purposeEn} />
          </p>
          {!!jap.purposeTags?.length && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {jap.purposeTags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gold/10 px-2 py-0.5 font-hindi text-[10px] text-gold-deep"
                >
                  {PURPOSE_TAG_LABELS_HI[tag as PurposeTag] || tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center gap-1.5 text-charcoal/50">
            <Clock size={13} />
            <span className="font-sans text-xs">{jap.durationMinutes} मिनट</span>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
