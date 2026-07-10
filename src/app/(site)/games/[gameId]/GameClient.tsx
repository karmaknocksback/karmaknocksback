"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePlayer } from "@/context/PlayerContext";

/* ── Inline player gate — no separate import needed ── */
const AVATARS = ["🧒","👦","👧","🧑","👨","👩","🧑‍🎓","👶","🧕","🧔"];

function PlayerGate({ children, gameId }: { children: React.ReactNode; gameId: string }) {
  const { player, setPlayer, isReady } = usePlayer();
  const [hasToken, setHasToken] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🧒");

  useEffect(()=>{
    setHasToken(!!localStorage.getItem("academy_token"));
  },[]);

  // Middleware already protects /games/[gameId] from unauthenticated cookie users
  // For localStorage-only players (set name but no academy account), show name picker
  if (!isReady) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-4xl animate-bounce">🎮</div>
    </div>
  );

  // If they have a player (guest or academy), let them play
  if (player) return <>{children}</>;

  // If they have an academy token, auto-resolve from token
  if (hasToken) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-4xl animate-bounce">🎮</div>
    </div>
  );

  // Not logged in at all — show sign-in wall
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(16px)" }}>
      <div className="rounded-3xl overflow-hidden w-full max-w-sm"
        style={{ background: "white", border: "4px solid #FFD700", boxShadow: "0 24px 80px rgba(255,215,0,0.6)", animation: "popIn 0.35s ease" }}>
        <div className="px-6 pt-7 pb-4 text-center"
          style={{ background: "linear-gradient(135deg,#1a0800,#3E1F00)" }}>
          <div className="text-5xl mb-2">🎮</div>
          <h2 className="font-sans font-black text-xl text-white">Sign in to Play!</h2>
          <p className="font-hindi text-sm text-amber-300 mt-1">खेलने के लिए साइन इन करें</p>
        </div>
        <div className="p-5">
          <p className="font-sans text-sm text-gray-600 text-center mb-5">
            Create a free account to play all games, earn Karma Stars, and save your progress!
          </p>
          <div className="space-y-2.5">
            <a href={`/academy/login?redirect=/games/${gameId}&reason=signin_required`}
              className="block w-full text-center py-3.5 rounded-2xl font-sans font-black text-sm text-amber-900"
              style={{ background: "linear-gradient(135deg,#FFD700,#FF9800)", boxShadow: "0 4px 16px rgba(255,215,0,0.4)" }}>
              🔑 Sign In
            </a>
            <a href={`/academy/register?redirect=/games/${gameId}`}
              className="block w-full text-center py-3 rounded-2xl font-sans font-black text-sm text-purple-700 bg-purple-50 border-2 border-purple-200">
              ✨ Create Free Account
            </a>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="font-sans text-xs text-gray-400 text-center mb-2">Or play as guest (progress not saved):</p>
            <div className="flex flex-wrap gap-1.5 justify-center mb-3">
              {AVATARS.map(a=>(
                <button key={a} onClick={()=>setAvatar(a)}
                  className="w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: avatar===a?"linear-gradient(135deg,#FFD700,#FF9800)":"#F5F5F5" }}>
                  {a}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Your name..." maxLength={20} value={name}
                onChange={e=>setName(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&name.trim()&&setPlayer({name:name.trim(),avatar})}
                className="flex-1 rounded-xl px-3 py-2 font-sans text-sm border-2 outline-none focus:border-amber-400"
                style={{ borderColor: "#E0E0E0" }}/>
              <button onClick={()=>name.trim()&&setPlayer({name:name.trim(),avatar})}
                disabled={!name.trim()}
                className="px-4 py-2 rounded-xl font-sans font-black text-xs text-white disabled:opacity-40"
                style={{ background: "#666" }}>
                Play
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes popIn{0%{transform:scale(0.6);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
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
    <PlayerGate gameId={gameId}>
      <Game />
    </PlayerGate>
  );
}
