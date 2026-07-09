"use client";
import { useState, useEffect } from "react";

interface FeedItem {
  id:number; display_name:string; avatar:string;
  vrat_name:string; vrat_emoji:string; vrat_color:string;
  feed_type:string; anumodana_count:number; created_at:string;
}

export default function SanyamFeedPage() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [given, setGiven] = useState<Set<number>>(new Set());

  useEffect(()=>{
    fetch("/api/sanyam/feed?limit=30").then(r=>r.json()).then(d=>{setFeed(d.feed||[]);setLoading(false);});
  },[]);

  async function anumoDana(id: number) {
    if (given.has(id)) return;
    const tok = localStorage.getItem("academy_token");
    const gid = localStorage.getItem("sanyam_guest")||("g_"+Math.random().toString(36).slice(2,10));
    localStorage.setItem("sanyam_guest",gid);
    await fetch("/api/sanyam/anumodana",{
      method:"POST",credentials:"include",
      headers:{...(tok?{"Authorization":`Bearer ${tok}`}:{}),"Content-Type":"application/json"},
      body:JSON.stringify({feed_id:id,giver_name:"A devotee",giver_avatar:"🙏",giver_guest_id:gid})
    });
    setGiven(p=>new Set([...p,id]));
    setFeed(f=>f.map(item=>item.id===id?{...item,anumodana_count:(item.anumodana_count||0)+1}:item));
  }

  function timeAgo(dt: string) {
    const diff=Date.now()-new Date(dt).getTime();
    const h=Math.floor(diff/3600000);
    if(h<1)return"Just now";if(h<24)return`${h}h ago`;return`${Math.floor(h/24)}d ago`;
  }

  const typeColors: Record<string,string> = {started:"#9C27B0",completed:"#4CAF50",milestone:"#FF9800"};

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-20">
      <div className="text-center mb-8">
        <h1 className="font-sans font-black text-2xl text-gray-800 mb-1">🌟 Spiritual Activity Feed</h1>
        <p className="font-hindi text-sm text-gray-500">जैन समाज की साधना का प्रवाह — Inspire & be inspired</p>
        <p className="font-sans text-xs text-gray-400 mt-2">
          🙏 Give Anumodana to encourage others on their spiritual journey
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3,4,5].map(i=><div key={i} className="h-32 rounded-2xl bg-gray-100 animate-pulse"/>)}
        </div>
      ) : feed.length===0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🌸</div>
          <p className="font-sans font-bold text-gray-500 mb-2">The feed is quiet...</p>
          <p className="font-sans text-sm text-gray-400 mb-6">Be the first to share your spiritual journey!</p>
          <a href="/sanyam/vrat-db" className="inline-block px-8 py-3 rounded-full font-sans font-black text-sm text-white"
            style={{background:"linear-gradient(135deg,#9C27B0,#7B1FA2)"}}>
            Start a Vrat →
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {feed.map(item=>(
            <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
              <div className="flex items-start gap-4">
                <div className="text-4xl shrink-0">{item.avatar}</div>
                <div className="flex-1">
                  <p className="font-sans text-sm text-gray-700 leading-relaxed">
                    <span className="font-black">{item.display_name}</span>{" "}
                    <span className="font-bold" style={{color:typeColors[item.feed_type]||"#666"}}>
                      {item.feed_type==="completed"?"completed ✅":item.feed_type==="started"?"started":"is on"}
                    </span>{" "}
                    <span className="font-black" style={{color:item.vrat_color||"#FF9800"}}>
                      {item.vrat_emoji} {item.vrat_name}
                    </span>
                  </p>
                  <p className="font-sans text-[10px] text-gray-400 mt-1">{timeAgo(item.created_at)}</p>
                </div>
              </div>
              {/* Anumodana button */}
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                <button onClick={()=>anumoDana(item.id)} disabled={given.has(item.id)}
                  className="flex items-center gap-2 rounded-full px-4 py-2 font-sans font-black text-xs transition-all hover:scale-105 disabled:opacity-70"
                  style={{
                    background:given.has(item.id)?"rgba(255,152,0,0.2)":"rgba(255,152,0,0.06)",
                    color:"#E65100", border:"1.5px solid rgba(255,152,0,0.3)"
                  }}>
                  🙏 {given.has(item.id)?"Anumodana Given!":"Give Anumodana"}
                  <span className="ml-1 rounded-full px-2 py-0.5 text-[9px]"
                    style={{background:"rgba(255,152,0,0.2)"}}>
                    {item.anumodana_count||0}
                  </span>
                </button>
                {item.feed_type==="completed" && (
                  <span className="font-sans text-[10px] font-bold text-green-600 bg-green-50 rounded-full px-3 py-1">
                    🏆 Completed!
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
