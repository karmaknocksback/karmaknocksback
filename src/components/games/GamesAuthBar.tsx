"use client";
import { useState } from "react";
import { usePlayer } from "@/context/PlayerContext";
import Link from "next/link";

const AVATARS = ["🧒","👦","👧","🧑","👨","👩","🧑‍🎓","👶","🧕","🧔"];

export default function GamesAuthBar() {
  const { player, setPlayer, clearPlayer, isReady } = usePlayer();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🧒");

  if (!isReady) return null;

  function save() {
    if (!name.trim()) return;
    setPlayer({ name: name.trim(), avatar });
    setShowModal(false);
  }

  // ── Signed-in bar ──────────────────────────────────────────────
  if (player) return (
    <div className="flex items-center justify-between w-full max-w-5xl mx-auto px-4 py-3 mb-4">
      <div className="flex items-center gap-3 rounded-2xl px-4 py-2.5 bg-white shadow-sm"
        style={{ border: "2px solid rgba(255,215,0,0.4)" }}>
        <span className="text-2xl">{player.avatar}</span>
        <div>
          <p className="font-sans font-black text-sm text-amber-900">{player.name}</p>
          <p className="font-sans text-[10px] text-gray-400">Playing as guest</p>
        </div>
        <Link href="/academy/dashboard"
          className="ml-2 rounded-full px-3 py-1 font-sans text-[10px] font-black text-amber-900 hover:bg-amber-100 transition-colors"
          style={{ background: "rgba(255,215,0,0.2)" }}>
          Academy ⭐
        </Link>
      </div>
      <div className="flex gap-2">
        <Link href="/academy/login"
          className="rounded-full px-4 py-2 font-sans text-xs font-black text-white"
          style={{ background: "linear-gradient(135deg,#4CAF50,#66BB6A)", boxShadow: "0 3px 10px rgba(76,175,80,0.4)" }}>
          🎓 Academy Login
        </Link>
        <button onClick={clearPlayer}
          className="rounded-full px-4 py-2 font-sans text-xs font-bold text-gray-500 bg-white border border-gray-200 hover:text-red-500">
          Switch User
        </button>
      </div>
    </div>
  );

  // ── Not signed in bar ──────────────────────────────────────────
  return (
    <>
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto px-4 py-3 mb-4">
        <div className="flex items-center gap-3 rounded-2xl px-4 py-2.5"
          style={{ background: "rgba(255,152,0,0.1)", border: "2px solid rgba(255,152,0,0.3)" }}>
          <span className="text-xl">👤</span>
          <div>
            <p className="font-sans font-black text-sm text-orange-800">Not signed in</p>
            <p className="font-sans text-[10px] text-orange-600">Sign in to track progress & earn stars</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowModal(true)}
            className="rounded-full px-5 py-2.5 font-sans font-black text-sm text-amber-900"
            style={{ background: "linear-gradient(135deg,#FFD700,#FF9800)", boxShadow: "0 4px 12px rgba(255,215,0,0.5)" }}>
            🎮 Play as Guest
          </button>
          <Link href="/academy/login"
            className="rounded-full px-5 py-2.5 font-sans font-black text-sm text-white"
            style={{ background: "linear-gradient(135deg,#9C27B0,#7B1FA2)" }}>
            🎓 Sign In
          </Link>
        </div>
      </div>

      {/* Quick name modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}>
          <div className="rounded-3xl overflow-hidden w-full max-w-sm"
            style={{ background: "white", border: "4px solid #FFD700", boxShadow: "0 24px 80px rgba(255,215,0,0.6)", animation: "popIn 0.3s ease" }}>
            <div className="px-6 pt-6 pb-4 text-center" style={{ background: "linear-gradient(135deg,#FFFDE7,#FFF9C4)" }}>
              <div className="text-5xl mb-2">🎮</div>
              <h2 className="font-sans font-black text-xl text-amber-900">Enter Your Name</h2>
              <p className="font-hindi text-sm text-amber-600 mt-1">अपना नाम दर्ज करें और खेलें!</p>
            </div>
            <div className="p-5">
              <p className="font-sans text-xs font-black text-gray-600 mb-2">Pick an avatar:</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {AVATARS.map(a => (
                  <button key={a} onClick={() => setAvatar(a)}
                    className="w-10 h-10 rounded-xl text-2xl flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: avatar === a ? "linear-gradient(135deg,#FFD700,#FF9800)" : "#F5F5F5", border: `2px solid ${avatar === a ? "#FF9800" : "transparent"}` }}>
                    {a}
                  </button>
                ))}
              </div>
              <input type="text" placeholder="Your name..." maxLength={20} value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && save()}
                className="w-full rounded-xl px-4 py-3 font-sans text-base border-2 outline-none focus:border-amber-400 mb-3"
                style={{ borderColor: "#E0E0E0" }} autoFocus />
              <button onClick={save} disabled={!name.trim()}
                className="w-full py-3.5 rounded-2xl font-sans font-black text-sm disabled:opacity-40 text-amber-900 mb-2"
                style={{ background: "linear-gradient(135deg,#FFD700,#FF9800)" }}>
                {avatar} Start Playing!
              </button>
              <div className="text-center">
                <p className="font-sans text-[10px] text-gray-400">— or —</p>
                <Link href="/academy/register"
                  className="font-sans text-xs font-bold text-purple-700 hover:underline mt-1 block">
                  Create Academy Account to save progress & earn stars ⭐
                </Link>
              </div>
              <button onClick={() => setShowModal(false)} className="mt-3 w-full py-2 rounded-xl font-sans text-xs text-gray-400 bg-gray-50">Cancel</button>
            </div>
          </div>
          <style>{`@keyframes popIn{0%{transform:scale(0.6);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
        </div>
      )}
    </>
  );
}
