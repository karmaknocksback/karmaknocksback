"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ══════════════════════════════════════════════════════════════
   JAIN KIDS FLIP BOOK
   ─ 9:16 portrait full-view image
   ─ Tap RIGHT → next page (locked until voiceover completes)
   ─ Tap LEFT  → previous page (always allowed)
   ─ Page-flip CSS animation
   ─ Optional text overlay (admin controlled)
   ─ Voiceover must finish before next is allowed
══════════════════════════════════════════════════════════════ */

interface Page {
  pageNumber: number;
  imageUrl:   string | null;
  audioUrl:   string | null;
  caption:    string | null;   // optional text overlay
}

interface Props {
  bookId:    string;
  bookTitle: string;
  bookEmoji: string;
  bookColor: string;
  pages:     Page[];           // sorted by pageNumber
}

type FlipDir = "left" | "right" | null;

export default function FlipBook({ bookId, bookTitle, bookEmoji, bookColor, pages }: Props) {
  const [cur, setCur]             = useState(0);
  const [flip, setFlip]           = useState<FlipDir>(null);
  const [audioReady, setAudioReady] = useState(false);   // audio finished?
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0); // 0–100
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showHint, setShowHint]   = useState(true);
  const [completed, setCompleted] = useState<Set<number>>(()=>new Set([0]));
  const audioRef  = useRef<HTMLAudioElement | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const page    = pages[cur] ?? null;
  const hasNext = cur < pages.length - 1;
  const hasPrev = cur > 0;
  const hasAudio  = !!page?.audioUrl;
  const hasCaption = !!page?.caption;

  // ── Reset state when page changes ─────────────────────────
  useEffect(() => {
    setImgLoaded(false);
    setAudioReady(!hasAudio);  // if no audio, immediately unlocked
    setAudioProgress(0);
    setAudioPlaying(false);

    // Stop and unload previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }

    if (page?.audioUrl) {
      const audio = new Audio(page.audioUrl);
      audioRef.current = audio;

      audio.addEventListener("timeupdate", () => {
        if (audio.duration > 0) {
          setAudioProgress(Math.round((audio.currentTime / audio.duration) * 100));
        }
      });
      audio.addEventListener("ended", () => {
        setAudioReady(true);
        setAudioPlaying(false);
        setAudioProgress(100);
      });
      audio.addEventListener("canplaythrough", () => {
        audio.play().then(() => setAudioPlaying(true)).catch(() => {});
      });
      audio.load();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [cur, page?.audioUrl, hasAudio]);

  // ── Hide tap hint after 3s ──────────────────────────────
  useEffect(() => {
    if (showHint) {
      hintTimer.current = setTimeout(() => setShowHint(false), 3000);
      return () => { if(hintTimer.current) clearTimeout(hintTimer.current); };
    }
  }, [showHint, cur]);

  // ── Page navigation ─────────────────────────────────────
  const goNext = useCallback(() => {
    if (!hasNext || flip) return;
    if (!audioReady) {
      // Shake the right side to show "wait!"
      setShowHint(true);
      return;
    }
    setFlip("right");
    setTimeout(() => {
      setCur(c => {
        const n = c + 1;
        setCompleted(s => { const ns = new Set(s); ns.add(n); return ns; });
        return n;
      });
      setFlip(null);
    }, 400);
  }, [hasNext, flip, audioReady]);

  const goPrev = useCallback(() => {
    if (!hasPrev || flip) return;
    setFlip("left");
    setTimeout(() => {
      setCur(c => c - 1);
      setFlip(null);
    }, 400);
  }, [hasPrev, flip]);

  const replayAudio = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().then(() => {
      setAudioPlaying(true);
      setAudioReady(false);
      setAudioProgress(0);
    }).catch(() => {});
  }, []);

  // ── Keyboard support ─────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft")  goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  if (!page) return (
    <div className="flex items-center justify-center h-64 text-white font-sans">
      No pages found. Admin needs to upload images.
    </div>
  );

  const isLast = cur === pages.length - 1;

  return (
    <div className="flex flex-col items-center select-none"
      style={{fontFamily:"system-ui,sans-serif",userSelect:"none"}}>

      {/* ── Book title bar ── */}
      <div className="w-full max-w-sm flex items-center justify-between px-4 py-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{bookEmoji}</span>
          <span className="font-black text-sm text-white truncate max-w-[160px]">{bookTitle}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {pages.map((_, i) => (
            <div key={i} className="rounded-full transition-all duration-300"
              style={{
                width:  i === cur ? 20 : 7,
                height: 7,
                background: completed.has(i)
                  ? bookColor
                  : "rgba(255,255,255,0.2)",
              }}/>
          ))}
        </div>
      </div>

      {/* ── Main book area ─ 9:16 ── */}
      <div className="relative w-full max-w-sm"
        style={{
          aspectRatio: "9/16",
          maxHeight: "calc(100vh - 200px)",
          overflow: "hidden",
          borderRadius: 24,
          boxShadow: `0 24px 80px ${bookColor}50, 0 0 0 2px ${bookColor}40`,
        }}>

        {/* Loading skeleton */}
        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{background:"#1a1a2e"}}>
            <div className="text-5xl animate-bounce">{bookEmoji}</div>
          </div>
        )}

        {/* Page image with flip animation */}
        {page.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`img-${cur}`}
            src={page.imageUrl}
            alt={`Page ${cur + 1}`}
            onLoad={() => setImgLoaded(true)}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: imgLoaded ? 1 : 0,
              transition: "opacity 0.3s ease",
              animation: flip
                ? `${flip === "right" ? "flipPageRight" : "flipPageLeft"} 0.4s ease`
                : "none",
            }}
          />
        )}

        {/* No image placeholder */}
        {!page.imageUrl && imgLoaded === false && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{background:"linear-gradient(135deg,#1a0800,#0d0d1a)"}}>
            <div className="text-center">
              <div className="text-7xl mb-3">{bookEmoji}</div>
              <p className="font-sans text-xs text-gray-400">Page {cur + 1}</p>
              <p className="font-sans text-[10px] text-gray-600 mt-1">Image coming soon</p>
            </div>
          </div>
        )}

        {/* ── Text overlay (admin optional) ── */}
        {hasCaption && imgLoaded && (
          <div className="absolute bottom-0 left-0 right-0 p-5"
            style={{
              background: "linear-gradient(0deg,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.4) 80%,transparent 100%)",
            }}>
            <p className="font-sans font-black text-white text-center leading-snug"
              style={{fontSize:"clamp(14px,3.5vw,20px)",textShadow:"0 2px 8px rgba(0,0,0,0.8)"}}>
              {page.caption}
            </p>
          </div>
        )}

        {/* ── TAP ZONES ── */}
        {/* Left tap zone — go back */}
        <button
          onClick={goPrev}
          disabled={!hasPrev}
          aria-label="Previous page"
          className="absolute left-0 top-0 bottom-0 z-20 flex items-center justify-start pl-3"
          style={{width:"35%",background:"transparent",border:"none",cursor:hasPrev?"pointer":"default"}}>
          {hasPrev && (
            <div className="rounded-full p-2 opacity-0 hover:opacity-100 active:opacity-100 transition-opacity"
              style={{background:"rgba(0,0,0,0.3)"}}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                <path d="M13 4l-6 6 6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
          )}
        </button>

        {/* Right tap zone — go next (locked until audio done) */}
        <button
          onClick={goNext}
          disabled={!hasNext}
          aria-label="Next page"
          className="absolute right-0 top-0 bottom-0 z-20 flex items-center justify-end pr-3"
          style={{width:"35%",background:"transparent",border:"none",cursor:hasNext?"pointer":"default"}}>
          {hasNext && (
            <div className="rounded-full p-2 opacity-0 hover:opacity-100 active:opacity-100 transition-opacity"
              style={{background:audioReady?"rgba(0,0,0,0.3)":"rgba(255,152,0,0.3)"}}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                <path d="M7 4l6 6-6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
          )}
        </button>

        {/* Page number badge */}
        <div className="absolute top-3 right-3 z-30 rounded-full px-2.5 py-1 font-sans font-black text-[10px]"
          style={{background:"rgba(0,0,0,0.5)",color:"white",backdropFilter:"blur(4px)"}}>
          {cur + 1} / {pages.length}
        </div>

        {/* ── Tap hint overlay (first load, or when locked) ── */}
        {showHint && (
          <div className="absolute inset-0 z-40 flex items-end justify-center pb-16 pointer-events-none">
            <div className="rounded-2xl px-5 py-3 text-center"
              style={{background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.1)"}}>
              {!audioReady && hasAudio ? (
                <>
                  <p className="font-sans font-black text-sm text-orange-300 mb-1">🔊 Listen first!</p>
                  <p className="font-sans text-[11px] text-gray-300">Tap ▶ to hear the story, then swipe right</p>
                </>
              ) : (
                <>
                  <p className="font-sans font-black text-xs text-white mb-1">
                    <span className="opacity-50">◀ tap</span> &nbsp; Flip &nbsp; <span className="opacity-50">tap ▶</span>
                  </p>
                  <p className="font-sans text-[10px] text-gray-400">Tap right half for next page</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Audio locked overlay (visual feedback when tapping locked) ── */}
        {!audioReady && hasAudio && !audioPlaying && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <div className="rounded-full p-6 animate-pulse"
              style={{background:`${bookColor}20`,border:`3px solid ${bookColor}60`}}>
              <span className="text-4xl">🔊</span>
            </div>
          </div>
        )}

        {/* ── Book end screen ── */}
        {isLast && completed.has(cur) && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center"
            style={{background:"linear-gradient(135deg,rgba(0,0,0,0.92),rgba(26,8,0,0.95))"}}>
            <div className="text-7xl mb-4 animate-bounce">🌟</div>
            <p className="font-sans font-black text-2xl text-white mb-2">You did it!</p>
            <p className="font-hindi text-sm text-amber-400 mb-6">बहुत अच्छे! वाह!</p>
            <button onClick={() => { setCur(0); setCompleted(new Set([0])); }}
              className="px-8 py-3 rounded-2xl font-sans font-black text-sm text-amber-900"
              style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>
              📖 Read Again!
            </button>
          </div>
        )}
      </div>

      {/* ── Audio controls ── */}
      <div className="w-full max-w-sm mt-4 px-2">
        {hasAudio && (
          <div className="rounded-2xl px-4 py-3"
            style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)"}}>
            <div className="flex items-center gap-3">
              <button onClick={replayAudio}
                className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{background:bookColor,boxShadow:`0 4px 14px ${bookColor}50`}}>
                {audioPlaying ? "⏸" : "▶"}
              </button>
              {/* Progress bar */}
              <div className="flex-1 h-2 rounded-full overflow-hidden"
                style={{background:"rgba(255,255,255,0.1)"}}>
                <div className="h-full rounded-full transition-all duration-300"
                  style={{width:`${audioProgress}%`,background:bookColor}}/>
              </div>
              {audioReady ? (
                <span className="shrink-0 text-lg">✅</span>
              ) : (
                <span className="shrink-0 font-sans text-[10px] text-orange-400 font-bold">🔒</span>
              )}
            </div>
            {!audioReady && (
              <p className="font-sans text-[10px] text-orange-300/80 text-center mt-2">
                Listen to unlock next page →
              </p>
            )}
          </div>
        )}

        {/* Page caption below if no image (fallback) */}
        {!page.imageUrl && page.caption && (
          <div className="rounded-2xl p-4 text-center mt-2"
            style={{background:"rgba(255,255,255,0.06)"}}>
            <p className="font-sans text-sm text-white">{page.caption}</p>
          </div>
        )}
      </div>

      {/* ── Navigation arrows (bottom) ── */}
      <div className="flex items-center gap-4 mt-4 w-full max-w-sm px-4 justify-between">
        <button onClick={goPrev} disabled={!hasPrev}
          className="flex items-center gap-2 rounded-2xl px-5 py-2.5 font-sans font-black text-sm transition-all active:scale-95 disabled:opacity-30"
          style={{background:"rgba(255,255,255,0.08)",color:"white",border:"1px solid rgba(255,255,255,0.1)"}}>
          ← Prev
        </button>
        <div className="font-sans text-xs text-gray-500 text-center">
          Page {cur + 1} of {pages.length}
        </div>
        <button onClick={goNext}
          disabled={!hasNext || !audioReady}
          className="flex items-center gap-2 rounded-2xl px-5 py-2.5 font-sans font-black text-sm transition-all active:scale-95 disabled:opacity-30"
          style={{
            background: hasNext && audioReady
              ? `linear-gradient(135deg,${bookColor},${bookColor}cc)`
              : "rgba(255,255,255,0.08)",
            color: hasNext && audioReady ? "white" : "rgba(255,255,255,0.3)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: hasNext && audioReady ? `0 4px 14px ${bookColor}40` : "none",
          }}>
          Next →
        </button>
      </div>

      {/* ── CSS animations ── */}
      <style>{`
        @keyframes flipPageRight {
          0%   { transform: perspective(1000px) rotateY(0deg);   opacity: 1; }
          50%  { transform: perspective(1000px) rotateY(-90deg); opacity: 0.3; }
          100% { transform: perspective(1000px) rotateY(0deg);   opacity: 1; }
        }
        @keyframes flipPageLeft {
          0%   { transform: perspective(1000px) rotateY(0deg);  opacity: 1; }
          50%  { transform: perspective(1000px) rotateY(90deg); opacity: 0.3; }
          100% { transform: perspective(1000px) rotateY(0deg);  opacity: 1; }
        }
      `}</style>
    </div>
  );
}
