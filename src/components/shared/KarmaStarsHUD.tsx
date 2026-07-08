"use client";
import { useEffect, useState } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { getLevelFromStars, getLevelProgress, getNextLevel, GuestStars } from "@/lib/karma-stars";
import Link from "next/link";

export default function KarmaStarsHUD() {
  const { player } = usePlayer();
  const [stars, setStars] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [starAnim, setStarAnim] = useState(false);

  useEffect(() => {
    if (!player) return;
    const s = GuestStars.get();
    setStars(s);
    // Listen for star updates
    const handler = () => {
      const newS = GuestStars.get();
      if (newS !== stars) {
        setStars(newS);
        setStarAnim(true);
        setTimeout(() => setStarAnim(false), 800);
      }
    };
    window.addEventListener("karmaStarsUpdate", handler);
    return () => window.removeEventListener("karmaStarsUpdate", handler);
  }, [player, stars]);

  if (!player) return null;

  const level = getLevelFromStars(stars);
  const nextLevel = getNextLevel(stars);
  const pct = getLevelProgress(stars);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(d => !d)}
        className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-all hover:scale-105"
        style={{ background: "linear-gradient(135deg,rgba(255,215,0,0.2),rgba(255,152,0,0.15))", border: "2px solid rgba(255,215,0,0.5)" }}>
        <span className="text-lg">{level.emoji}</span>
        <div className="hidden sm:block text-left">
          <p className="font-sans text-[10px] font-black leading-none" style={{ color: level.color }}>{level.nameHi}</p>
          <p className="font-sans text-[9px] text-gray-400 leading-none mt-0.5">{level.name}</p>
        </div>
        <div className="flex items-center gap-1 rounded-full px-2 py-0.5"
          style={{ background: "rgba(255,215,0,0.3)" }}>
          <span className="font-sans font-black text-xs text-amber-800" style={{ animation: starAnim ? "starPop 0.8s ease" : "none" }}>
            ⭐ {stars.toLocaleString()}
          </span>
        </div>
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 rounded-3xl overflow-hidden w-72 shadow-2xl"
            style={{ background: "white", border: "3px solid rgba(255,215,0,0.4)", animation: "popIn 0.2s ease" }}>
            {/* Level header */}
            <div className="p-4" style={{ background: `linear-gradient(135deg,${level.color}20,${level.color}10)` }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{level.emoji}</span>
                <div>
                  <p className="font-sans font-black text-base" style={{ color: level.color }}>{player.avatar} {player.name}</p>
                  <p className="font-display-hi text-sm font-black" style={{ color: level.color }}>{level.nameHi} · Level {level.level}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-display font-black text-2xl text-amber-700">⭐ {stars}</p>
                  <p className="font-sans text-[10px] text-gray-400">Karma Stars</p>
                </div>
              </div>
              {nextLevel && (
                <div>
                  <div className="flex justify-between text-[10px] font-sans mb-1">
                    <span className="text-gray-500">Next: {nextLevel.nameHi}</span>
                    <span className="font-bold" style={{ color: nextLevel.color }}>{nextLevel.min - stars} more needed</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${level.color},${nextLevel.color})` }} />
                  </div>
                </div>
              )}
            </div>
            {/* Quick links */}
            <div className="p-3 space-y-1.5">
              {[
                { href:"/academy/dashboard", emoji:"🎓", label:"My Academy Dashboard" },
                { href:"/academy/courses",   emoji:"📚", label:"Continue Learning" },
                { href:"/games",             emoji:"🎮", label:"Play Games" },
                { href:"/academy/leaderboard",emoji:"🏆", label:"Leaderboard" },
              ].map(item => (
                <Link key={item.href} href={item.href} onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-amber-50 transition-colors">
                  <span className="text-xl">{item.emoji}</span>
                  <span className="font-sans text-sm font-bold text-gray-700">{item.label}</span>
                </Link>
              ))}
              <hr className="border-gray-100"/>
              <Link href="/academy/login" onClick={() => setShowDropdown(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-purple-50 transition-colors">
                <span className="text-xl">🔐</span>
                <div>
                  <p className="font-sans text-sm font-bold text-purple-700">Sign In to Save Progress</p>
                  <p className="font-sans text-[10px] text-gray-400">Your stars will sync to your account</p>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
      <style>{`
        @keyframes starPop{0%{transform:scale(1)}50%{transform:scale(1.4)}100%{transform:scale(1)}}
        @keyframes popIn{0%{transform:scale(0.9) translateY(-8px);opacity:0}100%{transform:scale(1) translateY(0);opacity:1}}
      `}</style>
    </div>
  );
}
