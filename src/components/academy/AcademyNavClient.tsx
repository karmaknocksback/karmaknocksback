"use client";
import Link from "next/link";
import { useState } from "react";

export default function AcademyNavClient() {
  const [token] = useState(() => typeof window !== "undefined" ? localStorage.getItem("academy_token") : null);
  const isLoggedIn = !!token;

  return (
    <nav className="sticky top-0 z-40 border-b shadow-sm"
      style={{ background: "rgba(255,253,231,0.96)", backdropFilter: "blur(16px)", borderColor: "rgba(184,134,11,0.25)" }}>
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/academy" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">📿</span>
          <div className="hidden sm:block">
            <p className="font-sans font-black text-sm text-amber-900 leading-none">Jain Academy</p>
            <p className="font-hindi text-[10px] text-amber-600">जैन शिक्षा केन्द्र</p>
          </div>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1 sm:gap-3">
          <Link href="/academy/courses"
            className="font-sans text-xs font-bold px-3 py-1.5 rounded-lg text-amber-800 hover:bg-amber-100 transition-colors">
            📚 Courses
          </Link>
          <Link href="/academy/leaderboard"
            className="font-sans text-xs font-bold px-3 py-1.5 rounded-lg text-amber-800 hover:bg-amber-100 transition-colors hidden sm:block">
            🏆 Leaderboard
          </Link>

          {isLoggedIn ? (
            <Link href="/academy/dashboard"
              className="font-sans text-xs font-black rounded-full px-4 py-1.5 text-amber-900 flex items-center gap-1.5"
              style={{ background: "linear-gradient(135deg,#FFD700,#FF9800)", boxShadow: "0 2px 8px rgba(255,215,0,0.4)" }}>
              👤 My Account
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/academy/login"
                className="font-sans text-xs font-bold px-3 py-1.5 rounded-lg text-amber-800 hover:bg-amber-100">
                Sign In
              </Link>
              <Link href="/academy/register"
                className="font-sans text-xs font-black rounded-full px-4 py-1.5 text-amber-900"
                style={{ background: "linear-gradient(135deg,#FFD700,#FF9800)", boxShadow: "0 2px 8px rgba(255,215,0,0.4)" }}>
                Join Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
