import { Clock, PlayCircle, ExternalLink, Info } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import Bilingual from "@/components/shared/Bilingual";
import { JAP_CATEGORY_LABELS_HI } from "@/lib/constants";
import { PURPOSE_TAG_LABELS_HI, type PurposeTag } from "@/lib/jap-library/purpose-tags";
import type { JapData } from "@/types";

function getYouTubeId(url: string): string | null {
  const m = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function JapCard({ jap }: { jap: JapData }) {
  const ytId = getYouTubeId(jap.youtubeLink || jap.thumbnail || "");
  const thumbnail = ytId
    ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
    : jap.thumbnail;
  const youtubeUrl = jap.youtubeLink || (ytId ? `https://www.youtube.com/watch?v=${ytId}` : null);
  const hasImage = (thumbnail || "").startsWith("http");

  return (
    <div className="block h-full group">
      <GlassCard glow className="h-full overflow-hidden flex flex-col">
        {/* Thumbnail — clicks open YouTube */}
        <a
          href={youtubeUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="relative aspect-[4/3] w-full bg-gradient-to-br from-saffron/50 to-gold/30 flex items-center justify-center overflow-hidden"
          aria-label={`YouTube पर देखें: ${jap.titleHi}`}
        >
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnail}
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
          {/* YouTube play overlay */}
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/25 transition-all">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              <PlayCircle className="text-white fill-white" size={28} />
            </span>
          </span>
          {/* YouTube badge */}
          {youtubeUrl && (
            <span className="absolute bottom-2 right-2 rounded-full bg-red-600 px-2 py-0.5 font-sans text-[9px] font-bold text-white flex items-center gap-1">
              <ExternalLink size={8} /> YouTube
            </span>
          )}
        </a>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-display-hi text-base text-charcoal leading-snug mb-1">
            <Bilingual hi={jap.titleHi} en={jap.titleEn} />
          </h3>
          <p className="font-hindi text-xs text-charcoal/60 line-clamp-2">
            <Bilingual hi={jap.purpose} en={jap.purposeEn} />
          </p>

          {!!jap.purposeTags?.length && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {jap.purposeTags.slice(0, 2).map((tag) => (
                <span key={tag}
                  className="rounded-full bg-gold/10 px-2 py-0.5 font-hindi text-[10px] text-gold-deep">
                  {PURPOSE_TAG_LABELS_HI[tag as PurposeTag] || tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto pt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-charcoal/45">
              <Clock size={12} />
              <span className="font-sans text-xs">{jap.durationMinutes} min</span>
            </div>
            {youtubeUrl && (
              <a href={youtubeUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1.5 font-sans text-[11px] font-semibold text-white hover:bg-red-700 transition-colors">
                <PlayCircle size={11} /> Watch
              </a>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
