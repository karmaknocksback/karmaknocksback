"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Activity {
  id:number; vrat_name:string; vrat_emoji:string; status:string;
  start_date:string; current_day:number; total_days:number;
  stars_earned:number; anumodanas_count:number; category:string;
  color:string;
}
interface Profile {
  display_name:string; avatar:string; spiritual_score:number; bio:string;
  total_vrats_completed:number; total_days_tap:number;
  total_anumodanas_received:number;
}

const CAT_ICONS: Record<string,string> = {
  vrat:"🙏",tap:"🔥",tyag:"🌿",jaap:"📿",yatra:"🏔",swadhyay:"📖",daan:"💝"
};

const LEVEL_MAP = [
  {min:0,   name:"Seeker",       hi:"जिज्ञासु",  emoji:"🌱", color:"#78909C"},
  {min:200, name:"Shravak",      hi:"श्रावक",    emoji:"🙏", color:"#42A5F5"},
  {min:500, name:"Sadhak",       hi:"साधक",      emoji:"🧘", color:"#66BB6A"},
  {min:1000,name:"Tapasvi",      hi:"तपस्वी",    emoji:"🔥", color:"#FF9800"},
  {min:2500,name:"Vrati",        hi:"व्रती",     emoji:"💎", color:"#AB47BC"},
  {min:5000,name:"Jain Seva",    hi:"जैन सेवक", emoji:"⭐", color:"#FFD700"},
  {min:10000,name:"Muni Bhakt",  hi:"मुनि भक्त",emoji:"📿", color:"#EC407A"},
  {min:20000,name:"Dharmatma",   hi:"धर्मात्मा",emoji:"🌟", color:"#FF5722"},
];

function getLevel(score: number) {
  for (let i=LEVEL_MAP.length-1;i>=0;i--) if (score>=LEVEL_MAP[i].min) return LEVEL_MAP[i];
  return LEVEL_MAP[0];
}
function getNextLevel(score: number) {
  const cur = getLevel(score);
  const curIdx = LEVEL_MAP.findIndex(l=>l.name===cur.name);
  return LEVEL_MAP[curIdx+1] || null;
}
function getLevelPct(score: number) {
  const cur=getLevel(score), next=getNextLevel(score);
  if(!next) return 100;
  return Math.min(100,Math.round(((score-cur.min)/(next.min-cur.min))*100));
}

export default function SanyamProfilePage() {
  const [profile, setProfile] = useState<Profile|null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startingVrat, setStartingVrat] = useState(false);

  useEffect(()=>{
    async function load(){
      const tok = localStorage.getItem("academy_token");
      const headers: Record<string,string> = {};
      if (tok) headers["Authorization"] = `Bearer ${tok}`;
      const res = await fetch("/api/sanyam/profile", {headers, credentials:"include"});
      const d = await res.json();
      setProfile(d.profile);
      setActivities(d.activities||[]);
      setIsLoggedIn(d.isLoggedIn);
      setLoading(false);
    }
    load();
  },[]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-5xl animate-bounce">🧘</div>
    </div>
  );

  const score = profile?.spiritual_score || 0;
  const level = getLevel(score);
  const nextLevel = getNextLevel(score);
  const pct = getLevelPct(score);

  const activeActs = activities.filter(a=>a.status==="active");
  const completedActs = activities.filter(a=>a.status==="completed");

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
      {/* Profile card */}
      <div className="rounded-3xl overflow-hidden mb-6 shadow-xl"
        style={{border:`3px solid ${level.color}40`}}>
        {/* Header gradient */}
        <div className="px-6 py-8" style={{background:`linear-gradient(135deg,${level.color}20,${level.color}08)`}}>
          <div className="flex items-start gap-4 flex-wrap">
            <div className="text-6xl shrink-0">{profile?.avatar||"🧘"}</div>
            <div className="flex-1">
              <h1 className="font-sans font-black text-2xl text-gray-800 mb-0.5">
                {profile?.display_name || (isLoggedIn ? "Your Profile" : "Guest Profile")}
              </h1>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{level.emoji}</span>
                <span className="font-sans font-black text-sm" style={{color:level.color}}>{level.name}</span>
                <span className="font-hindi text-xs text-gray-400">{level.hi}</span>
              </div>
              {profile?.bio && <p className="font-sans text-sm text-gray-600">{profile.bio}</p>}
              {/* Level progress */}
              <div className="mt-3 max-w-xs">
                <div className="flex justify-between text-[10px] font-sans mb-1">
                  <span className="text-gray-500 font-bold">⭐ {score} Spiritual Points</span>
                  {nextLevel && <span style={{color:nextLevel.color}} className="font-bold">{nextLevel.min-score} to {nextLevel.name}</span>}
                </div>
                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{width:`${pct}%`,background:`linear-gradient(90deg,${level.color},${nextLevel?.color||level.color})`}}/>
                </div>
              </div>
            </div>
            {!isLoggedIn && (
              <Link href="/academy/login?redirect=/sanyam/profile"
                className="rounded-2xl px-5 py-2.5 font-sans font-black text-sm text-amber-900"
                style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>
                🔑 Sign In to Save
              </Link>
            )}
          </div>
          {/* Stats row */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-5">
            {[
              {l:"Active",v:activeActs.length,c:"#4CAF50"},
              {l:"Completed",v:completedActs.length,c:"#2196F3"},
              {l:"⭐ Points",v:score,c:"#FF9800"},
              {l:"🙏 Received",v:profile?.total_anumodanas_received||0,c:"#9C27B0"},
              {l:"📿 Vrats Done",v:profile?.total_vrats_completed||0,c:"#E91E63"},
              {l:"🔥 Tap Days",v:profile?.total_days_tap||0,c:"#FF5722"},
            ].map(s=>(
              <div key={s.l} className="rounded-xl p-2.5 text-center bg-white shadow-sm">
                <p className="font-display text-xl font-black" style={{color:s.c}}>{s.v}</p>
                <p className="font-sans text-[9px] text-gray-400">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active activities */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-sans font-black text-base text-gray-800">🔥 Currently Active</h2>
            <Link href="/sanyam/vrat-db"
              className="rounded-full px-4 py-1.5 font-sans font-black text-[10px] text-white"
              style={{background:"linear-gradient(135deg,#9C27B0,#7B1FA2)"}}>
              + Start New
            </Link>
          </div>
          {activeActs.length===0 ? (
            <div className="rounded-2xl p-8 text-center bg-white border-2 border-dashed border-gray-200">
              <div className="text-4xl mb-3">🌸</div>
              <p className="font-sans font-bold text-gray-500 text-sm mb-1">No active practices</p>
              <p className="font-sans text-xs text-gray-400 mb-4">Start a Vrat, Tap, or Tyag to begin your journey</p>
              <Link href="/sanyam/vrat-db"
                className="inline-block px-6 py-2.5 rounded-full font-sans font-black text-sm text-white"
                style={{background:"linear-gradient(135deg,#9C27B0,#7B1FA2)"}}>
                Browse All Practices →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeActs.map(a=>{
                const dayPct = a.total_days>0 ? Math.min(100,Math.round((a.current_day/a.total_days)*100)) : 0;
                return (
                  <div key={a.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{a.vrat_emoji||CAT_ICONS[a.category]||"🙏"}</span>
                      <div className="flex-1">
                        <p className="font-sans font-black text-sm text-gray-800">{a.vrat_name}</p>
                        <div className="flex gap-2 mt-0.5">
                          <span className="font-sans text-[10px] text-green-600 font-bold">● Active</span>
                          <span className="font-sans text-[10px] text-gray-400">
                            Day {a.current_day}{a.total_days>0?` / ${a.total_days}`:""}
                          </span>
                        </div>
                        {a.total_days>0&&(
                          <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full" style={{width:`${dayPct}%`,background:"linear-gradient(90deg,#4CAF50,#FFD700)"}}/>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-sans text-xs font-black text-amber-600">⭐ {a.stars_earned}</p>
                        <p className="font-sans text-[10px] text-orange-500">🙏 {a.anumodanas_count}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed */}
        <div>
          <h2 className="font-sans font-black text-base text-gray-800 mb-3">✅ Completed Practices</h2>
          {completedActs.length===0 ? (
            <div className="rounded-2xl p-6 text-center bg-white border border-gray-100">
              <p className="font-sans text-sm text-gray-400">Your completed practices will appear here</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {completedActs.map(a=>(
                <div key={a.id} className="bg-white rounded-xl p-3 shadow-sm border border-green-50 flex items-center gap-3">
                  <span className="text-2xl">{a.vrat_emoji||"✅"}</span>
                  <div className="flex-1">
                    <p className="font-sans font-bold text-sm text-gray-700">{a.vrat_name}</p>
                    <p className="font-sans text-[10px] text-gray-400">
                      Completed · {a.total_days>0?`${a.total_days} days · `:""}{a.start_date}
                    </p>
                  </div>
                  <span className="font-sans text-xs font-black text-amber-600">⭐{a.stars_earned}</span>
                </div>
              ))}
            </div>
          )}

          {/* Quick links */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              {href:"/sanyam/feed",label:"🌟 Activity Feed",c:"#9C27B0"},
              {href:"/sanyam/leaderboard",label:"🏆 Leaderboard",c:"#FF9800"},
              {href:"/sanyam/vrat-db",label:"📚 Vrat Database",c:"#4CAF50"},
              {href:"/academy/dashboard",label:"🎓 Academy",c:"#2196F3"},
            ].map(l=>(
              <Link key={l.href} href={l.href}
                className="rounded-xl p-3 font-sans font-black text-xs text-center hover:opacity-90 transition-all"
                style={{background:`${l.c}15`,color:l.c,border:`1.5px solid ${l.c}30`}}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
