import type { Metadata } from "next";
import Link from "next/link";
import SanyamHubClient from "@/components/sanyam/SanyamHubClient";

export const metadata: Metadata = {
  title: "Jain Sanyam Profile — Live Your Spiritual Journey | KarmaKnocksBack",
  description: "Track your Vrat, Tap, Tyag, Jaap, Yatra, Swadhyay, and Daan. Earn Karma Stars. Inspire others with Anumodana.",
};

const CATEGORIES = [
  {cat:"calendar", emoji:"📅", label:"Calendar",   hi:"पर्व कैलेंडर", color:"#FF9800", desc:"Jain festival dates"},
  {cat:"vrat",     emoji:"🙏", label:"Vrat",      hi:"व्रत",      color:"#9C27B0", desc:"Sacred vows & observances"},
  {cat:"tap",      emoji:"🔥", label:"Tap",       hi:"तप",         color:"#FF5722", desc:"Austerities & fasting"},
  {cat:"tyag",     emoji:"🌿", label:"Tyag",      hi:"त्याग",     color:"#4CAF50", desc:"Renunciations & givings up"},
  {cat:"jaap",     emoji:"📿", label:"Jaap",      hi:"जाप",        color:"#7B1FA2", desc:"Mantra recitation"},
  {cat:"yatra",    emoji:"🏔", label:"Yatra",     hi:"यात्रा",    color:"#FF8F00", desc:"Sacred pilgrimages"},
  {cat:"swadhyay", emoji:"📖", label:"Swadhyay",  hi:"स्वाध्याय", color:"#1565C0", desc:"Scriptural study"},
  {cat:"daan",     emoji:"💝", label:"Daan",      hi:"दान",         color:"#00897B", desc:"Charity & service"},
];

export default function SanyamPage() {
  return (
    <div className="min-h-screen" style={{background:"linear-gradient(160deg,#FFFDE7 0%,#F3E5F5 40%,#E8F5E9 100%)"}}>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{background:"linear-gradient(135deg,#1a0800,#3E1F00,#1a1a2e)"}}>
        <div className="absolute inset-0 opacity-5">
          <div className="text-9xl text-center mt-8 select-none">🕉️</div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center relative z-10">
          <p className="font-hindi text-amber-400 text-sm font-bold mb-3 tracking-widest">जैन संयम प्रोफाइल</p>
          <h1 className="font-sans font-black text-3xl sm:text-4xl text-white mb-3">
            Live Your Sanyam.<br/>Inspire Others.
          </h1>
          <p className="font-sans text-amber-200 text-sm sm:text-base max-w-2xl mx-auto mb-8">
            Track your Vrat, Tap, Tyag, Jaap, Yatra, Swadhyay & Daan. Earn Karma Stars. 
            Share your journey with 🙏 Anumodana.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/sanyam/profile"
              className="px-8 py-3.5 rounded-full font-sans font-black text-sm text-amber-900"
              style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",boxShadow:"0 6px 24px rgba(255,215,0,0.4)"}}>
              🧘 My Sanyam Profile
            </Link>
            <Link href="/sanyam/feed"
              className="px-8 py-3.5 rounded-full font-sans font-black text-sm text-white border-2 border-white/30 hover:bg-white/10 transition-colors">
              🙏 Activity Feed
            </Link>
            <Link href="/sanyam/calendar"
              className="px-8 py-3.5 rounded-full font-sans font-black text-sm text-white border-2 border-white/30 hover:bg-white/10 transition-colors">
              📅 Jain Calendar
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 pb-20">
        {/* Categories */}
        <div className="mb-10">
          <h2 className="font-sans font-black text-xl text-gray-800 mb-5 text-center">
            Start Your Spiritual Journey
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {CATEGORIES.map(c=>(
              <Link key={c.cat} href={c.cat==="calendar"?"/sanyam/calendar":`/sanyam/category/${c.cat}`}
                className="rounded-2xl p-4 text-center hover:-translate-y-1 transition-all"
                style={{background:"white",border:`2px solid ${c.color}30`,boxShadow:`0 4px 16px ${c.color}20`}}>
                <div className="text-3xl mb-1.5">{c.emoji}</div>
                <p className="font-sans font-black text-xs" style={{color:c.color}}>{c.label}</p>
                <p className="font-hindi text-[10px] text-gray-400">{c.hi}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick start + feed preview */}
        <SanyamHubClient />

        {/* Leaderboard preview */}
        <div className="mt-10 text-center">
          <Link href="/sanyam/leaderboard"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-sans font-black text-sm"
            style={{background:"linear-gradient(135deg,#7C4DFF,#E91E63)",color:"white"}}>
            🏆 View Leaderboards →
          </Link>
        </div>
      </div>
    </div>
  );
}
