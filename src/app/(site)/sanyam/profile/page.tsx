"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ══════════════════════════════════════════════════════════════
   SANYAM PROFILE — Flagship Feature
   Premium spiritual journey tracker
══════════════════════════════════════════════════════════════ */

interface Activity {
  id:number; vrat_name:string; vrat_emoji:string; vrat_color:string;
  category:string; status:string; start_date:string;
  current_day:number; total_days:number; stars_earned:number;
  anumodanas_count:number;
}
interface Profile {
  display_name:string; avatar:string; bio:string;
  spiritual_score:number; vrat_score:number; tap_score:number;
  tyag_score:number; jaap_score:number; yatra_score:number;
  swadhyay_score:number; daan_score:number;
  total_vrats_completed:number; total_days_tap:number;
  total_anumodanas_received:number;
}

const SPIRITUAL_LEVELS = [
  {min:0,    name:"Seeker",        nameHi:"जिज्ञासु",    emoji:"🌱", color:"#78909C"},
  {min:200,  name:"Shravak",       nameHi:"श्रावक",       emoji:"🙏", color:"#42A5F5"},
  {min:500,  name:"Sadhak",        nameHi:"साधक",         emoji:"🧘", color:"#66BB6A"},
  {min:1000, name:"Tapasvi",       nameHi:"तपस्वी",       emoji:"🔥", color:"#FF9800"},
  {min:2500, name:"Vrati",         nameHi:"व्रती",        emoji:"💎", color:"#AB47BC"},
  {min:5000, name:"Dharmatma",     nameHi:"धर्मात्मा",   emoji:"⭐", color:"#FFD700"},
  {min:10000,name:"Sanpanna",      nameHi:"सम्पन्न",      emoji:"🌟", color:"#FF7043"},
  {min:25000,name:"Jain Seva",     nameHi:"जैन सेवक",    emoji:"🕉️", color:"#7C4DFF"},
];

const MODULES = [
  {cat:"vrat",     label:"Vrat",     labelHi:"व्रत",      emoji:"🙏", color:"#9C27B0", desc:"Sacred vows & observances"},
  {cat:"tap",      label:"Tap",      labelHi:"तप",        emoji:"🔥", color:"#FF5722", desc:"Austerities & fasting"},
  {cat:"tyag",     label:"Tyag",     labelHi:"त्याग",     emoji:"🌿", color:"#4CAF50", desc:"Daily renunciations"},
  {cat:"jaap",     label:"Jaap",     labelHi:"जाप",       emoji:"📿", color:"#7B1FA2", desc:"Mantra recitation"},
  {cat:"yatra",    label:"Yatra",    labelHi:"यात्रा",    emoji:"🏔", color:"#FF8F00", desc:"Sacred pilgrimages"},
  {cat:"swadhyay", label:"Swadhyay",labelHi:"स्वाध्याय", emoji:"📖", color:"#1565C0", desc:"Scriptural study"},
  {cat:"daan",     label:"Daan",     labelHi:"दान",       emoji:"💝", color:"#00897B", desc:"Charity & service"},
];

function getLevel(score: number) {
  for (let i=SPIRITUAL_LEVELS.length-1; i>=0; i--)
    if (score >= SPIRITUAL_LEVELS[i].min) return SPIRITUAL_LEVELS[i];
  return SPIRITUAL_LEVELS[0];
}
function getLevelPct(score: number) {
  const cur=getLevel(score);
  const curIdx=SPIRITUAL_LEVELS.findIndex(l=>l.name===cur.name);
  const next=SPIRITUAL_LEVELS[curIdx+1];
  if(!next) return 100;
  return Math.round(((score-cur.min)/(next.min-cur.min))*100);
}

export default function SanyamProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile|null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeModule, setActiveModule] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string|null>(null);

  useEffect(()=>{
    const tok = localStorage.getItem("academy_token");
    setToken(tok);
    if (!tok) { router.push("/academy/login?redirect=/sanyam/profile&reason=signin_required"); return; }
    load(tok);
  },[]);

  async function load(tok: string) {
    const h = {"Authorization":`Bearer ${tok}`};
    const [pRes, aRes] = await Promise.all([
      fetch("/api/sanyam/profile", {headers:h, credentials:"include"}),
      fetch("/api/sanyam/activity", {headers:h, credentials:"include"}),
    ]);
    const pd = await pRes.json();
    const ad = await aRes.json();
    setProfile(pd.profile);
    setActivities(ad.activities||[]);
    setLoading(false);
  }

  if (loading || !token) return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center space-y-3">
        <div className="text-6xl animate-pulse">🧘</div>
        <p className="font-hindi text-sm text-amber-700 font-bold">साधना प्रोफाइल लोड हो रही है...</p>
      </div>
    </div>
  );

  const score = profile?.spiritual_score || 0;
  const level = getLevel(score);
  const pct   = getLevelPct(score);
  const curIdx = SPIRITUAL_LEVELS.findIndex(l=>l.name===level.name);
  const nextLevel = SPIRITUAL_LEVELS[curIdx+1];

  const byCategory = (cat: string) => activities.filter(a=>a.category===cat);
  const active  = activities.filter(a=>a.status==="active");
  const completed = activities.filter(a=>a.status==="completed");

  const modScore = (cat: string): number => {
    const map: Record<string,keyof Profile> = {
      vrat:"vrat_score",tap:"tap_score",tyag:"tyag_score",
      jaap:"jaap_score",yatra:"yatra_score",swadhyay:"swadhyay_score",daan:"daan_score"
    };
    const key = map[cat]; return key && profile ? (profile as unknown as Record<string,number>)[key] || 0 : 0;
  };

  return (
    <div className="min-h-screen" style={{background:"linear-gradient(160deg,#0d0d0d 0%,#1a0800 40%,#0d0d1a 100%)"}}>

      {/* ── HERO HEADER ── */}
      <div className="relative overflow-hidden">
        {/* Gold particle decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {["10%","30%","55%","75%","90%"].map((l,i)=>(
            <div key={i} className="absolute top-4 text-2xl opacity-10 animate-pulse"
              style={{left:l,animationDelay:`${i*0.5}s`}}>🕉️</div>
          ))}
        </div>

        <div className="max-w-5xl mx-auto px-4 pt-10 pb-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

            {/* Avatar ring */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 rounded-full flex items-center justify-center text-6xl"
                style={{
                  background:`radial-gradient(circle,${level.color}30,${level.color}10)`,
                  border:`3px solid ${level.color}`,
                  boxShadow:`0 0 40px ${level.color}60`
                }}>
                {profile?.avatar||"🧘"}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 font-sans font-black text-[11px] border-2 border-white/20 whitespace-nowrap"
                style={{background:level.color,color:"white"}}>
                {level.emoji} {level.name}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="font-sans font-black text-3xl text-white mb-1">
                {profile?.display_name || "My Sanyam Profile"}
              </h1>
              <p className="font-hindi text-base text-amber-400 mb-1">{level.nameHi} · सत्य की यात्रा</p>
              {profile?.bio && <p className="font-sans text-sm text-gray-400 mb-4 max-w-md">{profile.bio}</p>}

              {/* Level bar */}
              <div className="max-w-sm mx-auto sm:mx-0 mb-4">
                <div className="flex justify-between font-sans text-[10px] mb-1.5">
                  <span className="text-amber-400 font-bold">⭐ {score.toLocaleString()} Spiritual Points</span>
                  {nextLevel && <span style={{color:nextLevel.color}} className="font-bold">{(nextLevel.min-score).toLocaleString()} → {nextLevel.name}</span>}
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.08)"}}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{width:`${pct}%`,background:`linear-gradient(90deg,${level.color},${nextLevel?.color||"#FFD700"})`}}/>
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex gap-3 justify-center sm:justify-start flex-wrap">
                {[
                  {v:active.length,       l:"Active",    c:"#4CAF50"},
                  {v:completed.length,    l:"Completed", c:"#2196F3"},
                  {v:profile?.total_anumodanas_received||0, l:"🙏 Anumodana", c:"#FF9800"},
                  {v:profile?.total_days_tap||0, l:"Tap Days", c:"#FF5722"},
                ].map(s=>(
                  <div key={s.l} className="rounded-2xl px-4 py-2 text-center"
                    style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${s.c}30`}}>
                    <p className="font-display font-black text-xl" style={{color:s.c}}>{s.v}</p>
                    <p className="font-sans text-[9px] text-gray-500">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex sm:flex-col gap-2">
              <Link href="/sanyam/vrat-db"
                className="px-5 py-2.5 rounded-2xl font-sans font-black text-xs text-amber-900 whitespace-nowrap"
                style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>
                + Start Practice
              </Link>
              <Link href="/sanyam/feed"
                className="px-5 py-2.5 rounded-2xl font-sans font-black text-xs text-white border border-white/20 hover:bg-white/10 transition-colors whitespace-nowrap">
                🌟 Feed
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODULE TABS ── */}
      <div className="sticky top-14 z-30 border-b border-white/5"
        style={{background:"rgba(13,13,13,0.97)",backdropFilter:"blur(20px)"}}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-0.5 overflow-x-auto scrollbar-none py-1">
            <button onClick={()=>setActiveModule("overview")}
              className="shrink-0 rounded-xl px-4 py-2 font-sans font-black text-xs transition-all"
              style={{
                background:activeModule==="overview"?"rgba(255,215,0,0.15)":"transparent",
                color:activeModule==="overview"?"#FFD700":"rgba(255,255,255,0.5)",
                border:activeModule==="overview"?"1px solid rgba(255,215,0,0.3)":"1px solid transparent",
              }}>
              📊 Overview
            </button>
            {MODULES.map(m=>(
              <button key={m.cat} onClick={()=>setActiveModule(m.cat)}
                className="shrink-0 rounded-xl px-4 py-2 font-sans font-black text-xs transition-all"
                style={{
                  background:activeModule===m.cat?`${m.color}20`:"transparent",
                  color:activeModule===m.cat?m.color:"rgba(255,255,255,0.5)",
                  border:activeModule===m.cat?`1px solid ${m.color}40`:"1px solid transparent",
                }}>
                {m.emoji} {m.label}
              </button>
            ))}
            <button onClick={()=>setActiveModule("timeline")}
              className="shrink-0 rounded-xl px-4 py-2 font-sans font-black text-xs transition-all"
              style={{
                background:activeModule==="timeline"?"rgba(156,39,176,0.2)":"transparent",
                color:activeModule==="timeline"?"#CE93D8":"rgba(255,255,255,0.5)",
                border:activeModule==="timeline"?"1px solid rgba(156,39,176,0.3)":"1px solid transparent",
              }}>
              🏛️ Timeline
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-5xl mx-auto px-4 py-6 pb-20">

        {/* OVERVIEW */}
        {activeModule==="overview"&&(
          <div className="space-y-6">
            {/* Module score cards */}
            <div>
              <h2 className="font-sans font-black text-sm text-white/60 uppercase tracking-widest mb-4">Spiritual Progress by Category</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {MODULES.map(m=>{
                  const s = modScore(m.cat);
                  const acts = byCategory(m.cat);
                  return (
                    <button key={m.cat} onClick={()=>setActiveModule(m.cat)}
                      className="rounded-2xl p-4 text-center hover:scale-105 transition-all cursor-pointer"
                      style={{background:`${m.color}10`,border:`1.5px solid ${m.color}25`}}>
                      <div className="text-3xl mb-2">{m.emoji}</div>
                      <p className="font-sans font-black text-xs mb-1" style={{color:m.color}}>{m.label}</p>
                      <p className="font-hindi text-[9px] text-gray-500 mb-2">{m.labelHi}</p>
                      <p className="font-display font-black text-lg" style={{color:m.color}}>⭐{s}</p>
                      <p className="font-sans text-[9px] text-gray-500">{acts.length} practices</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active practices */}
            {active.length > 0 && (
              <div>
                <h2 className="font-sans font-black text-sm text-white/60 uppercase tracking-widest mb-4">🔥 Currently Active</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {active.map(a=>{
                    const pct = a.total_days>0?Math.min(100,Math.round((a.current_day/a.total_days)*100)):0;
                    return (
                      <div key={a.id} className="rounded-2xl p-5"
                        style={{background:`${a.vrat_color||"#FF9800"}10`,border:`1.5px solid ${a.vrat_color||"#FF9800"}25`}}>
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{a.vrat_emoji||"🙏"}</span>
                          <div className="flex-1">
                            <p className="font-hindi font-black text-sm text-white">{a.vrat_name}</p>
                            <div className="flex gap-2 mt-0.5 text-[10px]">
                              <span className="text-green-400 font-bold">● Active</span>
                              <span className="text-gray-500">Day {a.current_day}{a.total_days>0?` / ${a.total_days}`:""}</span>
                            </div>
                            {a.total_days>0&&(
                              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.08)"}}>
                                <div className="h-full rounded-full" style={{width:`${pct}%`,background:a.vrat_color||"#FF9800"}}/>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-sans text-xs font-black text-amber-400">⭐{a.stars_earned}</p>
                            <p className="font-sans text-[10px] text-orange-400">🙏{a.anumodanas_count}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                {href:"/sanyam/vrat-db",    l:"Browse All Practices", e:"📚", c:"#9C27B0"},
                {href:"/sanyam/calendar",   l:"Jain Calendar",        e:"📅", c:"#FF9800"},
                {href:"/sanyam/feed",       l:"Activity Feed",        e:"🌟", c:"#4CAF50"},
                {href:"/sanyam/leaderboard",l:"Leaderboards",         e:"🏆", c:"#FFD700"},
                {href:"/academy",           l:"Jain Academy",         e:"🎓", c:"#2196F3"},
                {href:"/dashboard",         l:"My Dashboard",         e:"📊", c:"#607D8B"},
              ].map(l=>(
                <Link key={l.href} href={l.href}
                  className="rounded-2xl p-4 flex items-center gap-3 hover:scale-[1.02] transition-all"
                  style={{background:`${l.c}10`,border:`1.5px solid ${l.c}20`}}>
                  <span className="text-2xl">{l.e}</span>
                  <span className="font-sans font-black text-xs" style={{color:l.c}}>{l.l}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* MODULE VIEWS (Vrat / Tap / Tyag etc.) */}
        {MODULES.map(m=>activeModule===m.cat&&(
          <div key={m.cat} className="space-y-5">
            {/* Module header */}
            <div className="rounded-3xl p-6" style={{background:`${m.color}10`,border:`2px solid ${m.color}25`}}>
              <div className="flex items-center gap-4">
                <span className="text-5xl">{m.emoji}</span>
                <div className="flex-1">
                  <h2 className="font-sans font-black text-2xl text-white">{m.label}</h2>
                  <p className="font-hindi text-sm" style={{color:m.color}}>{m.labelHi} · {m.desc}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="font-display font-black text-2xl" style={{color:m.color}}>⭐{modScore(m.cat)}</span>
                    <span className="font-sans text-sm text-gray-400 self-end">{byCategory(m.cat).length} total practices</span>
                  </div>
                </div>
                <Link href={`/sanyam/vrat-db?cat=${m.cat}`}
                  className="px-4 py-2.5 rounded-2xl font-sans font-black text-xs text-white"
                  style={{background:`linear-gradient(135deg,${m.color},${m.color}99)`}}>
                  + Add {m.label}
                </Link>
              </div>
            </div>

            {/* Active in this module */}
            {byCategory(m.cat).filter(a=>a.status==="active").length>0&&(
              <div>
                <h3 className="font-sans font-black text-xs text-white/50 uppercase tracking-widest mb-3">Active Practices</h3>
                <div className="space-y-2">
                  {byCategory(m.cat).filter(a=>a.status==="active").map(a=>(
                    <div key={a.id} className="rounded-xl p-4 flex items-center gap-3"
                      style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
                      <span className="text-3xl">{a.vrat_emoji}</span>
                      <div className="flex-1">
                        <p className="font-hindi font-bold text-sm text-white">{a.vrat_name}</p>
                        <p className="font-sans text-[10px] text-green-400">● Day {a.current_day}{a.total_days>0?` / ${a.total_days}`:""} · Active since {a.start_date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-sans text-xs font-black text-amber-400">⭐{a.stars_earned}</p>
                        <p className="font-sans text-[9px] text-orange-400">🙏{a.anumodanas_count} anumodana</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed in this module */}
            {byCategory(m.cat).filter(a=>a.status==="completed").length>0&&(
              <div>
                <h3 className="font-sans font-black text-xs text-white/50 uppercase tracking-widest mb-3">Completed ✅</h3>
                <div className="space-y-2">
                  {byCategory(m.cat).filter(a=>a.status==="completed").map(a=>(
                    <div key={a.id} className="rounded-xl p-3 flex items-center gap-3"
                      style={{background:"rgba(76,175,80,0.06)",border:"1px solid rgba(76,175,80,0.12)"}}>
                      <span className="text-2xl">{a.vrat_emoji}</span>
                      <div className="flex-1">
                        <p className="font-hindi font-bold text-sm text-white/80">{a.vrat_name}</p>
                        <p className="font-sans text-[10px] text-green-500">✅ Completed · {a.start_date}</p>
                      </div>
                      <p className="font-sans text-xs font-black text-amber-400">⭐{a.stars_earned}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {byCategory(m.cat).length===0&&(
              <div className="rounded-2xl p-10 text-center"
                style={{background:"rgba(255,255,255,0.03)",border:"2px dashed rgba(255,255,255,0.08)"}}>
                <div className="text-5xl mb-4">{m.emoji}</div>
                <p className="font-sans font-bold text-white/60 mb-2">No {m.label} practices yet</p>
                <p className="font-sans text-xs text-gray-500 mb-6">{m.desc}</p>
                <Link href={`/sanyam/vrat-db?cat=${m.cat}`}
                  className="inline-block px-8 py-3 rounded-2xl font-sans font-black text-sm"
                  style={{background:`linear-gradient(135deg,${m.color},${m.color}99)`,color:"white"}}>
                  Start Your First {m.label} →
                </Link>
              </div>
            )}
          </div>
        ))}

        {/* TIMELINE */}
        {activeModule==="timeline"&&(
          <div className="space-y-4">
            <h2 className="font-sans font-black text-lg text-white mb-6">🏛️ Spiritual Timeline</h2>
            {activities.length===0 ? (
              <div className="rounded-2xl p-12 text-center" style={{border:"2px dashed rgba(255,255,255,0.1)"}}>
                <div className="text-5xl mb-4">🌸</div>
                <p className="font-sans text-white/40">Your spiritual journey timeline will appear here</p>
                <Link href="/sanyam/vrat-db" className="inline-block mt-4 px-6 py-3 rounded-full font-sans font-black text-sm text-white"
                  style={{background:"linear-gradient(135deg,#9C27B0,#7B1FA2)"}}>
                  Begin Your Journey →
                </Link>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-px" style={{background:"linear-gradient(180deg,#FFD700,rgba(255,215,0,0.1))"}}/>
                <div className="space-y-4">
                  {activities.map((a,i)=>(
                    <div key={a.id} className="flex items-start gap-5 pl-4">
                      {/* Node */}
                      <div className="relative shrink-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-base z-10 relative"
                          style={{background:a.status==="completed"?"#4CAF50":a.vrat_color||"#FF9800",boxShadow:`0 0 16px ${a.vrat_color||"#FF9800"}60`}}>
                          {a.status==="completed"?"✅":a.vrat_emoji}
                        </div>
                      </div>
                      {/* Content */}
                      <div className="flex-1 rounded-2xl p-4"
                        style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)"}}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-sans text-[9px] text-gray-500 uppercase tracking-widest mb-1">
                              {a.status==="completed"?"✅ Completed":"🔥 Active"} · {a.start_date}
                            </p>
                            <p className="font-hindi font-black text-sm text-white">{a.vrat_name}</p>
                            <p className="font-sans text-[10px] text-gray-500 mt-0.5 capitalize">{a.category}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-sans text-xs font-black text-amber-400">⭐{a.stars_earned}</p>
                            <p className="font-sans text-[9px] text-orange-400">🙏{a.anumodanas_count}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
