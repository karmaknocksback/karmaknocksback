"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePlayer } from "@/context/PlayerContext";

/* ── Inline player gate — no separate import needed ── */
const AVATARS = ["🧒","👦","👧","🧑","👨","👩","🧑‍🎓","👶","🧕","🧔"];

function PlayerGate({ children }: { children: React.ReactNode }) {
  const { player, setPlayer, isReady } = usePlayer();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🧒");

  if (!isReady) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-4xl animate-bounce">🎮</div>
    </div>
  );

  if (!player) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(14px)" }}>
      <div className="rounded-3xl overflow-hidden w-full max-w-sm"
        style={{ background: "white", border: "4px solid #FFD700", boxShadow: "0 24px 80px rgba(255,215,0,0.6)", animation: "popIn 0.35s ease" }}>
        <div className="px-6 pt-7 pb-4 text-center" style={{ background: "linear-gradient(135deg,#FFFDE7,#FFF9C4)" }}>
          <div className="text-5xl mb-2">🎮</div>
          <h2 className="font-sans font-black text-xl text-amber-900">Welcome to Karma Kids World!</h2>
          <p className="font-hindi text-sm text-amber-600 mt-1">खेलने से पहले अपना नाम बताएं!</p>
        </div>
        <div className="p-5">
          <p className="font-sans text-xs font-black text-gray-600 mb-2">Choose your avatar:</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {AVATARS.map(a => (
              <button key={a} onClick={() => setAvatar(a)}
                className="w-10 h-10 rounded-xl text-2xl flex items-center justify-center transition-all hover:scale-110"
                style={{ background: avatar === a ? "linear-gradient(135deg,#FFD700,#FF9800)" : "#F5F5F5", border: `2px solid ${avatar === a ? "#FF9800" : "transparent"}` }}>
                {a}
              </button>
            ))}
          </div>
          <label className="block font-sans text-xs font-black text-gray-600 mb-2">Your Name / आपका नाम</label>
          <input type="text" placeholder="Enter your name..." maxLength={20} value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && name.trim() && setPlayer({ name: name.trim(), avatar })}
            className="w-full rounded-xl px-4 py-3 font-sans text-base border-2 outline-none focus:border-amber-400 mb-4"
            style={{ borderColor: "#E0E0E0" }} autoFocus />
          <button onClick={() => name.trim() && setPlayer({ name: name.trim(), avatar })}
            disabled={!name.trim()}
            className="w-full py-3.5 rounded-2xl font-sans font-black text-sm disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#FFD700,#FF9800)", color: "#1a0800" }}>
            {avatar} Let&apos;s Play! →
          </button>
          <p className="text-center font-sans text-[10px] text-gray-400 mt-2">Saved until you clear browser cache 🙌</p>
        </div>
      </div>
      <style>{`@keyframes popIn{0%{transform:scale(0.6);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );

  return <>{children}</>;
}

/* ── Loading skeletons ── */
function Skeleton({ e, c }: { e: string; c: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="text-6xl" style={{ animation: "bounce2 0.9s ease-in-out infinite" }}>{e}</div>
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-3 h-3 rounded-full"
            style={{ background: c, animation: `bounce2 0.7s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
      <p className="font-hindi text-sm font-bold" style={{ color: c }}>खेल तैयार हो रहा है…</p>
      <style>{`@keyframes bounce2{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}`}</style>
    </div>
  );
}

const GAMES: Record<string, React.ComponentType> = {
  "snakes-ladders": dynamic(() => import("@/components/games/KarmaSnakesLadders"), { loading: () => <Skeleton e="🎲" c="#4CAF50" />, ssr: false }),
  "memory-quest":   dynamic(() => import("@/components/games/NavkarMemoryQuest"),  { loading: () => <Skeleton e="🧩" c="#9C27B0" />, ssr: false }),
  "daily-karma":    dynamic(() => import("@/components/games/DailyKarmaGame"),     { loading: () => <Skeleton e="⭐" c="#FF9800" />, ssr: false }),
  "tiny-rescue":    dynamic(() => import("@/components/games/TinyLifeRescue"),     { loading: () => <Skeleton e="🦋" c="#00BCD4" />, ssr: false }),
  "karma-garden":   dynamic(() => import("@/components/games/KarmaGarden"),        { loading: () => <Skeleton e="🌸" c="#E91E63" />, ssr: false }),
  "karma-forest":   dynamic(() => import("@/components/games/KarmaForest"),        { loading: () => <Skeleton e="🌳" c="#388E3C" />, ssr: false }),
  "temptation-run": dynamic(() => import("@/components/games/TemptationRun"),      { loading: () => <Skeleton e="🏃" c="#FF5722" />, ssr: false }),
  "temple-builder": dynamic(() => import("@/components/games/TempleBuilder"),      { loading: () => <Skeleton e="🕌" c="#F57F17" />, ssr: false }),
  "jain-stories":   dynamic(() => import("@/components/games/JainStoryAdventures"),{ loading: () => <Skeleton e="📖" c="#BF360C" />, ssr: false }),
  "aparigraha":     dynamic(() => import("@/components/games/AparigrahaAdventure"),{ loading: () => <Skeleton e="🎒" c="#4E342E" />, ssr: false }),
  "compassion-city":dynamic(() => import("@/components/games/CompassionCity"),     { loading: () => <Skeleton e="🏙️" c="#0D47A1" />, ssr: false }),
  "karma-ludo":     dynamic(() => import("@/components/games/KarmaLudo"),          { loading: () => <Skeleton e="🎯" c="#7B1FA2" />, ssr: false }),
  "karma-grid":     dynamic(() => import("@/components/games/KarmaGrid"),          { loading: () => <Skeleton e="🪷" c="#7C4DFF" />, ssr: false }),
  "word-builder":   dynamic(() => import("@/components/games/KarmaWordGame"),      { loading: () => <Skeleton e="📝" c="#9C27B0" />, ssr: false }),
  "karma-crush":    dynamic(() => import("@/components/games/KarmaCrush"),         { loading: () => <Skeleton e="🪷" c="#E91E63" />, ssr: false }),
};

export default function GameClient({ gameId, emoji, color }: { gameId: string; emoji: string; color: string }) {
  const Game = GAMES[gameId];
  if (!Game) return <Skeleton e={emoji} c={color} />;
  return (
    <PlayerGate>
      <Game />
    </PlayerGate>
  );
}
