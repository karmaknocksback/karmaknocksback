"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function AcademyNavClient() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      // Check localStorage first (fast)
      const lsToken = localStorage.getItem("academy_token");
      if (lsToken) {
        setIsLoggedIn(true);
        // Get user name from token endpoint
        try {
          const res = await fetch("/api/academy/auth/token", { credentials:"include" });
          const d = await res.json();
          if (d.user?.name) setUserName(d.user.name);
        } catch {}
      } else {
        // Check cookie (Google OAuth users)
        try {
          const res = await fetch("/api/academy/auth/token", { credentials:"include" });
          const d = await res.json();
          if (d.token) {
            localStorage.setItem("academy_token", d.token);
            setIsLoggedIn(true);
            if (d.user?.name) setUserName(d.user.name);
          }
        } catch {}
      }
      setChecking(false);
    }
    checkAuth();
  }, []);

  function signOut() {
    localStorage.removeItem("academy_token");
    // Also clear server cookie
    fetch("/api/academy/auth/logout", { method:"POST", credentials:"include" })
      .finally(() => window.location.href = "/academy");
  }

  return (
    <nav className="sticky top-0 z-40 border-b shadow-sm"
      style={{ background: "rgba(255,253,231,0.97)", backdropFilter:"blur(16px)", borderColor:"rgba(184,134,11,0.25)" }}>
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
        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/academy/courses"
            className="font-sans text-xs font-bold px-3 py-1.5 rounded-lg text-amber-800 hover:bg-amber-100 transition-colors">
            📚 Courses
          </Link>
          <Link href="/academy/leaderboard"
            className="font-sans text-xs font-bold px-3 py-1.5 rounded-lg text-amber-800 hover:bg-amber-100 transition-colors hidden sm:block">
            🏆 Ranks
          </Link>

          {checking ? (
            <div className="w-24 h-8 rounded-full bg-amber-100 animate-pulse"/>
          ) : isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link href="/academy/dashboard"
                className="font-sans text-xs font-black rounded-full px-4 py-1.5 text-amber-900 flex items-center gap-1.5 hover:opacity-90"
                style={{ background:"linear-gradient(135deg,#FFD700,#FF9800)", boxShadow:"0 2px 8px rgba(255,215,0,0.4)" }}>
                👤 {userName ? userName.split(" ")[0] : "My Account"}
              </Link>
              <button onClick={signOut}
                className="font-sans text-[10px] text-gray-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/academy/login"
                className="font-sans text-xs font-bold px-3 py-1.5 rounded-lg text-amber-800 hover:bg-amber-100">
                Sign In
              </Link>
              <Link href="/academy/register"
                className="font-sans text-xs font-black rounded-full px-4 py-1.5 text-amber-900 hover:opacity-90"
                style={{ background:"linear-gradient(135deg,#FFD700,#FF9800)", boxShadow:"0 2px 8px rgba(255,215,0,0.4)" }}>
                Join Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
