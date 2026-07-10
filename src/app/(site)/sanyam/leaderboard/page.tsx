"use client";
import { useState, useEffect } from "react";

interface Leader {
  display_name:string; avatar:string; spiritual_score?:number;
  days?:number; stars?:number; count?:number;
  received?:number; total_activities?:number;
}

const BOARDS = [
  {id:"overall",   label:"Overall Sanyam", emoji:"🏆", color:"#FFD700"},
  {id:"vrat",      label:"Vrat",           emoji:"🙏", color:"#9C27B0"},
  {id:"tap",       label:"Tap",            emoji:"🔥", color:"#FF5722"},
  {id:"tyag",      label:"Tyag",           emoji:"🌿", color:"#4CAF50"},
  {id:"jaap",      label:"Jaap",           emoji:"📿", color:"#7B1FA2"},
  {id:"yatra",     label:"Yatra",          emoji:"🏔", color:"#FF8F00"},
  {id:"swadhyay",  label:"Swadhyay",       emoji:"📖", color:"#1565C0"},
  {id:"daan",      label:"Daan",           emoji:"💝", color:"#00897B"},
  {id:"anumodana", label:"Anumodana",      emoji:"🙏", color:"#E91E63"},
];

const MEDALS = [
  {bg:"linear-gradient(135deg,#FFD700,#FF9800)",text:"#1a0800",label:"🥇"},
  {bg:"linear-gradient(135deg,#C0C0C0,#90A4AE)",text:"#1a0800",label:"🥈"},
  {bg:"linear-gradient(135deg,#CD7F32,#A1887F)",text:"white",label:"🥉"},
];

export default function SanyamLeaderboardPage() {
  const [type, setType]       = useState("overall");
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const board = BOARDS.find(b=>b.id===type)||BOARDS[0];

  useEffect(()=>{
    setLoading(true);
    fetch(`/api/sanyam/leaderboard?type=${type}`)
      .then(r=>r.json())
      .then(d=>{ setLeaders(d.leaders||[]); setLoading(false); });
  },[type]);

  return (
    <div className="min-h-screen" style={{background:"linear-gradient(160deg,#0d0d0d 0%,#1a0800 40%,#0d0d1a 100%)"}}>
      <div className="max-w-3xl mx-auto px-4 py-10 pb-20">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="font-sans font-black text-2xl text-white mb-1">Sanyam Leaderboards</h1>
          <p className="font-hindi text-sm text-amber-400 mb-1">आध्यात्मिक साधना का सम्मान</p>
          <p className="font-sans text-xs text-gray-500">Ranked by spiritual practice, not wealth or popularity</p>
        </div>

        {/* Board selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none justify-center flex-wrap">
          {BOARDS.map(b=>(
            <button key={b.id} onClick={()=>setType(b.id)}
              className="shrink-0 rounded-full px-4 py-2 font-sans font-black text-xs transition-all hover:scale-105"
              style={{
                background:type===b.id?`${b.color}20`:"rgba(255,255,255,0.04)",
                color:type===b.id?b.color:"rgba(255,255,255,0.4)",
                border:`1.5px solid ${type===b.id?b.color+"40":"rgba(255,255,255,0.08)"}`,
              }}>
              {b.emoji} {b.label}
            </button>
          ))}
        </div>

        {/* Active board header */}
        <div className="rounded-2xl p-4 mb-5 flex items-center gap-3"
          style={{background:`${board.color}10`,border:`1.5px solid ${board.color}25`}}>
          <span className="text-4xl">{board.emoji}</span>
          <div>
            <p className="font-sans font-black text-base" style={{color:board.color}}>{board.label} Leaderboard</p>
            <p className="font-sans text-xs text-gray-500">Top spiritual practitioners</p>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i=>(
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{background:"rgba(255,255,255,0.04)"}}/>
            ))}
          </div>
        ) : leaders.length===0 ? (
          <div className="rounded-2xl p-12 text-center" style={{border:"2px dashed rgba(255,255,255,0.07)"}}>
            <div className="text-5xl mb-4">{board.emoji}</div>
            <p className="font-sans text-white/40 mb-2">No entries yet</p>
            <p className="font-sans text-xs text-gray-600 mb-4">Start practicing to appear on this leaderboard</p>
            <a href="/sanyam/vrat-db"
              className="inline-block px-6 py-2.5 rounded-full font-sans font-black text-xs text-white"
              style={{background:`linear-gradient(135deg,${board.color},${board.color}99)`}}>
              Start a Practice →
            </a>
          </div>
        ) : (
          <div className="space-y-2.5">
            {leaders.map((l,i)=>(
              <div key={i} className="flex items-center gap-4 rounded-2xl p-4 transition-all hover:scale-[1.01]"
                style={{
                  background: i<3 ? `${board.color}08` : "rgba(255,255,255,0.03)",
                  border: i<3 ? `1.5px solid ${board.color}25` : "1px solid rgba(255,255,255,0.05)",
                }}>
                {/* Rank */}
                {i<3 ? (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                    style={{background:MEDALS[i].bg,color:MEDALS[i].text}}>
                    {MEDALS[i].label}
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-sans font-black text-sm text-white/30 shrink-0"
                    style={{background:"rgba(255,255,255,0.04)"}}>
                    {i+1}
                  </div>
                )}

                {/* Avatar */}
                <div className="text-3xl shrink-0">{l.avatar||"🧘"}</div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-black text-sm text-white truncate">{l.display_name}</p>
                  <div className="flex gap-3 mt-0.5 flex-wrap">
                    {l.spiritual_score!==undefined && (
                      <span className="font-sans text-[10px] text-amber-400 font-bold">⭐ {l.spiritual_score.toLocaleString()} pts</span>
                    )}
                    {l.days!==undefined && (
                      <span className="font-sans text-[10px] font-bold" style={{color:board.color}}>🔥 {l.days} days</span>
                    )}
                    {l.total_activities!==undefined && (
                      <span className="font-sans text-[10px] text-gray-500">{l.total_activities} practices</span>
                    )}
                    {l.received!==undefined && (
                      <span className="font-sans text-[10px] text-orange-400 font-bold">🙏 {l.received} anumodana</span>
                    )}
                  </div>
                </div>

                {/* Score badge for top 3 */}
                {i<3 && (
                  <div className="shrink-0 rounded-xl px-3 py-1.5 text-center"
                    style={{background:`${board.color}15`,border:`1px solid ${board.color}30`}}>
                    <p className="font-display font-black text-sm" style={{color:board.color}}>
                      {l.spiritual_score||l.days||l.received||0}
                    </p>
                    <p className="font-sans text-[8px] text-gray-500">points</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Honor note */}
        <div className="mt-8 rounded-2xl p-5 text-center"
          style={{background:"rgba(255,215,0,0.03)",border:"1px dashed rgba(255,215,0,0.15)"}}>
          <p className="font-hindi text-xs text-amber-600 mb-1">
            यह लीडरबोर्ड स्व-घोषित साधना पर आधारित है।
          </p>
          <p className="font-sans text-[10px] text-gray-600">
            Honor-based system — the goal is self-improvement and inspiration, not competition.
          </p>
        </div>
      </div>
    </div>
  );
}
