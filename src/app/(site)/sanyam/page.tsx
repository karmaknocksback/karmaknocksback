import type { Metadata } from "next";
import Link from "next/link";
import SanyamHubClient from "@/components/sanyam/SanyamHubClient";

export const metadata: Metadata = {
  title: "Jain Sanyam Profile — Spiritual Journey Tracker | KarmaKnocksBack",
  description: "Track your Vrat, Tap, Tyag, Jaap, Yatra, Swadhyay & Daan. Jain calendar, anumodana, and leaderboards.",
};

const MODULES = [
  {cat:"vrat",     emoji:"🙏", label:"Vrat",     labelHi:"व्रत",      color:"#9C27B0", bg:"rgba(156,39,176,0.1)", desc:"Sacred vows",          href:"/sanyam/vrat-db?cat=vrat"},
  {cat:"tap",      emoji:"🔥", label:"Tap",      labelHi:"तप",        color:"#FF5722", bg:"rgba(255,87,34,0.1)",  desc:"Austerities",          href:"/sanyam/vrat-db?cat=tap"},
  {cat:"tyag",     emoji:"🌿", label:"Tyag",     labelHi:"त्याग",     color:"#4CAF50", bg:"rgba(76,175,80,0.1)",  desc:"Renunciations",        href:"/sanyam/vrat-db?cat=tyag"},
  {cat:"jaap",     emoji:"📿", label:"Jaap",     labelHi:"जाप",       color:"#7B1FA2", bg:"rgba(123,31,162,0.1)", desc:"Mantra recitation",    href:"/sanyam/vrat-db?cat=jaap"},
  {cat:"yatra",    emoji:"🏔", label:"Yatra",    labelHi:"यात्रा",    color:"#FF8F00", bg:"rgba(255,143,0,0.1)",  desc:"Pilgrimages",          href:"/sanyam/vrat-db?cat=yatra"},
  {cat:"swadhyay", emoji:"📖", label:"Swadhyay", labelHi:"स्वाध्याय",color:"#1565C0", bg:"rgba(21,101,192,0.1)", desc:"Scriptural study",     href:"/sanyam/vrat-db?cat=swadhyay"},
  {cat:"daan",     emoji:"💝", label:"Daan",     labelHi:"दान",       color:"#00897B", bg:"rgba(0,137,123,0.1)",  desc:"Charity & service",    href:"/sanyam/vrat-db?cat=daan"},
  {cat:"calendar", emoji:"📅", label:"Calendar", labelHi:"पर्व कैलेंडर",color:"#FF9800",bg:"rgba(255,152,0,0.1)",desc:"Jain festival dates",  href:"/sanyam/calendar"},
];

export default function SanyamPage() {
  return (
    <div className="min-h-screen" style={{background:"linear-gradient(160deg,#0d0d0d 0%,#1a0800 40%,#0d0d1a 100%)"}}>

      {/* ── HERO ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03]"
            style={{backgroundImage:"radial-gradient(circle at 20% 50%, #FFD700 0%, transparent 50%), radial-gradient(circle at 80% 20%, #FF9800 0%, transparent 50%)"}}/>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-20 text-center relative z-10">
          <div className="text-6xl mb-4">🕉️</div>
          <h1 className="font-sans font-black text-4xl sm:text-5xl text-white mb-3">
            Jain Sanyam Profile
          </h1>
          <p className="font-hindi text-lg text-amber-400 mb-2">जीवनभर की आध्यात्मिक यात्रा</p>
          <p className="font-sans text-sm text-gray-400 max-w-2xl mx-auto mb-10">
            A lifelong Jain spiritual journey tracker. Record your Vrat, Tap, Tyag, Jaap, Yatra, Swadhyay & Daan.
            Inspire others with 🙏 Anumodana. Earn Karma Stars. Build your spiritual legacy.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/sanyam/profile"
              className="px-8 py-4 rounded-2xl font-sans font-black text-sm text-amber-900"
              style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",boxShadow:"0 8px 32px rgba(255,215,0,0.4)"}}>
              🧘 My Sanyam Profile
            </Link>
            <Link href="/sanyam/vrat-db"
              className="px-8 py-4 rounded-2xl font-sans font-black text-sm text-white border border-white/20 hover:bg-white/10 transition-colors">
              📚 Browse Practices
            </Link>
            <Link href="/sanyam/calendar"
              className="px-8 py-4 rounded-2xl font-sans font-black text-sm text-amber-400 border border-amber-700/40 hover:bg-amber-900/20 transition-colors">
              📅 Jain Calendar
            </Link>
          </div>
        </div>
      </div>

      {/* ── MODULE GRID ── */}
      <div className="max-w-5xl mx-auto px-4 pb-6">
        <p className="font-sans text-xs text-white/30 uppercase tracking-widest text-center mb-4">7 Spiritual Modules</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {MODULES.map(m=>(
            <Link key={m.cat} href={m.href}
              className="rounded-2xl p-3.5 text-center hover:scale-105 transition-all"
              style={{background:m.bg,border:`1.5px solid ${m.color}20`}}>
              <div className="text-3xl mb-1.5">{m.emoji}</div>
              <p className="font-sans font-black text-[11px]" style={{color:m.color}}>{m.label}</p>
              <p className="font-hindi text-[9px] text-gray-500">{m.labelHi}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── COMMUNITY + FEED ── */}
      <div className="max-w-5xl mx-auto px-4 py-8 pb-20">
        <SanyamHubClient />

        {/* Leaderboard CTA */}
        <div className="mt-10 rounded-3xl p-8 text-center"
          style={{background:"rgba(255,215,0,0.05)",border:"1.5px solid rgba(255,215,0,0.15)"}}>
          <div className="text-4xl mb-3">🏆</div>
          <h3 className="font-sans font-black text-xl text-white mb-1">Sanyam Leaderboards</h3>
          <p className="font-sans text-sm text-gray-400 mb-4">Separate rankings for Vrat, Tap, Tyag, Jaap, Yatra, Swadhyay & Daan</p>
          <Link href="/sanyam/leaderboard"
            className="inline-block px-8 py-3 rounded-2xl font-sans font-black text-sm text-amber-900"
            style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>
            View All Leaderboards →
          </Link>
        </div>
      </div>
    </div>
  );
}
