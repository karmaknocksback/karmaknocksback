import type { Metadata } from "next";
import Link from "next/link";
import SanyamHubClient from "@/components/sanyam/SanyamHubClient";

export const metadata: Metadata = {
  title: "Jain Sanyam Profile — Spiritual Journey Tracker | KarmaKnocksBack",
  description: "Track your Vrat, Tap, Tyag, Jaap, Yatra, Swadhyay & Daan. Jain calendar, anumodana, and leaderboards.",
};

const MODULES = [
  {cat:"vrat",     emoji:"🙏", label:"Vrat",     labelHi:"व्रत",        color:"#7C3AED", bg:"#F5F3FF", href:"/sanyam/vrat-db?cat=vrat"},
  {cat:"tap",      emoji:"🔥", label:"Tap",      labelHi:"तप",          color:"#DC2626", bg:"#FEF2F2", href:"/sanyam/vrat-db?cat=tap"},
  {cat:"tyag",     emoji:"🌿", label:"Tyag",     labelHi:"त्याग",       color:"#16A34A", bg:"#F0FDF4", href:"/sanyam/vrat-db?cat=tyag"},
  {cat:"jaap",     emoji:"📿", label:"Jaap",     labelHi:"जाप",         color:"#6D28D9", bg:"#EDE9FE", href:"/sanyam/vrat-db?cat=jaap"},
  {cat:"yatra",    emoji:"🏔", label:"Yatra",    labelHi:"यात्रा",      color:"#D97706", bg:"#FFFBEB", href:"/sanyam/vrat-db?cat=yatra"},
  {cat:"swadhyay", emoji:"📖", label:"Swadhyay", labelHi:"स्वाध्याय",  color:"#1D4ED8", bg:"#EFF6FF", href:"/sanyam/vrat-db?cat=swadhyay"},
  {cat:"daan",     emoji:"💝", label:"Daan",     labelHi:"दान",         color:"#0D9488", bg:"#F0FDFA", href:"/sanyam/vrat-db?cat=daan"},
  {cat:"calendar", emoji:"📅", label:"Calendar", labelHi:"पर्व कैलेंडर",color:"#D97706", bg:"#FFFBEB", href:"/calendar"},
];

export default function SanyamPage() {
  return (
    <div className="min-h-screen" style={{background:"#FAFAF5"}}>

      {/* ── HERO — dark gradient so white text is READABLE ── */}
      <div className="relative overflow-hidden" style={{background:"linear-gradient(135deg,#1a1a2e 0%,#2d1b4e 40%,#1a0c2e 100%)"}}>
        {/* Decorative orbs */}
        <div className="absolute top-10 left-20 w-48 h-48 rounded-full pointer-events-none" style={{background:"radial-gradient(circle,rgba(245,158,11,0.15),transparent 70%)"}}/>
        <div className="absolute bottom-5 right-16 w-64 h-64 rounded-full pointer-events-none" style={{background:"radial-gradient(circle,rgba(124,58,237,0.12),transparent 70%)"}}/>

        <div className="max-w-5xl mx-auto px-4 py-20 text-center relative z-10">
          <div className="text-6xl mb-5 animate-bounce-subtle">🕉️</div>
          {/* WHITE text is fine here - dark background */}
          <h1 className="font-sans font-black text-5xl text-white mb-3 leading-tight">
            Jain Sanyam Profile
          </h1>
          <p className="font-hindi text-xl text-amber-300 mb-2 font-bold">जीवनभर की आध्यात्मिक यात्रा</p>
          <p className="font-sans text-sm text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            A lifelong Jain spiritual journey tracker. Record your Vrat, Tap, Tyag, Jaap, Yatra, Swadhyay & Daan.
            Inspire others with 🙏 Anumodana. Earn Karma Stars. Build your spiritual legacy.
          </p>

          {/* 3 CTA buttons */}
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/sanyam/profile"
              className="px-8 py-4 rounded-2xl font-sans font-black text-base text-amber-900 shadow-2xl hover:scale-105 transition-all"
              style={{background:"linear-gradient(135deg,#FFD700,#F59E0B)",boxShadow:"0 8px 32px rgba(245,158,11,0.4)"}}>
              🧘 My Sanyam Profile
            </Link>
            <Link href="/sanyam/vrat-db"
              className="px-8 py-4 rounded-2xl font-sans font-black text-base text-white hover:bg-white/20 transition-colors"
              style={{border:"2px solid rgba(255,255,255,0.4)"}}>
              📚 Browse Practices
            </Link>
            <Link href="/calendar"
              className="px-8 py-4 rounded-2xl font-sans font-black text-base text-amber-300 hover:bg-amber-400/10 transition-colors"
              style={{border:"2px solid rgba(251,191,36,0.4)"}}>
              📅 Jain Calendar
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-8 justify-center mt-14">
            {[
              {n:"7",    l:"Spiritual Modules", emoji:"🕉️"},
              {n:"55+",  l:"Jain Vrats",        emoji:"🙏"},
              {n:"16",   l:"Badges to Earn",    emoji:"🏆"},
              {n:"Free", l:"Always Free",        emoji:"💝"},
            ].map(s=>(
              <div key={s.l} className="text-center">
                <p className="font-sans font-black text-2xl text-white">{s.n}</p>
                <p className="font-sans text-[10px] text-gray-400 mt-0.5">{s.emoji} {s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MODULE GRID — light bg, DARK text ── */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="font-sans text-xs font-black text-gray-400 uppercase tracking-widest text-center mb-5">
          7 Spiritual Modules
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {MODULES.map(m=>(
            <Link key={m.cat} href={m.href}
              className="rounded-2xl p-3 text-center hover:scale-105 hover:shadow-md transition-all bg-white"
              style={{border:`2px solid ${m.color}20`}}>
              <div className="text-3xl mb-1.5">{m.emoji}</div>
              <p className="font-sans font-black text-[11px]" style={{color:m.color}}>{m.label}</p>
              <p className="font-hindi text-[9px] text-gray-500">{m.labelHi}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── COMMUNITY FEED + POPULAR VRATS ── */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <SanyamHubClient />
      </div>

      {/* ── LEADERBOARD CTA — dark bg so text is readable ── */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <div className="rounded-3xl p-8 text-center"
          style={{background:"linear-gradient(135deg,#1a1a2e,#2d1b4e)",border:"1px solid rgba(245,158,11,0.2)"}}>
          <div className="text-4xl mb-3">🏆</div>
          <h3 className="font-sans font-black text-2xl text-white mb-2">Sanyam Leaderboards</h3>
          <p className="font-sans text-sm text-gray-300 mb-5">Separate rankings for Vrat, Tap, Tyag, Jaap, Yatra, Swadhyay & Daan</p>
          <Link href="/sanyam/leaderboard"
            className="inline-block px-8 py-3 rounded-2xl font-sans font-black text-sm text-amber-900"
            style={{background:"linear-gradient(135deg,#FFD700,#F59E0B)"}}>
            View All Leaderboards →
          </Link>
        </div>
      </div>
    </div>
  );
}
