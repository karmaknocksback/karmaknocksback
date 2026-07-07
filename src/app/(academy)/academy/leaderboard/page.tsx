"use client";
import { useState, useEffect } from "react";

type Period = "all"|"monthly"|"weekly";
interface LeaderRow { rank:number; name:string; total_stars?:number; period_stars?:number; current_level?:number; streak_days?:number; }

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("all");
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/academy/leaderboard?period=${period}`)
      .then(r=>r.json()).then(d=>{ setRows(d.leaderboard||[]); }).finally(()=>setLoading(false));
  }, [period]);

  const MEDAL = ["🥇","🥈","🥉"];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-20">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🏆</div>
        <h1 className="font-display-hi text-2xl font-black text-amber-900">Leaderboard</h1>
        <p className="font-hindi text-sm text-amber-600">ज्ञान प्रतियोगिता</p>
      </div>

      {/* Period tabs */}
      <div className="flex gap-2 justify-center mb-6">
        {(["all","monthly","weekly"] as Period[]).map(p=>(
          <button key={p} onClick={()=>setPeriod(p)}
            className="px-5 py-2 rounded-full font-sans text-xs font-black transition-all"
            style={period===p?{background:"linear-gradient(135deg,#FFD700,#FF9800)",color:"#1a0800"}:{background:"white",border:"1px solid #E0E0E0",color:"#666"}}>
            {p==="all"?"All Time":p==="monthly"?"This Month":"This Week"}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center py-12"><div className="text-4xl animate-bounce">⭐</div></div> : (
        <div className="space-y-2">
          {rows.map(row=>(
            <div key={row.rank} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm"
              style={{border:row.rank<=3?`2px solid #FFD700`:"2px solid transparent",background:row.rank===1?"linear-gradient(135deg,#FFFDE7,#FFF9C4)":"white"}}>
              <div className="w-8 text-center font-sans font-black text-lg">
                {row.rank <= 3 ? MEDAL[row.rank-1] : row.rank}
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-amber-900" style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>
                {row.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm font-black text-gray-800 truncate">{row.name}</p>
                {row.streak_days ? <p className="font-sans text-[10px] text-gray-400">🔥 {row.streak_days} day streak</p> : null}
              </div>
              <div className="text-right">
                <p className="font-display text-lg font-black text-amber-700">⭐ {row.total_stars||row.period_stars||0}</p>
                {row.current_level ? <p className="font-sans text-[10px] text-gray-400">Level {row.current_level}</p> : null}
              </div>
            </div>
          ))}
          {rows.length === 0 && <div className="text-center py-12"><p className="font-sans text-sm text-gray-400">No data yet. Start learning to appear here!</p></div>}
        </div>
      )}
    </div>
  );
}