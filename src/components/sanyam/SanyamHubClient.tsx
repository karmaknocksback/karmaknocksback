"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface FeedItem { id:number; display_name:string; avatar:string; vrat_name:string; vrat_emoji:string; vrat_color:string; feed_type:string; anumodana_count:number; created_at:string; }
interface Vrat { id:number; name:string; name_hi:string; slug:string; category:string; emoji:string; color:string; difficulty:string; duration_days:number; stars_reward:number; }

const DIFF: Record<string,{c:string;l:string}> = {
  easy:    {c:"#16A34A",l:"Easy"},
  medium:  {c:"#D97706",l:"Medium"},
  hard:    {c:"#DC2626",l:"Hard"},
  extreme: {c:"#7C3AED",l:"Extreme"},
};

export default function SanyamHubClient() {
  const [feed,    setFeed]    = useState<FeedItem[]>([]);
  const [popular, setPopular] = useState<Vrat[]>([]);
  const [loading, setLoading] = useState(true);
  const [given,   setGiven]   = useState<Set<number>>(new Set());

  useEffect(()=>{
    Promise.all([
      fetch("/api/sanyam/feed?limit=8").then(r=>r.json()).then(d=>setFeed(d.feed||[])),
      fetch("/api/sanyam/vrats").then(r=>r.json()).then(d=>setPopular((d.vrats||[]).slice(0,6))),
    ]).finally(()=>setLoading(false));
  },[]);

  async function anumodana(id:number) {
    if (given.has(id)) return;
    const tok = typeof window!=="undefined"?localStorage.getItem("academy_token"):null;
    await fetch("/api/sanyam/anumodana",{
      method:"POST", credentials:"include",
      headers:{...(tok?{"Authorization":`Bearer ${tok}`}:{}),"Content-Type":"application/json"},
      body:JSON.stringify({feed_id:id,giver_name:"A devotee",giver_avatar:"🙏"})
    });
    setGiven(p=>new Set([...p,id]));
    setFeed(f=>f.map(i=>i.id===id?{...i,anumodana_count:(i.anumodana_count||0)+1}:i));
  }

  function timeAgo(dt:string) {
    const d=Date.now()-new Date(dt).getTime(),h=Math.floor(d/3600000);
    return h<1?"Just now":h<24?`${h}h ago`:`${Math.floor(h/24)}d ago`;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

      {/* ── COMMUNITY FEED ── */}
      <div className="lg:col-span-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans font-black text-lg text-gray-900">🌿 Community Activity</h2>
          <Link href="/sanyam/feed" className="font-sans text-sm font-bold text-amber-600 hover:text-amber-800">See all →</Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i=>(
              <div key={i} className="h-20 rounded-2xl animate-pulse bg-gray-100"/>
            ))}
          </div>
        ) : feed.length===0 ? (
          <div className="rounded-3xl p-10 text-center bg-white shadow-sm" style={{border:"2px dashed #E5E7EB"}}>
            <div className="text-5xl mb-3">🌸</div>
            <p className="font-sans font-black text-gray-700 mb-2">No activity yet</p>
            <p className="font-hindi text-sm text-gray-500 mb-5">सबसे पहले अपनी साधना शेयर करें</p>
            <Link href="/sanyam/feed"
              className="inline-block px-6 py-3 rounded-2xl font-sans font-black text-sm text-white"
              style={{background:"linear-gradient(135deg,#F59E0B,#D97706)"}}>
              + Share Your Practice
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {feed.map(item=>(
              <div key={item.id} className="rounded-2xl p-4 bg-white shadow-sm" style={{border:"1px solid #E5E7EB"}}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-2xl shrink-0">{item.avatar||"🧘"}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm text-gray-800">
                      <span className="font-black text-gray-900">{item.display_name}</span>
                      {" "}<span className="text-gray-500">{item.feed_type==="completed"?"completed":"started"}</span>{" "}
                      <span className="font-black" style={{color:item.vrat_color||"#D97706"}}>{item.vrat_emoji} {item.vrat_name}</span>
                    </p>
                    <p className="font-sans text-[10px] text-gray-400 mt-0.5">{timeAgo(item.created_at)}</p>
                  </div>
                  {item.feed_type==="completed"&&(
                    <span className="font-sans text-[10px] font-black text-green-600 shrink-0">✅ Done</span>
                  )}
                </div>
                <div className="mt-3 pt-2.5 flex items-center" style={{borderTop:"1px solid #F1F5F9"}}>
                  <button onClick={()=>anumodana(item.id)} disabled={given.has(item.id)}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-sans font-black text-xs transition-all active:scale-95 disabled:opacity-60"
                    style={{
                      background:given.has(item.id)?"#FFFBEB":"#FEF3C7",
                      color:"#92400E",
                      border:`1px solid ${given.has(item.id)?"#FCD34D":"#FDE68A"}`,
                    }}>
                    🙏 {given.has(item.id)?"Anumodana ✓":"Anumodana"} · {item.anumodana_count||0}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── START TODAY / POPULAR VRATS ── */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans font-black text-lg text-gray-900">⭐ Start Today</h2>
          <Link href="/sanyam/vrat-db" className="font-sans text-sm font-bold text-amber-600 hover:text-amber-800">Browse all →</Link>
        </div>

        <div className="space-y-2.5">
          {loading ? [1,2,3,4,5].map(i=>(
            <div key={i} className="h-16 rounded-xl animate-pulse bg-gray-100"/>
          )) : popular.map(v=>(
            <Link key={v.id} href={`/sanyam/vrat/${v.slug}`}
              className="flex items-center gap-3 rounded-2xl p-3.5 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all group"
              style={{border:`1.5px solid ${v.color}20`}}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{background:`${v.color}12`}}>
                {v.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-hindi font-black text-sm text-gray-900 truncate">{v.name_hi||v.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-sans text-[10px] font-bold" style={{color:DIFF[v.difficulty]?.c||"#6B7280"}}>
                    {DIFF[v.difficulty]?.l||v.difficulty}
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="font-sans text-[10px] text-amber-600 font-bold">⭐{v.stars_reward}</span>
                  {v.duration_days>0&&<><span className="text-gray-300">·</span><span className="font-sans text-[10px] text-gray-500">{v.duration_days}d</span></>}
                </div>
              </div>
              <span className="font-sans text-sm font-black shrink-0 group-hover:translate-x-1 transition-transform"
                style={{color:v.color}}>Start →</span>
            </Link>
          ))}
        </div>

        {/* Calendar CTA */}
        <Link href="/calendar"
          className="mt-4 flex items-center gap-3 rounded-2xl p-4 bg-white hover:shadow-md transition-all"
          style={{border:"1.5px solid #FDE68A"}}>
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-2xl">📅</div>
          <div>
            <p className="font-sans font-black text-sm text-gray-900">Jain Festival Calendar</p>
            <p className="font-hindi text-[10px] text-gray-500">29 व्रत व पर्व की तिथियाँ</p>
          </div>
          <span className="ml-auto font-sans text-xs font-bold text-amber-600">Open →</span>
        </Link>
      </div>
    </div>
  );
}
