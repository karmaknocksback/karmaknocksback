"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface FeedItem {
  id:number; display_name:string; avatar:string;
  vrat_name:string; vrat_emoji:string; vrat_color:string;
  feed_type:string; anumodana_count:number; created_at:string;
}
interface Vrat {
  id:number; name:string; name_hi:string; slug:string;
  category:string; emoji:string; color:string; difficulty:string;
  duration_days:number; stars_reward:number; description:string;
}

const DIFF_COLOR: Record<string,string> = {easy:"#4CAF50",medium:"#FF9800",hard:"#F44336",extreme:"#9C27B0"};

export default function SanyamHubClient() {
  const [feed, setFeed]         = useState<FeedItem[]>([]);
  const [popular, setPopular]   = useState<Vrat[]>([]);
  const [loading, setLoading]   = useState(true);
  const [given, setGiven]       = useState<Set<number>>(new Set());

  const gid = typeof window!=="undefined"
    ? localStorage.getItem("sanyam_guest") || (() => {
        const id = "g_"+Math.random().toString(36).slice(2,10);
        localStorage.setItem("sanyam_guest",id); return id;
      })()
    : "";

  useEffect(()=>{
    Promise.all([
      fetch("/api/sanyam/feed?limit=8").then(r=>r.json()).then(d=>setFeed(d.feed||[])),
      fetch("/api/sanyam/vrats").then(r=>r.json()).then(d=>setPopular((d.vrats||[]).slice(0,5))),
    ]).finally(()=>setLoading(false));
  },[]);

  async function anumoDana(id: number) {
    if(given.has(id)) return;
    const tok = localStorage.getItem("academy_token");
    await fetch("/api/sanyam/anumodana",{
      method:"POST", credentials:"include",
      headers:{...(tok?{"Authorization":`Bearer ${tok}`}:{}),"Content-Type":"application/json"},
      body:JSON.stringify({feed_id:id,giver_name:"A devotee",giver_avatar:"🙏",giver_guest_id:gid})
    });
    setGiven(p=>new Set([...p,id]));
    setFeed(f=>f.map(i=>i.id===id?{...i,anumodana_count:(i.anumodana_count||0)+1}:i));
  }

  function timeAgo(dt: string) {
    const d=Date.now()-new Date(dt).getTime(), h=Math.floor(d/3600000);
    return h<1?"Just now":h<24?`${h}h ago`:`${Math.floor(h/24)}d ago`;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

      {/* Feed — wider */}
      <div className="lg:col-span-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans font-black text-base text-white">🌟 Community Activity</h2>
          <Link href="/sanyam/feed" className="font-sans text-[11px] text-amber-500 hover:text-amber-400">See all →</Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i=><div key={i} className="h-20 rounded-2xl animate-pulse" style={{background:"rgba(255,255,255,0.04)"}}/>)}
          </div>
        ) : feed.length===0 ? (
          <div className="rounded-2xl p-10 text-center" style={{background:"rgba(255,255,255,0.03)",border:"2px dashed rgba(255,255,255,0.07)"}}>
            <div className="text-4xl mb-3">🌸</div>
            <p className="font-sans text-sm text-white/40 mb-4">Be the first to share your spiritual journey</p>
            <Link href="/sanyam/vrat-db"
              className="inline-block px-6 py-2.5 rounded-full font-sans font-black text-xs text-white"
              style={{background:"linear-gradient(135deg,#9C27B0,#7B1FA2)"}}>
              Start a Practice →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {feed.map(item=>(
              <div key={item.id} className="rounded-2xl p-4"
                style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)"}}>
                <div className="flex items-start gap-3">
                  <span className="text-3xl shrink-0">{item.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm text-white/80">
                      <span className="font-black text-white">{item.display_name}</span>{" "}
                      <span className="text-gray-400">{item.feed_type==="completed"?"completed":"started"}</span>{" "}
                      <span className="font-black" style={{color:item.vrat_color||"#FF9800"}}>
                        {item.vrat_emoji} {item.vrat_name}
                      </span>
                    </p>
                    <p className="font-sans text-[10px] text-gray-600 mt-0.5">{timeAgo(item.created_at)}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between pt-2" style={{borderTop:"1px solid rgba(255,255,255,0.04)"}}>
                  <button onClick={()=>anumoDana(item.id)} disabled={given.has(item.id)}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-sans text-[11px] font-black transition-all hover:scale-105 disabled:opacity-60"
                    style={{
                      background:given.has(item.id)?"rgba(255,152,0,0.15)":"rgba(255,152,0,0.08)",
                      color:"#FF9800", border:"1px solid rgba(255,152,0,0.2)"
                    }}>
                    🙏 {given.has(item.id)?"Anumodana Given":"Anumodana"} · {item.anumodana_count||0}
                  </button>
                  {item.feed_type==="completed"&&(
                    <span className="font-sans text-[10px] text-green-500 font-bold">✅ Completed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popular vrats — narrower */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans font-black text-base text-white">⭐ Start Today</h2>
          <Link href="/sanyam/vrat-db" className="font-sans text-[11px] text-amber-500 hover:text-amber-400">Browse all →</Link>
        </div>
        <div className="space-y-2.5">
          {loading ? [1,2,3,4,5].map(i=><div key={i} className="h-16 rounded-xl animate-pulse" style={{background:"rgba(255,255,255,0.04)"}}/>)
          : popular.map(v=>(
            <Link key={v.id} href={`/sanyam/vrat/${v.slug}`}
              className="flex items-center gap-3 rounded-xl p-3 hover:scale-[1.02] transition-all"
              style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${v.color}20`}}>
              <span className="text-2xl shrink-0">{v.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-hindi font-bold text-xs text-white truncate">{v.name}</p>
                <div className="flex gap-1.5 mt-0.5">
                  <span className="font-sans text-[9px]" style={{color:DIFF_COLOR[v.difficulty]||"#666"}}>{v.difficulty}</span>
                  <span className="font-sans text-[9px] text-amber-500">⭐{v.stars_reward}</span>
                  {v.duration_days>0&&<span className="font-sans text-[9px] text-gray-500">{v.duration_days}d</span>}
                </div>
              </div>
              <span className="font-sans text-[10px] font-black shrink-0" style={{color:v.color}}>Start →</span>
            </Link>
          ))}
        </div>
        {/* Calendar CTA */}
        <Link href="/sanyam/calendar"
          className="mt-4 flex items-center gap-3 rounded-2xl p-4 hover:scale-[1.02] transition-all"
          style={{background:"rgba(255,152,0,0.08)",border:"1.5px solid rgba(255,152,0,0.2)"}}>
          <span className="text-3xl">📅</span>
          <div>
            <p className="font-sans font-black text-xs text-amber-400">Jain Festival Calendar</p>
            <p className="font-hindi text-[10px] text-gray-500">29 व्रत व पर्व की तिथियाँ</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
