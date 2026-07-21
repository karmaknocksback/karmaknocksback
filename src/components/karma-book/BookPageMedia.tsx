"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

export interface PageMedia {
  imageUrl: string | null;
  audioUrl: string | null;
  caption: string | null;
}

interface Props {
  media?: PageMedia;
  fallback: React.ReactNode; // SVG illustration
  pageLabel?: string;
}

export default function BookPageMedia({ media, fallback, pageLabel }: Props) {
  const hasImage = !!(media?.imageUrl);
  const hasAudio = !!(media?.audioUrl);

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Image or SVG */}
      <div className="flex-1 relative overflow-hidden">
        {hasImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={media!.imageUrl!}
              alt={media?.caption || pageLabel || "Book page"}
              className="w-full h-full"
              style={{
                objectFit:"contain",
                background:"#0a0015",
                display:"block",
              }}
            />
            {/* Caption overlay */}
            {media?.caption && (
              <div className="absolute bottom-0 left-0 right-0 px-3 py-2"
                style={{ background: "linear-gradient(transparent,rgba(0,0,0,0.7))" }}>
                <p className="font-hindi text-xs text-white leading-snug">{media.caption}</p>
              </div>
            )}
          </>
        ) : (
          fallback
        )}
      </div>

      {/* Audio player */}
      {hasAudio && (
        <AudioBar src={media!.audioUrl!} />
      )}
    </div>
  );
}

/* ── Compact audio bar ── */
function AudioBar({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setProgress(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => { setPlaying(false); setProgress(0); };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play().catch(() => {}); setPlaying(true); }
  }

  function fmt(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2 px-3 py-2 shrink-0"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <button onClick={toggle}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors"
        style={{ background: playing ? "#c89b3c" : "rgba(255,255,255,0.15)" }}>
        {playing
          ? <Pause size={14} className="text-white fill-white" />
          : <Play size={14} className="text-white fill-white" />}
      </button>

      {/* Waveform / progress bar */}
      <div className="flex-1 relative h-1.5 rounded-full bg-white/20 cursor-pointer"
        onClick={(e) => {
          const audio = audioRef.current;
          if (!audio || !duration) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          audio.currentTime = pct * duration;
        }}>
        <div className="absolute inset-y-0 left-0 rounded-full bg-gold transition-all"
          style={{ width: `${pct}%` }} />
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Volume2 size={11} className="text-white/50" />
        <span className="font-sans text-[10px] text-white/50 tabular-nums">
          {duration ? `${fmt(progress)} / ${fmt(duration)}` : "Voice"}
        </span>
      </div>
    </div>
  );
}
