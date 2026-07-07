import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Jain Learning Academy | KarmaKnocksBack",
  description: "Learn Jain philosophy, earn stars, get certified. Watch videos, take quizzes, and grow spiritually.",
};

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#FFFDE7 0%,#FFF9C4 30%,#F3E5F5 100%)" }}>
      {/* Academy nav bar */}
      <nav className="sticky top-0 z-40 border-b" style={{ background: "rgba(255,253,231,0.92)", backdropFilter: "blur(12px)", borderColor: "rgba(184,134,11,0.2)" }}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/academy" className="flex items-center gap-2">
            <span className="text-2xl">📿</span>
            <div>
              <p className="font-sans font-black text-sm text-amber-900 leading-none">Jain Academy</p>
              <p className="font-hindi text-[10px] text-amber-600">जैन शिक्षा केन्द्र</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/academy/courses" className="font-sans text-xs font-bold text-amber-800 hover:text-amber-600 hidden sm:block">Courses</Link>
            <Link href="/academy/leaderboard" className="font-sans text-xs font-bold text-amber-800 hover:text-amber-600 hidden sm:block">🏆 Leaderboard</Link>
            <Link href="/academy/dashboard" className="font-sans text-xs font-bold text-amber-800 hover:text-amber-600 hidden sm:block">Dashboard</Link>
            <Link href="/academy/login"
              className="font-sans text-xs font-black rounded-full px-4 py-1.5 text-amber-900"
              style={{ background: "linear-gradient(135deg,#FFD700,#FF9800)", boxShadow: "0 2px 8px rgba(255,215,0,0.4)" }}>
              Sign In
            </Link>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
