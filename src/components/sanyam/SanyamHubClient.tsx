"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface FeedItem {
  id:number; display_name:string; avatar:string;
  vrat_name:string; vrat_emoji:string; vrat_color:string;
  feed_type:string; message:string; anumodana_count:number;
  created_at:string;
}

interface Vrat {
  id:number; name:string; name_hi:string; slug:string;
  category:string; emoji:string; color:string;
  difficulty:string; duration_days:number; stars_reward:number;
  description:string;
}

const DIFF_COLOR: Record<string,string> = {
  easy:"#4CAF50", medium:"#FF9800", hard:"#F44336", extreme:"#9C27B0"
};

export default function SanyamHubClient() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [popular, setPopular] = useState<Vrat[]>([]);
  const [loading, setLoading] = useState(true);
  const [anumodanaGiven, setAnumodanaGiven] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<"feed"|"popular">("feed");

  const guestId = typeof window!=="undefined" ? (localStorage.getItem("sanyam_guest")||generateGuestId()) : null;

  function generateGuestId() {
    const id = "g_"+Math.random().toString(36).slice(2,10);
    if (typeof window!=="undefined") localStorage.setItem("sanyam_guest",id);
    return id;
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/sanyam/feed?limit=10").then(r=>r.json()).then(d=>setFeed(d.feed||[])),
      fetch("/api/sanyam/vrats").then(r=>r.json()).then(d=>setPopular((d.vrats||[]).slice(0,6))),
    ]).finally(()=>setLoading(false));
  }, []);

  async function giveAnumodana(feedId: number) {
    if (anumodanaGiven.has(feedId)) return;
    const tok = localStorage.getItem("academy_token");
    await fetch("/api/sanyam/anumodana", {
      method:"POST", credentials:"include",
      headers: tok ? {"Authorization":`Bearer ${tok}`,"Content-Type":"application/json"} : {"Content-Type":"application/json"},
      body: JSON.stringify({ feed_id:feedId, giver_name:"A devotee", giver_avatar:"🙏", giver_guest_id:guestId })
    });
    setAnumodanaGiven(prev=>new Set([...prev,feedId]));
    setFeed(f=>f.map(item=>item.id===feedId ? {...item,anumodana_count:(item.anumodana_count||0)+1} : item));
  }

  function timeAgo(dt: string) {
    const diff = Date.now()-new Date(dt).getTime();
    const h = Math.floor(diff/3600000);
    if (h<1) return "Just now";
    if (h<24) return `${h}h ago`;
    return `${Math.floor(h/24)}d ago`;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans font-black text-lg text-gray-800">🌟 Activity Feed</h2>
          <Link href="/sanyam/feed" className="font-sans text-xs text-purple-600 font-bold hover:underline">See all →</Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i=><div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse"/>)}
          </div>
        ) : feed.length === 0 ? (
          <div className="rounded-2xl p-8 text-center bg-white border border-dashed border-gray-200">
            <div className="text-4xl mb-3">🌱</div>
            <p className="font-sans font-bold text-gray-500 text-sm">Be the first!</p>
            <p className="font-sans text-xs text-gray-400 mt-1">Start a vrat to appear in the feed</p>
            <Link href="/sanyam/vrat-db" className="inline-block mt-3 px-4 py-2 rounded-full font-sans font-black text-xs text-white"
              style={{background:"linear-gradient(135deg,#9C27B0,#7B1FA2)"}}>
              Browse Vrats →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {feed.map(item=>(
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="text-3xl shrink-0 mt-0.5">{item.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm text-gray-700">
                      <span className="font-black">{item.display_name}</span>{" "}
                      <span className={`font-bold ${item.feed_type==="completed"?"text-green-600":item.feed_type==="started"?"text-purple-600":"text-amber-600"}`}>
                        {item.feed_type==="completed"?"completed":"started"}
                      </span>{" "}
                      <span className="font-black" style={{color:item.vrat_color||"#FF9800"}}>
                        {item.vrat_emoji} {item.vrat_name}
                      </span>
                    </p>
                    <p className="font-sans text-[10px] text-gray-400 mt-0.5">{timeAgo(item.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                  <button
                    onClick={()=>giveAnumodana(item.id)}
                    disabled={anumodanaGiven.has(item.id)}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-sans text-xs font-black transition-all hover:scale-105 disabled:opacity-60"
                    style={{
                      background:anumodanaGiven.has(item.id)?"rgba(255,152,0,0.15)":"rgba(255,152,0,0.08)",
                      color:"#E65100",border:"1.5px solid rgba(255,152,0,0.3)"
                    }}>
                    🙏 {anumodanaGiven.has(item.id)?"Anumodana!":"Anumodana"} · {item.anumodana_count||0}
                  </button>
                  {item.feed_type==="completed"&&(
                    <span className="font-sans text-[10px] text-green-600 font-bold">✅ Completed!</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popular vrats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans font-black text-lg text-gray-800">🌟 Start Today</h2>
          <Link href="/sanyam/vrat-db" className="font-sans text-xs text-purple-600 font-bold hover:underline">All vrats →</Link>
        </div>
        <div className="space-y-3">
          {loading ? [1,2,3,4,5,6].map(i=><div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse"/>) :
          popular.map(v=>(
            <div key={v.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className="text-3xl shrink-0">{v.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-sans font-black text-sm text-gray-800 truncate">{v.name}</p>
                    <p className="font-hindi text-[10px] text-gray-400">{v.name_hi}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="font-sans text-[9px] font-bold rounded-full px-2 py-0.5"
                        style={{background:`${DIFF_COLOR[v.difficulty]||"#666"}15`,color:DIFF_COLOR[v.difficulty]||"#666"}}>
                        {v.difficulty}
                      </span>
                      <span className="font-sans text-[9px] text-amber-600 font-bold">⭐ {v.stars_reward} stars</span>
                      {v.duration_days>0&&<span className="font-sans text-[9px] text-gray-400">{v.duration_days} days</span>}
                    </div>
                  </div>
                  <Link href={`/sanyam/vrat/${v.slug}`}
                    className="shrink-0 rounded-xl px-3 py-1.5 font-sans font-black text-[10px] text-white whitespace-nowrap"
                    style={{background:`linear-gradient(135deg,${v.color||"#9C27B0"},${v.color||"#7B1FA2"}88)`}}>
                    Start →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
