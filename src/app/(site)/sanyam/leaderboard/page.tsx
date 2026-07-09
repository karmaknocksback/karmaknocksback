"use client";
import { useState, useEffect } from "react";

interface Leader {
  display_name:string; avatar:string; spiritual_score?:number;
  total_activities?:number; days?:number; stars?:number;
  received?:number; given?:number; count?:number;
}

const BOARDS = [
  {id:"overall",  label:"Overall",   emoji:"🏆"},
  {id:"vrat",     label:"Vrat",      emoji:"🙏"},
  {id:"tap",      label:"Tap",       emoji:"🔥"},
  {id:"tyag",     label:"Tyag",      emoji:"🌿"},
  {id:"jaap",     label:"Jaap",      emoji:"📿"},
  {id:"yatra",    label:"Yatra",     emoji:"🏔"},
  {id:"anumodana",label:"Anumodana", emoji:"🙏"},
];
const MEDALS = ["🥇","🥈","🥉"];

export default function SanyamLeaderboardPage() {
  const [type, setType] = useState("overall");
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    setLoading(true);
    fetch(`/api/sanyam/leaderboard?type=${type}`).then(r=>r.json())
      .then(d=>{setLeaders(d.leaders||[]);setLoading(false);});
  },[type]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-20">
      <div className="text-center mb-8">
        <h1 className="font-sans font-black text-2xl text-gray-800 mb-1">🏆 Sanyam Leaderboards</h1>
        <p className="font-hindi text-sm text-gray-500">साधना में आगे बढ़ने वाले जैन साधकों की सूची</p>
        <p className="font-sans text-xs text-amber-600 mt-2 font-bold">
          ✨ Ranked by spiritual practice — not wealth or popularity
        </p>
      </div>

      {/* Board tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none justify-center flex-wrap">
        {BOARDS.map(b=>(
          <button key={b.id} onClick={()=>setType(b.id)}
            className="shrink-0 rounded-full px-4 py-2 font-sans font-black text-xs transition-all"
            style={{
              background:type===b.id?"linear-gradient(135deg,#FFD700,#FF9800)":"rgba(255,215,0,0.1)",
              color:type===b.id?"#1a0800":"#795548",
              border:`1.5px solid ${type===b.id?"transparent":"rgba(255,152,0,0.3)"}`,
            }}>
            {b.emoji} {b.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i=><div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse"/>)}
        </div>
      ) : leaders.length===0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🌸</div>
          <p className="font-sans text-gray-400">No entries yet. Start practicing to appear here!</p>
          <a href="/sanyam/vrat-db" className="inline-block mt-4 px-6 py-2.5 rounded-full font-sans font-black text-sm text-white"
            style={{background:"linear-gradient(135deg,#9C27B0,#7B1FA2)"}}>Start a Practice →</a>
        </div>
      ) : (
        <div className="space-y-3">
          {leaders.map((l,i)=>(
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4"
              style={{border:i<3?`2px solid ${["#FFD700","#C0C0C0","#CD7F32"][i]}40`:"1px solid #f0f0f0"}}>
              <div className="text-2xl w-10 text-center shrink-0">{i<3?MEDALS[i]:`${i+1}.`}</div>
              <div className="text-3xl shrink-0">{l.avatar||"🧘"}</div>
              <div className="flex-1 min-w-0">
                <p className="font-sans font-black text-sm text-gray-800 truncate">{l.display_name}</p>
                <div className="flex gap-3 mt-0.5 flex-wrap">
                  {l.spiritual_score!==undefined&&<span className="font-sans text-[10px] text-amber-600 font-bold">⭐ {l.spiritual_score} pts</span>}
                  {l.days!==undefined&&<span className="font-sans text-[10px] text-orange-500 font-bold">🔥 {l.days} days</span>}
                  {l.total_activities!==undefined&&<span className="font-sans text-[10px] text-purple-500">{l.total_activities} practices</span>}
                  {l.received!==undefined&&<span className="font-sans text-[10px] text-orange-600 font-bold">🙏 {l.received} received</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-8 rounded-2xl p-4 text-center"
        style={{background:"rgba(156,39,176,0.05)",border:"1.5px dashed rgba(156,39,176,0.2)"}}>
        <p className="font-hindi text-xs text-purple-700">यह लीडरबोर्ड केवल साधना की मात्रा दिखाता है, प्रतिस्पर्धा के लिए नहीं।</p>
        <p className="font-sans text-[10px] text-gray-400 mt-1">This leaderboard shows spiritual practice volume, not competition.</p>
      </div>
    </div>
  );
}
