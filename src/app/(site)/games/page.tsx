import type { Metadata } from "next";
import Link from "next/link";
import { GAMES } from "@/components/games/game-registry";

export const metadata: Metadata = {
  title: "Karma Kids World — Jain Games for Children",
  description: "12 fun Jain educational games! Karma Snakes & Ladders, Memory Quest, Daily Challenges and more. Ages 4–12.",
};

export const dynamic = "force-dynamic";

const DIFFICULTY = ["", "⭐ Easy", "⭐⭐ Medium", "⭐⭐⭐ Hard"];

export default function GamesPage() {
  const available = GAMES.filter(g => g.available);
  const coming = GAMES.filter(g => !g.available);

  return (
    <div className="min-h-screen pb-20" style={{ background: "linear-gradient(180deg,#050012 0%,#0a0025 40%,#060018 100%)" }}>
      {/* Hero */}
      <div className="text-center pt-16 pb-8 px-5 relative overflow-hidden">
        {/* Star field */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({length:60},(_,i)=>(
            <div key={i} style={{
              position:"absolute",
              left:`${(i*37)%100}%`,top:`${(i*23)%100}%`,
              width:i%5===0?3:i%3===0?2:1.5,height:i%5===0?3:i%3===0?2:1.5,
              borderRadius:"50%",background:`rgba(255,255,255,${0.4+((i*17)%6)*0.1})`,
              animation:`twinkle ${2+(i%4)*0.7}s ease-in-out infinite`,
              animationDelay:`${(i*0.23)%3}s`,
            }}/>
          ))}
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-5 py-1.5 mb-6">
            <span className="font-sans text-xs font-black tracking-widest text-yellow-300 uppercase">🎮 Karma Kids World</span>
          </div>
          <h1 className="font-display-hi text-4xl sm:text-6xl mb-3" style={{ color: "#FFD700", textShadow: "0 0 40px rgba(255,215,0,0.4)" }}>
            जैन गेम्स युनिवर्स
          </h1>
          <p className="font-sans text-xl font-bold mb-2" style={{ color: "rgba(255,215,0,0.8)" }}>
            Karma Kids World 🌟
          </p>
          <p className="font-hindi text-sm max-w-xl mx-auto mb-8" style={{ color: "rgba(200,180,255,0.6)" }}>
            खेलो, सीखो, बढ़ो! · 12 magical games teaching Jain values · Ages 4–12
          </p>

          {/* Stats bar */}
          <div className="inline-flex items-center gap-6 rounded-2xl px-6 py-3" style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)" }}>
            {[
              { icon: "🎮", val: "12", label: "Games" },
              { icon: "⭐", val: "∞", label: "Karma Points" },
              { icon: "🏆", val: "24+", label: "Badges" },
              { icon: "👧", val: "4–12", label: "Ages" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="font-sans text-xs" style={{ color: "rgba(255,215,0,0.5)" }}>{s.icon}</div>
                <div className="font-display text-lg font-bold" style={{ color: "#FFD700" }}>{s.val}</div>
                <div className="font-sans text-[10px]" style={{ color: "rgba(255,215,0,0.45)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5">
        {/* Available games */}
        <SectionTitle emoji="🎮" title="Play Now — Available Games" hi="अभी खेलें" count={available.length} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {available.map(g => <GameCard key={g.id} game={g} />)}
        </div>

        {/* Coming soon */}
        <SectionTitle emoji="🔜" title="Coming Soon" hi="जल्द आ रहे हैं" count={coming.length} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {coming.map(g => <ComingSoonCard key={g.id} game={g} />)}
        </div>
      </div>

      <style>{`
        @keyframes twinkle{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:1;transform:scale(1.5)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes pulseGlow{0%,100%{box-shadow:0 0 20px var(--gc)}50%{box-shadow:0 0 45px var(--gc),0 0 80px var(--gc)}}
      `}</style>
    </div>
  );
}

function SectionTitle({ emoji, title, hi, count }: { emoji:string; title:string; hi:string; count:number }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <div>
          <p className="font-sans text-base font-bold text-white/90">{title}</p>
          <p className="font-hindi text-xs" style={{ color: "rgba(200,180,255,0.5)" }}>{hi} · {count} games</p>
        </div>
      </div>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,rgba(255,215,0,0.3),transparent)" }} />
    </div>
  );
}

function GameCard({ game }: { game: typeof GAMES[0] }) {
  return (
    <Link href={`/games/${game.id}`}
      className="group block rounded-2xl overflow-hidden relative transition-transform duration-300 hover:-translate-y-2"
      style={{ background: game.bg, boxShadow: `0 4px 24px ${game.color}25, 0 0 0 1px ${game.color}30` }}>

      {/* Glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{ boxShadow: `inset 0 0 60px ${game.color}30` }} />

      {/* Top color bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg,${game.color},transparent)` }} />

      <div className="p-5">
        {/* Emoji + badge row */}
        <div className="flex items-start justify-between mb-3">
          <div className="text-5xl group-hover:scale-110 transition-transform duration-300 inline-block"
            style={{ filter: `drop-shadow(0 0 12px ${game.color})` }}>
            {game.emoji}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="font-sans text-[10px] rounded-full px-2 py-0.5 font-bold"
              style={{ background: `${game.color}30`, color: game.color, border: `1px solid ${game.color}50` }}>
              Ages {game.age}
            </span>
            <span className="font-sans text-[10px] rounded-full px-2 py-0.5"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
              {DIFFICULTY[game.difficulty]}
            </span>
          </div>
        </div>

        <h3 className="font-sans font-black text-lg mb-0.5 text-white leading-tight">{game.title}</h3>
        <p className="font-display-hi text-xs mb-3" style={{ color: game.color }}>{game.titleHi}</p>
        <p className="font-sans text-xs leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>{game.desc}</p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-sans text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${game.color}20`, color: game.color }}>
              🙏 {game.value}
            </span>
          </div>
          <div className="flex items-center gap-2 font-sans text-xs font-bold text-white/80 group-hover:text-white transition-colors">
            Play Now <span className="text-base">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ComingSoonCard({ game }: { game: typeof GAMES[0] }) {
  return (
    <div className="rounded-xl overflow-hidden relative opacity-70"
      style={{ background: game.bg, border: `1px solid ${game.color}25` }}>
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg,${game.color}50,transparent)` }} />
      <div className="p-4">
        <div className="text-3xl mb-2 grayscale">{game.emoji}</div>
        <p className="font-sans text-xs font-bold text-white/70 mb-0.5 leading-tight">{game.title}</p>
        <p className="font-sans text-[10px]" style={{ color: `${game.color}80` }}>{game.value}</p>
        <div className="mt-3 inline-flex items-center gap-1 font-sans text-[10px] rounded-full px-2 py-0.5"
          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
          🔜 {game.comingSoon}
        </div>
      </div>
    </div>
  );
}
