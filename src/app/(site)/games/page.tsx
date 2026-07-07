import type { Metadata } from "next";
import Link from "next/link";
import { GAMES } from "@/components/games/game-registry";

export const metadata: Metadata = {
  title: "Karma Kids World — Jain Games for Children",
  description: "12 fun Jain educational games for kids! Ages 4–12.",
};

const DIFFICULTY_LABEL = ["", "⭐ Easy", "⭐⭐ Medium", "⭐⭐⭐ Hard"];

export default function GamesPage() {
  const available = GAMES.filter(g => g.available);
  const coming    = GAMES.filter(g => !g.available);

  return (
    <div className="min-h-screen pb-20"
      style={{ background: "linear-gradient(160deg,#FFF9C4 0%,#E1F5FE 35%,#F8BBD9 70%,#DCEDC8 100%)" }}>

      {/* Floating bubbles decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {["#FFD700","#FF80AB","#80D8FF","#B9F6CA","#FF6D00","#EA80FC"].map((c,i)=>(
          <div key={i} style={{
            position:"absolute", borderRadius:"50%",
            width: 60+i*30, height: 60+i*30,
            background: c, opacity: 0.12,
            left:`${[8,72,20,85,45,60][i]}%`,
            top:`${[10,5,60,40,80,25][i]}%`,
            animation:`float ${4+i}s ease-in-out infinite`,
            animationDelay:`${i*0.8}s`,
          }}/>
        ))}
      </div>

      {/* Hero */}
      <div className="relative z-10 text-center pt-14 pb-8 px-5">
        <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-5 font-sans text-xs font-black tracking-widest uppercase"
          style={{ background:"#FFD700", color:"#7B3F00", boxShadow:"0 4px 16px rgba(255,215,0,0.5)" }}>
          🎮 Karma Kids World
        </div>

        <h1 className="font-display-hi mb-3"
          style={{ fontSize:"clamp(2rem,6vw,3.5rem)", color:"#E65100",
            textShadow:"3px 3px 0px #FFD700, 5px 5px 0px rgba(230,81,0,0.2)" }}>
          जैन गेम्स युनिवर्स
        </h1>
        <p className="font-sans text-xl font-black mb-1" style={{ color:"#6A1B9A" }}>
          Karma Kids World! 🌈
        </p>
        <p className="font-hindi text-sm max-w-lg mx-auto mb-8" style={{ color:"#0277BD" }}>
          खेलो, सीखो, बढ़ो! · 12 magical games · Ages 4–12
        </p>

        {/* Stats bar */}
        <div className="inline-flex items-center gap-6 rounded-3xl px-8 py-4"
          style={{ background:"white", boxShadow:"0 8px 32px rgba(0,0,0,0.12)" }}>
          {[
            { icon:"🎮", val:"12", label:"Games" },
            { icon:"⭐", val:"∞",  label:"Stars" },
            { icon:"🏆", val:"24+",label:"Badges" },
            { icon:"👧", val:"4–12",label:"Ages" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-xl">{s.icon}</div>
              <div className="font-display text-xl font-black" style={{ color:"#E65100" }}>{s.val}</div>
              <div className="font-sans text-[10px] font-bold" style={{ color:"#888" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5">
        {/* Available games */}
        <SectionTitle emoji="🎮" title="Play Now!" hi="अभी खेलें" count={available.length} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {available.map(g => <GameCard key={g.id} game={g} />)}
        </div>

        {/* Coming soon */}
        {coming.length > 0 && (
          <>
            <SectionTitle emoji="🔜" title="Coming Soon" hi="जल्द आ रहे हैं" count={coming.length} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {coming.map(g => <ComingSoonCard key={g.id} game={g} />)}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes float{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-18px) rotate(5deg)}}
      `}</style>
    </div>
  );
}

const BRIGHT_CARDS: Record<string,{bg:string;border:string;text:string;badge:string}> = {
  "snakes-ladders":{ bg:"linear-gradient(135deg,#F1F8E9,#DCEDC8)", border:"#66BB6A", text:"#1B5E20", badge:"#4CAF50" },
  "memory-quest":  { bg:"linear-gradient(135deg,#F3E5F5,#E1BEE7)", border:"#AB47BC", text:"#4A148C", badge:"#9C27B0" },
  "daily-karma":   { bg:"linear-gradient(135deg,#FFF3E0,#FFE0B2)", border:"#FF9800", text:"#E65100", badge:"#FF9800" },
  "tiny-rescue":   { bg:"linear-gradient(135deg,#E0F7FA,#B2EBF2)", border:"#00BCD4", text:"#006064", badge:"#00BCD4" },
  "karma-garden":  { bg:"linear-gradient(135deg,#FCE4EC,#F8BBD9)", border:"#E91E63", text:"#880E4F", badge:"#E91E63" },
  "karma-forest":  { bg:"linear-gradient(135deg,#E8F5E9,#C8E6C9)", border:"#4CAF50", text:"#1B5E20", badge:"#388E3C" },
  "temptation-run":{ bg:"linear-gradient(135deg,#FFF8E1,#FFECB3)", border:"#FFC107", text:"#E65100", badge:"#FF9800" },
  "temple-builder":{ bg:"linear-gradient(135deg,#FFFDE7,#FFF9C4)", border:"#F9A825", text:"#4E342E", badge:"#F57F17" },
  "jain-stories":  { bg:"linear-gradient(135deg,#FFF3E0,#FFE0B2)", border:"#FF7043", text:"#BF360C", badge:"#FF5722" },
  "aparigraha":    { bg:"linear-gradient(135deg,#EFEBE9,#D7CCC8)", border:"#8D6E63", text:"#3E2723", badge:"#795548" },
  "compassion-city":{ bg:"linear-gradient(135deg,#E3F2FD,#BBDEFB)", border:"#2196F3", text:"#0D47A1", badge:"#1976D2" },
  "karma-ludo":    { bg:"linear-gradient(135deg,#EDE7F6,#D1C4E9)", border:"#7C4DFF", text:"#311B92", badge:"#7B1FA2" },
};

function GameCard({ game }: { game: typeof GAMES[0] }) {
  const theme = BRIGHT_CARDS[game.id] || { bg:"linear-gradient(135deg,#f5f5f5,#eeeeee)", border:"#999", text:"#333", badge:"#666" };
  return (
    <Link href={`/games/${game.id}`} prefetch={true}
      className="group block rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-3 hover:rotate-1"
      style={{ background:theme.bg, border:`3px solid ${theme.border}`,
        boxShadow:`0 8px 24px ${theme.border}30, 0 2px 8px rgba(0,0,0,0.08)` }}>

      <div className="p-5">
        {/* Emoji big */}
        <div className="flex items-start justify-between mb-3">
          <div className="text-5xl group-hover:scale-125 transition-transform duration-300 drop-shadow-md">
            {game.emoji}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="font-sans text-[10px] font-black rounded-full px-3 py-1"
              style={{ background:theme.badge, color:"white" }}>
              Ages {game.age}
            </span>
            <span className="font-sans text-[10px] rounded-full px-2 py-0.5 font-bold"
              style={{ background:"white", color:theme.text, border:`1px solid ${theme.border}` }}>
              {DIFFICULTY_LABEL[game.difficulty]}
            </span>
          </div>
        </div>

        <h3 className="font-sans font-black text-lg mb-0.5 leading-tight" style={{ color:theme.text }}>{game.title}</h3>
        <p className="font-display-hi text-xs mb-2 font-bold" style={{ color:theme.badge }}>{game.titleHi}</p>
        <p className="font-sans text-xs leading-relaxed mb-4" style={{ color:theme.text, opacity:0.75 }}>{game.desc}</p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="font-sans text-[10px] font-black rounded-full px-2.5 py-1"
            style={{ background:theme.badge+"20", color:theme.badge, border:`1px solid ${theme.badge}60` }}>
            🙏 {game.value}
          </span>
          <div className="flex items-center gap-1.5 font-sans text-xs font-black" style={{ color:theme.badge }}>
            Play Now →
          </div>
        </div>
      </div>

      {/* Bottom color strip */}
      <div className="h-2" style={{ background:`linear-gradient(90deg,${theme.badge},${theme.border})` }}/>
    </Link>
  );
}

function ComingSoonCard({ game }: { game: typeof GAMES[0] }) {
  const theme = BRIGHT_CARDS[game.id] || { bg:"#f5f5f5", border:"#ccc", text:"#666", badge:"#999" };
  return (
    <div className="rounded-2xl overflow-hidden opacity-60"
      style={{ background:theme.bg, border:`2px solid ${theme.border}50` }}>
      <div className="p-4">
        <div className="text-3xl mb-2 grayscale">{game.emoji}</div>
        <p className="font-sans text-xs font-black leading-tight mb-1" style={{ color:theme.text }}>{game.title}</p>
        <p className="font-sans text-[10px]" style={{ color:theme.badge }}>{game.value}</p>
        <div className="mt-2 inline-flex items-center gap-1 font-sans text-[9px] rounded-full px-2 py-0.5 font-bold"
          style={{ background:"rgba(0,0,0,0.06)", color:"#888" }}>
          🔜 Coming Soon
        </div>
      </div>
      <div className="h-1.5" style={{ background:`linear-gradient(90deg,${theme.badge}50,transparent)` }}/>
    </div>
  );
}

function SectionTitle({ emoji,title,hi,count }:{emoji:string;title:string;hi:string;count:number}) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{emoji}</span>
        <div>
          <p className="font-sans text-lg font-black" style={{ color:"#4A148C" }}>{title}</p>
          <p className="font-hindi text-xs" style={{ color:"#7B1FA2" }}>{hi} · {count} games</p>
        </div>
      </div>
      <div className="flex-1 h-1 rounded-full" style={{ background:"linear-gradient(90deg,#E91E6340,transparent)" }}/>
    </div>
  );
}
