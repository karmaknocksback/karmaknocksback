"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

/* ══════════════════════════════════════════════════════════════
   SANYAM PROFILE — Complete Social Spiritual Network
   Instagram profile + Apple Health + Duolingo gamification
   STRICT CONTRAST: Dark text on light bg always
══════════════════════════════════════════════════════════════ */

interface Profile { display_name:string; avatar:string; bio:string|null; spiritual_score:number; vrat_score:number; tap_score:number; jaap_score:number; daan_score:number; swadhyay_score:number; yatra_score:number; total_vrats_completed:number; total_anumodanas_received:number; }
interface DayLog { log_type:string; count:number; duration_min:number; stars_earned:number; }
interface Enrollment { id:number; vrat_name:string; vrat_emoji:string; vrat_color:string; start_date:string; current_day:number; total_days:number; completion_pct:number; status:string; }
interface Badge { badge_key:string; name:string; name_hi:string; emoji:string; color:string; earned_at:string; }
interface AllBadge { key:string; name:string; name_hi:string; emoji:string; color:string; stars_reward:number; is_rare:number; }
interface FeedItem { id:number; display_name:string; avatar:string; feed_type:string; message:string; anumodanas:number; created_at:string; }
interface Streak { current_streak:number; longest_streak:number; }
interface Data { profile:Profile; todayLogs:DayLog[]; enrollments:Enrollment[]; badges:Badge[]; allBadges:AllBadge[]; streak:Streak; feed:FeedItem[]; todayStars:number; }

// Levels
const LEVELS = [
  {name:"Seeker",    nameHi:"जिज्ञासु",  emoji:"🌱", min:0,     color:"#16A34A"},
  {name:"Shravak",   nameHi:"श्रावक",    emoji:"🙏", min:500,   color:"#2563EB"},
  {name:"Sadhak",    nameHi:"साधक",      emoji:"🧘", min:2000,  color:"#7C3AED"},
  {name:"Tapasvi",   nameHi:"तपस्वी",   emoji:"🔥", min:5000,  color:"#DC2626"},
  {name:"Vrati",     nameHi:"व्रती",    emoji:"💎", min:10000, color:"#0891B2"},
  {name:"Dharmatma", nameHi:"धर्मात्मा",emoji:"⭐", min:25000, color:"#D97706"},
  {name:"Sanpanna",  nameHi:"संपन्न",   emoji:"🌟", min:50000, color:"#DB2777"},
  {name:"Jain Seva", nameHi:"जैन सेवा", emoji:"🕉️", min:100000,color:"#6D28D9"},
];
function getLevel(s:number) {
  let lv=LEVELS[0]; for(const l of LEVELS) if(s>=l.min) lv=l;
  const idx=LEVELS.indexOf(lv); const next=LEVELS[idx+1];
  const pct=next?Math.min(100,Math.round(((s-lv.min)/(next.min-lv.min))*100)):100;
  return {...lv,pct,next,idx};
}

// Big Apple Watch style ring
function BigRing({done,total,color}:{done:number;total:number;color:string}) {
  const pct=total?(done/total)*100:0;const size=156;const stroke=14;const r=(size-stroke)/2;
  const circ=2*Math.PI*r;const dash=(pct/100)*circ;
  return (
    <div className="relative flex items-center justify-center" style={{width:size,height:size}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
          style={{transition:"stroke-dasharray 1s ease",filter:`drop-shadow(0 0 6px ${color}60)`}}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-sans font-black text-3xl text-gray-900">{done}</p>
        <p className="font-sans text-xs text-gray-500">of {total}</p>
      </div>
    </div>
  );
}

// Small ring
function SmallRing({pct,color,emoji,done}:{pct:number;color:string;emoji:string;done:boolean}) {
  const s=50;const str=5;const r=(s-str)/2;const c=2*Math.PI*r;
  return (
    <div className="relative flex items-center justify-center" style={{width:s,height:s}}>
      <svg width={s} height={s} style={{transform:"rotate(-90deg)"}}>
        <circle cx={s/2} cy={s/2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={str}/>
        {pct>0&&<circle cx={s/2} cy={s/2} r={r} fill="none" stroke={color} strokeWidth={str}
          strokeLinecap="round" strokeDasharray={`${(pct/100)*c} ${c}`} style={{transition:"stroke-dasharray 0.8s"}}/>}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span style={{fontSize:20,filter:done?"none":"grayscale(0.7) opacity(0.5)"}}>{emoji}</span>
      </div>
    </div>
  );
}

// Log modal
const LOG_META:{[k:string]:{emoji:string;label:string;hi:string;color:string;bg:string;hasCount?:boolean;hasDur?:boolean;defCount:number;defDur:number}} = {
  samayik: {emoji:"🧘",label:"Log Samayik",   hi:"सामायिक दर्ज करें",color:"#2563EB",bg:"#EFF6FF",hasDur:true,  defCount:1,  defDur:48},
  jaap:    {emoji:"📿",label:"Log Jaap",       hi:"नवकार जाप",        color:"#7C3AED",bg:"#F5F3FF",hasCount:true,defCount:108,defDur:0},
  temple:  {emoji:"🛕",label:"Temple Visit",   hi:"मंदिर दर्शन",      color:"#D97706",bg:"#FFFBEB",defCount:1,  defDur:0},
  swadhyay:{emoji:"📖",label:"Log Swadhyay",  hi:"स्वाध्याय",        color:"#16A34A",bg:"#F0FDF4",hasDur:true,  defCount:1,  defDur:60},
  donation:{emoji:"💝",label:"Log Donation",   hi:"दान दर्ज करें",    color:"#DB2777",bg:"#FDF2F8",defCount:1,  defDur:0},
  tap:     {emoji:"🔥",label:"Log Tap",        hi:"तप",               color:"#DC2626",bg:"#FEF2F2",defCount:1,  defDur:0},
};
function LogModal({type,onClose,onLog}:{type:string;onClose:()=>void;onLog:(c:number,d:number)=>Promise<void>}) {
  const m=LOG_META[type]||LOG_META.samayik;
  const [count,setCount]=useState(m.defCount);const [dur,setDur]=useState(m.defDur);const [saving,setSaving]=useState(false);
  async function sub(){setSaving(true);await onLog(count,dur);setSaving(false);onClose();}
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)"}}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl" style={{background:"white",border:`3px solid ${m.color}20`}}>
        <div className="px-6 py-5 text-center" style={{background:m.bg,borderBottom:`2px solid ${m.color}20`}}>
          <div className="text-5xl mb-2">{m.emoji}</div>
          <p className="font-sans font-black text-xl text-gray-900">{m.label}</p>
          <p className="font-hindi text-sm text-gray-600">{m.hi}</p>
        </div>
        <div className="p-5 space-y-4">
          {m.hasCount&&<div>
            <p className="font-sans text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">जाप संख्या</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {[27,54,108,216,1008].map(n=>(
                <button key={n} onClick={()=>setCount(n)} className="rounded-2xl px-4 py-2 font-sans font-black text-sm transition-all"
                  style={{background:count===n?m.color:"#F3F4F6",color:count===n?"white":"#374151",border:"none"}}>
                  {n}
                </button>
              ))}
            </div>
          </div>}
          {m.hasDur&&<div>
            <p className="font-sans text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">अवधि (मिनट)</p>
            <div className="flex gap-2 justify-center">
              {[24,48,72,96].map(n=>(
                <button key={n} onClick={()=>setDur(n)} className="rounded-2xl px-4 py-2 font-sans font-black text-sm transition-all"
                  style={{background:dur===n?m.color:"#F3F4F6",color:dur===n?"white":"#374151",border:"none"}}>
                  {n}m
                </button>
              ))}
            </div>
          </div>}
          <button onClick={sub} disabled={saving}
            className="w-full py-4 rounded-2xl font-sans font-black text-base text-white mt-2"
            style={{background:m.color,boxShadow:`0 8px 24px ${m.color}40`}}>
            {saving?"Saving…":`✓ ${m.label}`}
          </button>
          <button onClick={onClose} className="w-full py-2 font-sans text-sm text-gray-400">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN PROFILE PAGE
// ════════════════════════════════════════════════════════════
export default function SanyamProfilePage() {
  const [data,    setData]    = useState<Data|null>(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<"overview"|"vrats"|"timeline"|"badges"|"feed">("overview");
  const [modal,   setModal]   = useState<string|null>(null);

  const load = useCallback(async()=>{
    // Show cached data INSTANTLY
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("sanyam_prof");
        if (cached) {
          const d = JSON.parse(cached);
          setData(d); setLoading(false);
        }
      } catch {}
    }
    // Fetch fresh in background
    try {
      const r = await fetch("/api/sanyam/profile");
      const d = await r.json();
      setData(d); setLoading(false);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("sanyam_prof", JSON.stringify(d));
      }
    } catch (e) { setLoading(false); }
  },[]);
  useEffect(()=>{ load(); },[load]);

  async function logActivity(type:string,count:number,dur:number) {
    await fetch("/api/sanyam/profile",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"log_activity",log_type:type,count,duration_min:dur})});
    await load();
  }

  async function giveAnumodana(feedId:number) {
    await fetch("/api/sanyam/anumodana",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({feedId})});
    await load();
  }

  if (loading) return (
    <div className="min-h-screen bg-white" style={{background:"#F8FAFC"}}>
      {/* Skeleton loader */}
      <div className="sticky top-0 z-40 px-4 py-3 bg-white shadow-sm" style={{borderBottom:"2px solid #F1F5F9"}}>
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse"/>
          <div className="h-4 w-32 rounded bg-gray-200 animate-pulse"/>
          <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse"/>
        </div>
      </div>
      <div className="max-w-xl mx-auto px-4 pt-6 space-y-4">
        {/* Hero skeleton */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-md" style={{border:"1px solid #E2E8F0"}}>
          <div className="h-24 animate-pulse bg-gradient-to-r from-gray-100 to-gray-200"/>
          <div className="px-5 pb-5 pt-2">
            <div className="w-20 h-20 rounded-2xl bg-gray-200 animate-pulse -mt-10 mb-3"/>
            <div className="h-6 w-1/2 rounded bg-gray-200 animate-pulse mb-2"/>
            <div className="h-4 w-1/3 rounded bg-gray-100 animate-pulse mb-3"/>
            <div className="grid grid-cols-4 gap-2">
              {[1,2,3,4].map(i=><div key={i} className="h-10 rounded-xl bg-gray-100 animate-pulse"/>)}
            </div>
          </div>
        </div>
        {/* Progress skeleton */}
        <div className="bg-white rounded-3xl p-5 shadow-md" style={{border:"1px solid #E2E8F0"}}>
          <div className="h-5 w-40 rounded bg-gray-200 animate-pulse mb-4"/>
          <div className="flex items-center gap-4">
            <div className="w-40 h-40 rounded-full bg-gray-100 animate-pulse"/>
            <div className="flex-1 space-y-2">
              {[1,2,3].map(i=><div key={i} className="h-4 rounded bg-gray-100 animate-pulse"/>)}
            </div>
          </div>
        </div>
        {/* Actions skeleton */}
        <div className="bg-white rounded-3xl p-5 shadow-md" style={{border:"1px solid #E2E8F0"}}>
          <div className="h-5 w-32 rounded bg-gray-200 animate-pulse mb-4"/>
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3,4,5,6].map(i=><div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse"/>)}
          </div>
        </div>
        <p className="text-center font-hindi text-amber-500 text-sm animate-pulse">साधना पथ लोड हो रहा है... 🕉️</p>
      </div>
    </div>
  );
  if (!data) return null;

  const {profile,todayLogs,enrollments,badges,allBadges,streak,feed,todayStars}=data;
  const level   = getLevel(profile.spiritual_score||0);
  const todayMap = Object.fromEntries(todayLogs.map(l=>[l.log_type,l]));
  const ACTS     = ["samayik","jaap","temple","swadhyay","donation","tap"];
  const doneToday = ACTS.filter(a=>!!todayMap[a]).length;
  const jaapPct   = Math.min(100,Math.round(((todayMap.jaap?.count||0)/108)*100));

  return (
    <div className="min-h-screen pb-24" style={{background:"#F8FAFC"}}>

      {/* ── TOP BAR ── */}
      <div className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between bg-white shadow-sm" style={{borderBottom:"2px solid #F1F5F9"}}>
        <Link href="/sanyam" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold hover:bg-gray-200">←</Link>
        <p className="font-sans font-black text-base text-gray-900">My Sanyam Profile</p>
        <div className="flex gap-2">
          <Link href="/sanyam/feed" className="rounded-xl px-3 py-2 font-sans font-black text-xs text-white" style={{background:"#F59E0B"}}>🌿 Feed</Link>
          <Link href="/sanyam/leaderboard" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-sm hover:bg-gray-200">🏆</Link>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-6 space-y-4">

        {/* ── HERO PROFILE CARD ── */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-md" style={{border:"1px solid #E2E8F0"}}>
          {/* Cover gradient */}
          <div className="h-24 relative" style={{background:`linear-gradient(135deg,${level.color}30,${level.color}10,#EFF6FF)`}}>
            <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle,#000 1px,transparent 1px)",backgroundSize:"20px 20px"}}/>
          </div>

          <div className="px-5 pb-5 -mt-10 relative">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl shadow-lg mb-3"
              style={{background:"white",border:`4px solid ${level.color}`,boxShadow:`0 8px 24px ${level.color}30`}}>
              {profile.avatar||"🧘"}
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-sans font-black text-2xl text-gray-900">{profile.display_name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="rounded-full px-3 py-1 font-sans font-black text-xs text-white" style={{background:level.color}}>
                    {level.emoji} {level.nameHi}
                  </span>
                  <span className="font-sans text-sm font-bold text-amber-600">⭐ {(profile.spiritual_score||0).toLocaleString()}</span>
                </div>
                {profile.bio && <p className="font-hindi text-sm text-gray-600 mt-1">{profile.bio}</p>}
              </div>
              <Link href="/sanyam/profile" className="rounded-xl border-2 border-gray-200 px-3 py-1.5 font-sans font-bold text-xs text-gray-700">Edit</Link>
            </div>

            {/* Level bar */}
            <div className="mt-3">
              <div className="flex justify-between mb-1">
                <span className="font-sans text-[10px] font-bold text-gray-500">{level.pct}% to {level.next?.emoji} {level.next?.name||"Max"}</span>
                <span className="font-sans text-[10px] font-bold" style={{color:level.color}}>{level.name}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full" style={{width:`${level.pct}%`,background:level.color,transition:"width 1s ease"}}/>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2 mt-4 pt-3" style={{borderTop:"1px solid #F1F5F9"}}>
              {[
                {v:profile.spiritual_score||0,l:"Points",c:"#D97706"},
                {v:streak.current_streak||0,  l:"🔥 Streak",c:"#DC2626"},
                {v:badges.length,              l:"Badges",c:"#7C3AED"},
                {v:profile.total_vrats_completed||0,l:"Vrats",c:"#16A34A"},
              ].map(s=>(
                <div key={s.l} className="text-center">
                  <p className="font-sans font-black text-lg" style={{color:s.c}}>{typeof s.v==="number"?s.v.toLocaleString():s.v}</p>
                  <p className="font-sans text-[10px] text-gray-500 font-bold">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TODAY'S DHARMA ── */}
        <div className="bg-white rounded-3xl p-5 shadow-md" style={{border:"1px solid #E2E8F0"}}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-sans font-black text-base text-gray-900">🟢 Today's Dharma</p>
              <p className="font-hindi text-xs text-gray-500">आज का धर्म आचरण</p>
            </div>
            {todayStars>0&&<div className="rounded-xl px-3 py-1.5 font-sans font-black text-sm" style={{background:"#FFFBEB",color:"#D97706",border:"1px solid #FDE68A"}}>⭐ {todayStars} pts</div>}
          </div>
          <div className="flex items-center gap-4">
            <BigRing done={doneToday} total={ACTS.length} color={level.color}/>
            <div className="flex-1">
              <p className="font-sans font-black text-lg text-gray-900 mb-3">{doneToday}/{ACTS.length} Done</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  {type:"samayik",emoji:"🧘",color:"#2563EB"},
                  {type:"jaap",   emoji:"📿",color:"#7C3AED"},
                  {type:"swadhyay",emoji:"📖",color:"#16A34A"},
                  {type:"temple", emoji:"🛕",color:"#D97706"},
                  {type:"tap",    emoji:"🔥",color:"#DC2626"},
                ].map(a=>(
                  <SmallRing key={a.type} pct={a.type==="jaap"?jaapPct:todayMap[a.type]?100:0} color={a.color} emoji={a.emoji} done={!!todayMap[a.type]}/>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div className="bg-white rounded-3xl p-5 shadow-md" style={{border:"1px solid #E2E8F0"}}>
          <p className="font-sans font-black text-base text-gray-900 mb-1">⚡ Quick Log</p>
          <p className="font-hindi text-xs text-gray-500 mb-4">साधना दर्ज करें</p>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(LOG_META).map(([type,m])=>(
              <button key={type} onClick={()=>setModal(type)}
                className="rounded-2xl p-4 text-center transition-all active:scale-95 hover:shadow-md relative"
                style={{background:todayMap[type]?m.bg:"#F8FAFC",border:`2px solid ${todayMap[type]?m.color+"50":"#E2E8F0"}`}}>
                {todayMap[type]&&<span className="absolute top-1.5 right-1.5 text-[10px]">✅</span>}
                <div className="text-3xl mb-1.5">{m.emoji}</div>
                <p className="font-sans font-black text-[11px]" style={{color:todayMap[type]?m.color:"#374151"}}>{m.label.replace("Log ","")}</p>
                <p className="font-hindi text-[9px]" style={{color:todayMap[type]?m.color:"#6B7280"}}>{m.hi.split(" ")[0]}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="bg-white rounded-2xl p-1.5 shadow-sm flex gap-1" style={{border:"1px solid #E2E8F0"}}>
          {[
            {id:"overview", l:"Overview",emoji:"📊"},
            {id:"vrats",    l:"Vrats",   emoji:"🙏"},
            {id:"timeline", l:"Journey", emoji:"📅"},
            {id:"badges",   l:"Badges",  emoji:"🏆"},
            {id:"feed",     l:"Feed",    emoji:"🌿"},
          ].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as typeof tab)}
              className="flex-1 rounded-xl py-2 font-sans font-black text-xs transition-all"
              style={{
                background:tab===t.id?level.color:"transparent",
                color:tab===t.id?"white":"#6B7280",
              }}>
              {t.emoji} {t.l}
            </button>
          ))}
        </div>

        {/* ════ OVERVIEW ════ */}
        {tab==="overview"&&(<>
          {/* Category scores */}
          <div className="bg-white rounded-3xl p-5 shadow-md" style={{border:"1px solid #E2E8F0"}}>
            <p className="font-sans font-black text-base text-gray-900 mb-4">Dharma Categories</p>
            {[
              {k:"vrat",     hi:"व्रत",     s:profile.vrat_score||0,     c:"#7C3AED"},
              {k:"tap",      hi:"तप",       s:profile.tap_score||0,      c:"#DC2626"},
              {k:"jaap",     hi:"जाप",      s:profile.jaap_score||0,     c:"#7C3AED"},
              {k:"swadhyay", hi:"स्वाध्याय",s:profile.swadhyay_score||0,c:"#16A34A"},
              {k:"daan",     hi:"दान",      s:profile.daan_score||0,     c:"#DB2777"},
            ].map(c=>{
              const max=Math.max(profile.vrat_score||1,profile.tap_score||1,profile.jaap_score||1,profile.swadhyay_score||1,profile.daan_score||1);
              return (
                <div key={c.k} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="font-hindi text-sm font-bold text-gray-700">{c.hi}</span>
                    <span className="font-sans text-xs font-bold" style={{color:c.c}}>⭐{c.s}</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{background:"#F1F5F9"}}>
                    <div className="h-full rounded-full" style={{width:`${max?Math.round((c.s/max)*100):0}%`,background:c.c,transition:"width 1s"}}/>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Lifetime stats */}
          <div className="bg-white rounded-3xl p-5 shadow-md" style={{border:"1px solid #E2E8F0"}}>
            <p className="font-sans font-black text-base text-gray-900 mb-4">📈 Lifetime Statistics</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                {e:"🙏",l:"Total Vrats",v:profile.total_vrats_completed||0,c:"#7C3AED"},
                {e:"🔥",l:"Tap Days",   v:Math.round((profile.tap_score||0)/10),c:"#DC2626"},
                {e:"📿",l:"Jaap Count", v:Math.round((profile.jaap_score||0)/2),c:"#7C3AED"},
                {e:"🧘",l:"Samayik",    v:Math.round((profile.swadhyay_score||0)/5),c:"#2563EB"},
                {e:"📖",l:"Swadhyay hrs",v:Math.round((profile.swadhyay_score||0)/8),c:"#16A34A"},
                {e:"💝",l:"Daan Pts",   v:profile.daan_score||0,c:"#DB2777"},
              ].map(s=>(
                <div key={s.l} className="rounded-2xl p-3 flex items-center gap-3" style={{background:"#F8FAFC",border:"1px solid #E2E8F0"}}>
                  <span className="text-2xl">{s.e}</span>
                  <div>
                    <p className="font-sans font-black text-base text-gray-900">{s.v.toLocaleString()}</p>
                    <p className="font-sans text-[10px] text-gray-500 font-bold">{s.l}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>)}

        {/* ════ VRATS ════ */}
        {tab==="vrats"&&(
          <div className="space-y-3">
            {enrollments.filter(e=>e.status==="active").length===0?(
              <div className="bg-white rounded-3xl p-8 text-center shadow-md" style={{border:"1px solid #E2E8F0"}}>
                <div className="text-5xl mb-3">🙏</div>
                <p className="font-sans font-black text-gray-900 mb-2">No Active Vrats</p>
                <p className="font-hindi text-sm text-gray-500 mb-5">अभी कोई व्रत सक्रिय नहीं है</p>
                <Link href="/sanyam/vrat-db" className="inline-block rounded-2xl px-6 py-3 font-sans font-black text-sm text-white" style={{background:"linear-gradient(135deg,#F59E0B,#D97706)"}}>
                  🙏 Browse & Start a Vrat
                </Link>
              </div>
            ):enrollments.filter(e=>e.status==="active").map(e=>(
              <div key={e.id} className="bg-white rounded-2xl p-4 shadow-sm" style={{border:`2px solid ${e.vrat_color||"#16A34A"}20`}}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-hindi font-black text-base text-gray-900">{e.vrat_emoji} {e.vrat_name}</p>
                  <span className="font-sans text-xs font-bold" style={{color:e.vrat_color||"#16A34A"}}>Day {e.current_day||1}/{e.total_days}</span>
                </div>
                <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full" style={{width:`${e.completion_pct||0}%`,background:e.vrat_color||"#16A34A"}}/>
                </div>
                <p className="font-sans text-xs text-gray-500 mt-1">{e.completion_pct||0}% complete</p>
              </div>
            ))}
            <Link href="/sanyam/vrat-db" className="flex items-center justify-center gap-2 rounded-2xl py-4 font-sans font-black text-base text-white shadow-lg" style={{background:"linear-gradient(135deg,#F59E0B,#D97706)"}}>
              + Start a New Vrat →
            </Link>
          </div>
        )}

        {/* ════ TIMELINE ════ */}
        {tab==="timeline"&&(
          <div className="bg-white rounded-3xl p-5 shadow-md" style={{border:"1px solid #E2E8F0"}}>
            <p className="font-sans font-black text-base text-gray-900 mb-4">📅 Today's Journey</p>
            {todayLogs.length===0?(
              <div className="text-center py-6">
                <p className="font-hindi text-gray-500">आज की साधना दर्ज करें</p>
              </div>
            ):todayLogs.map((l,i)=>{
              const IC:{[k:string]:{e:string;c:string;hi:string}}={
                samayik:{e:"🧘",c:"#2563EB",hi:"सामायिक"},jaap:{e:"📿",c:"#7C3AED",hi:`${l.count} जाप`},
                temple:{e:"🛕",c:"#D97706",hi:"मंदिर दर्शन"},swadhyay:{e:"📖",c:"#16A34A",hi:"स्वाध्याय"},
                donation:{e:"💝",c:"#DB2777",hi:"दान"},tap:{e:"🔥",c:"#DC2626",hi:"तप"},
              };
              const ic=IC[l.log_type]||{e:"🙏",c:"#D97706",hi:"साधना"};
              return (
                <div key={i} className="flex gap-3 mb-4 relative">
                  {i<todayLogs.length-1&&<div className="absolute left-4 top-9 bottom-0 w-0.5" style={{background:"#E2E8F0"}}/>}
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10" style={{background:`${ic.c}10`,border:`2px solid ${ic.c}30`}}>
                    <span style={{fontSize:16}}>{ic.e}</span>
                  </div>
                  <div className="pt-1">
                    <p className="font-hindi font-black text-sm text-gray-900">{ic.hi} पूर्ण</p>
                    <p className="font-sans text-xs text-gray-500 mt-0.5">⭐{l.stars_earned}{l.duration_min>0?` · ${l.duration_min}min`:""}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ════ BADGES ════ */}
        {tab==="badges"&&(
          <div className="space-y-4">
            {badges.length>0&&(
              <div className="bg-white rounded-3xl p-5 shadow-md" style={{border:"1px solid #E2E8F0"}}>
                <p className="font-sans font-black text-base text-gray-900 mb-4">🏆 Earned Badges</p>
                <div className="grid grid-cols-3 gap-3">
                  {badges.map(b=>(
                    <div key={b.badge_key} className="rounded-2xl p-3 text-center" style={{background:`${b.color}10`,border:`2px solid ${b.color}30`}}>
                      <div className="text-4xl mb-1">{b.emoji}</div>
                      <p className="font-hindi font-black text-xs" style={{color:b.color}}>{b.name_hi}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-white rounded-3xl p-5 shadow-md" style={{border:"1px solid #E2E8F0"}}>
              <p className="font-sans font-black text-base text-gray-900 mb-4">All Badges</p>
              <div className="grid grid-cols-3 gap-3">
                {allBadges.map(b=>{
                  const earned=badges.some(e=>e.badge_key===b.key);
                  return (
                    <div key={b.key} className={`rounded-2xl p-3 text-center ${earned?"":"opacity-40"}`}
                      style={{background:earned?`${b.color}10`:"#F8FAFC",border:`2px solid ${earned?b.color+"30":"#E2E8F0"}`}}>
                      <div className="text-4xl mb-1" style={{filter:earned?"none":"grayscale(1)"}}>{b.emoji}</div>
                      <p className="font-hindi font-black text-xs" style={{color:earned?b.color:"#6B7280"}}>{b.name_hi}</p>
                      <p className="font-sans text-[9px] text-gray-400">⭐{b.stars_reward}</p>
                      {b.is_rare===1&&<p className="font-sans text-[8px] font-black text-amber-600">RARE</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════ FEED ════ */}
        {tab==="feed"&&(
          <div className="space-y-4">
            <Link href="/sanyam/feed" className="flex items-center justify-center gap-2 rounded-2xl py-4 font-sans font-black text-base text-white shadow-lg" style={{background:"linear-gradient(135deg,#16A34A,#15803D)"}}>
              🌿 Open Community Feed →
            </Link>
            {feed.slice(0,5).map(f=>(
              <div key={f.id} className="bg-white rounded-2xl p-4 shadow-sm" style={{border:"1px solid #E2E8F0"}}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl shrink-0">{f.avatar||"🧘"}</div>
                  <div className="flex-1">
                    <p className="font-sans text-sm text-gray-800">{f.message}</p>
                    <p className="font-sans text-[10px] text-gray-400 mt-1">{new Date(f.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</p>
                    <button onClick={()=>giveAnumodana(f.id)}
                      className="mt-2 rounded-full px-3 py-1 font-sans font-bold text-xs text-amber-700 bg-amber-50 border border-amber-200">
                      🙏 {f.anumodanas||0} Anumodana
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal&&<LogModal type={modal} onClose={()=>setModal(null)} onLog={(c,d)=>logActivity(modal,c,d)}/>}
    </div>
  );
}
