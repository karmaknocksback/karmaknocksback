"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ══════════════════════════════════════════════════════════════
   JAIN KIDS FLIP BOOK
   ✓ 9:16 portrait full-view image
   ✓ Tap RIGHT half → next (locked until voiceover done)
   ✓ Tap LEFT half  → previous (always)
   ✓ Swipe left/right on mobile
   ✓ Page-flip 3D animation
   ✓ Voiceover must complete before next unlocks
   ✓ Optional text overlay (admin choice)
   ✓ Works even if no audio (auto-unlocked)
══════════════════════════════════════════════════════════════ */

interface Page {
  pageNumber: number;
  imageUrl:   string | null;
  audioUrl:   string | null;
  caption:    string | null;
}
interface Props {
  bookId:    string;
  bookTitle: string;
  bookEmoji: string;
  bookColor: string;
  pages:     Page[];
}

export default function FlipBook({ bookId, bookTitle, bookEmoji, bookColor, pages }: Props) {
  const [cur,          setCur]          = useState(0);
  const [flipping,     setFlipping]     = useState<"in"|"out"|null>(null);
  const [nextDir,      setNextDir]      = useState<"fwd"|"bwd">("fwd");
  const [audioReady,   setAudioReady]   = useState(true);  // true = can go next
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioPct,     setAudioPct]     = useState(0);
  const [imgLoaded,    setImgLoaded]    = useState(false);
  const [shakeNext,    setShakeNext]    = useState(false); // visual feedback when locked
  const [done,         setDone]         = useState<Set<number>>(new Set([0]));
  const [finished,     setFinished]     = useState(false);

  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const touchStart = useRef<{x:number;y:number}|null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const page    = pages[cur];
  const total   = pages.length;
  const hasNext = cur < total - 1;
  const hasPrev = cur > 0;
  const hasAudio  = !!page?.audioUrl;
  const hasCaption = !!page?.caption;

  // ── Load & play audio when page changes ───────────────
  useEffect(() => {
    setImgLoaded(false);
    setAudioPct(0);
    setAudioPlaying(false);

    // Stop previous
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current = null;
    }

    if (page?.audioUrl) {
      setAudioReady(false);  // lock until audio ends
      const audio = new Audio(page.audioUrl);
      audioRef.current = audio;

      audio.ontimeupdate = () => {
        if (audio.duration) setAudioPct(Math.round((audio.currentTime / audio.duration) * 100));
      };
      audio.onended = () => {
        setAudioReady(true);
        setAudioPlaying(false);
        setAudioPct(100);
      };
      audio.onerror = () => {
        // If audio fails to load, unlock next anyway
        setAudioReady(true);
        setAudioPlaying(false);
      };
      // Try autoplay - browsers may block; user tap on play button as fallback
      audio.play()
        .then(() => setAudioPlaying(true))
        .catch(() => {
          // Autoplay blocked - user must tap play
          setAudioPlaying(false);
        });
    } else {
      setAudioReady(true); // no audio = always unlocked
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur]);

  // ── Navigate to a page ────────────────────────────────
  const goTo = useCallback((target: number, dir: "fwd"|"bwd") => {
    if (target < 0 || target >= total || flipping) return;
    setNextDir(dir);
    setFlipping("out");
    setTimeout(() => {
      setCur(target);
      setDone(s => { const n = new Set(s); n.add(target); return n; });
      setFlipping("in");
      if (target === total - 1) setTimeout(() => setFinished(true), 800);
      setTimeout(() => setFlipping(null), 350);
    }, 300);
  }, [total, flipping]);

  const goNext = useCallback(() => {
    if (!hasNext) return;
    if (!audioReady) { setShakeNext(true); setTimeout(() => setShakeNext(false), 500); return; }
    goTo(cur + 1, "fwd");
  }, [hasNext, audioReady, cur, goTo]);

  const goPrev = useCallback(() => {
    if (!hasPrev) return;
    goTo(cur - 1, "bwd");
  }, [hasPrev, cur, goTo]);

  // ── Touch swipe ───────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    // Must be more horizontal than vertical, and > 40px
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      dx < 0 ? goNext() : goPrev();
    }
  };

  // ── Tap zone handler ──────────────────────────────────
  const onTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const half = rect.width / 2;
    x > half ? goNext() : goPrev();
  };

  // ── Play/replay audio ─────────────────────────────────
  const toggleAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audioPlaying) {
      audio.pause();
      setAudioPlaying(false);
    } else {
      audio.currentTime = audioPct < 99 ? audio.currentTime : 0;
      audio.play().then(() => {
        setAudioPlaying(true);
        if (audioPct >= 99) { setAudioReady(false); setAudioPct(0); }
      }).catch(() => {});
    }
  }, [audioPlaying, audioPct]);

  // ── Keyboard ──────────────────────────────────────────
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft")  goPrev();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [goNext, goPrev]);

  if (!page) return (
    <div className="flex items-center justify-center h-48 text-white font-sans text-sm">
      No pages yet — admin needs to upload images.
    </div>
  );

  // ── Flip animation style ──────────────────────────────
  const flipStyle: React.CSSProperties = flipping === "out"
    ? { transform: `perspective(1200px) rotateY(${nextDir==="fwd"?"-90deg":"90deg"})`, transition: "transform 0.3s ease-in", opacity: 0.2 }
    : flipping === "in"
    ? { transform: `perspective(1200px) rotateY(${nextDir==="fwd"?"90deg":"-90deg"})`, transition: "none", opacity: 0 }
    : { transform: "perspective(1200px) rotateY(0deg)", transition: "transform 0.35s ease-out, opacity 0.35s ease-out", opacity: 1 };

  return (
    <div className="flex flex-col items-center w-full" style={{userSelect:"none",WebkitUserSelect:"none"}}>

      {/* ── Progress dots ── */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap justify-center max-w-sm px-4">
        {pages.map((_,i) => (
          <div key={i}
            className="rounded-full transition-all duration-300 cursor-pointer"
            onClick={() => i < cur ? goTo(i,"bwd") : i > cur ? (audioReady ? goTo(i,"fwd") : undefined) : undefined}
            style={{
              width:  i === cur ? 22 : 8,
              height: 8,
              background: done.has(i) ? bookColor : "rgba(255,255,255,0.15)",
              boxShadow: i === cur ? `0 0 12px ${bookColor}` : "none",
            }}/>
        ))}
      </div>

      {/* ── Book container 9:16 ── */}
      <div
        ref={containerRef}
        className="relative w-full cursor-pointer"
        style={{
          maxWidth: 380,
          aspectRatio: "9/16",
          maxHeight: "calc(100svh - 220px)",
          borderRadius: 20,
          overflow: "hidden",
          background: "#000",
          boxShadow: `0 32px 96px ${bookColor}45, 0 0 0 2px ${bookColor}35`,
          ...flipStyle,
        }}
        onClick={onTap}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}>

        {/* Image */}
        {page.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`img-${cur}-${page.imageUrl}`}
            src={page.imageUrl}
            alt={`Page ${cur+1}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(true)}
            draggable={false}
            style={{
              position:"absolute", inset:0, width:"100%", height:"100%",
              objectFit:"contain", display:"block", background:"#000",
              opacity: imgLoaded ? 1 : 0,
              transition: "opacity 0.4s ease",
            }}/>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center"
            style={{background:"linear-gradient(135deg,#1a0800,#0d0d1a)"}}>
            <div style={{fontSize:80}}>{bookEmoji}</div>
            <p className="font-sans text-white/30 text-sm mt-3">Page {cur+1}</p>
          </div>
        )}

        {/* Loading */}
        {page.imageUrl && !imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{background:"#1a1a2e"}}>
            <div className="text-6xl animate-bounce">{bookEmoji}</div>
          </div>
        )}

        {/* Text overlay — bottom gradient */}
        {hasCaption && (
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{
              background:"linear-gradient(0deg,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.5) 60%,transparent 100%)",
              padding:"40px 20px 24px",
            }}>
            <p className="font-sans font-black text-white text-center leading-snug"
              style={{fontSize:"clamp(15px,4vw,22px)",textShadow:"0 2px 10px rgba(0,0,0,0.9)"}}>
              {page.caption}
            </p>
          </div>
        )}

        {/* Page number */}
        <div className="absolute top-3 left-3 rounded-full px-2.5 py-1 font-sans font-black text-[11px] text-white"
          style={{background:"rgba(0,0,0,0.55)",backdropFilter:"blur(6px)"}}>
          {cur+1}/{total}
        </div>

        {/* Book title badge */}
        <div className="absolute top-3 right-3 rounded-full px-2.5 py-1 font-sans font-black text-[10px]"
          style={{background:bookColor,color:"#1a0800"}}>
          {bookEmoji}
        </div>

        {/* Left tap visual hint */}
        {hasPrev && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{opacity:0.35}}>
            <div className="rounded-full p-2" style={{background:"rgba(0,0,0,0.4)"}}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M11 3L5 9l6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        )}

        {/* Right tap visual — shows LOCK or arrow */}
        {hasNext && (
          <div
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              opacity: 0.45,
              animation: shakeNext ? "shake 0.4s ease" : "none",
            }}>
            <div className="rounded-full p-2"
              style={{background: audioReady ? "rgba(0,0,0,0.4)" : `${bookColor}50`}}>
              {audioReady ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M7 3l6 6-6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <span style={{fontSize:16}}>🔒</span>
              )}
            </div>
          </div>
        )}

        {/* FINISHED overlay */}
        {finished && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-50"
            onClick={e=>e.stopPropagation()}
            style={{background:"rgba(0,0,0,0.88)",backdropFilter:"blur(6px)"}}>
            <div style={{fontSize:72}} className="animate-bounce mb-3">🌟</div>
            <p className="font-sans font-black text-2xl text-white mb-1">You did it!</p>
            <p className="font-hindi text-base mb-6" style={{color:bookColor}}>शाबाश! वाह!</p>
            <button
              className="px-8 py-3 rounded-2xl font-sans font-black text-sm"
              style={{background:`linear-gradient(135deg,${bookColor},${bookColor}cc)`,color:"#1a0800"}}
              onClick={() => { setFinished(false); setCur(0); setDone(new Set([0])); }}>
              📖 Read Again!
            </button>
          </div>
        )}
      </div>

      {/* ── Audio bar ── */}
      {hasAudio && (
        <div className="w-full mt-4 px-2" style={{maxWidth:380}}>
          <div className="rounded-2xl px-4 py-3"
            style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.09)"}}>
            <div className="flex items-center gap-3">
              {/* Play/pause */}
              <button
                onClick={toggleAudio}
                className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all active:scale-90"
                style={{background:bookColor,color:"#1a0800",boxShadow:`0 4px 16px ${bookColor}55`,border:"none"}}>
                {audioPlaying ? "⏸" : "▶"}
              </button>
              {/* Progress bar */}
              <div className="flex-1">
                <div className="h-2.5 rounded-full overflow-hidden cursor-pointer"
                  style={{background:"rgba(255,255,255,0.1)"}}
                  onClick={e => {
                    if (!audioRef.current) return;
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    const pct = (e.clientX - rect.left) / rect.width;
                    audioRef.current.currentTime = audioRef.current.duration * pct;
                  }}>
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{width:`${audioPct}%`,background:`linear-gradient(90deg,${bookColor},${bookColor}bb)`}}/>
                </div>
              </div>
              {/* Lock/unlock */}
              {audioReady ? (
                <span className="shrink-0 text-xl" title="Unlocked!">✅</span>
              ) : (
                <span className="shrink-0 text-xl" title="Listen to unlock">🔒</span>
              )}
            </div>
            {!audioReady && (
              <p className="font-sans text-[10px] text-center mt-2"
                style={{color:`${bookColor}cc`}}>
                🎧 Listen to unlock the next page →
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Bottom nav buttons ── */}
      <div className="flex items-center gap-3 mt-4 px-2 w-full" style={{maxWidth:380}}>
        <button
          onClick={goPrev} disabled={!hasPrev}
          className="flex items-center gap-2 flex-1 justify-center rounded-2xl py-3 font-sans font-black text-sm transition-all active:scale-95 disabled:opacity-25"
          style={{background:"rgba(255,255,255,0.07)",color:"white",border:"1px solid rgba(255,255,255,0.1)"}}>
          ← Back
        </button>
        <div className="font-sans text-xs text-gray-500 shrink-0 text-center w-16">
          {cur+1} / {total}
        </div>
        <button
          onClick={goNext}
          disabled={!hasNext || !audioReady}
          className="flex items-center gap-2 flex-1 justify-center rounded-2xl py-3 font-sans font-black text-sm transition-all active:scale-95 disabled:opacity-25"
          style={{
            background: hasNext && audioReady ? `linear-gradient(135deg,${bookColor},${bookColor}cc)` : "rgba(255,255,255,0.07)",
            color: hasNext && audioReady ? "#1a0800" : "rgba(255,255,255,0.25)",
            border: "none",
            boxShadow: hasNext && audioReady ? `0 4px 16px ${bookColor}40` : "none",
          }}>
          Next →
        </button>
      </div>

      {/* Book title */}
      <p className="font-sans font-black text-white/50 text-xs mt-3 text-center">{bookEmoji} {bookTitle}</p>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-5px)}
          40%{transform:translateX(5px)}
          60%{transform:translateX(-5px)}
          80%{transform:translateX(5px)}
        }
      `}</style>
    </div>
  );
}
