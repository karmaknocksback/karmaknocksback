"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

/* ══════════════════════════════════════════════════════════════
   SANYAM PROFILE — Instagram + Apple Fitness + Duolingo
   Light warm theme · Single big ring · Social feed
   Color Palette: Warm off-white bg, Gold, Emerald, Saffron, Blue
══════════════════════════════════════════════════════════════ */

// ── Types ─────────────────────────────────────────────────────
interface Profile {
  display_name:string; avatar:string; bio:string|null;
  spiritual_score:number; vrat_score:number; tap_score:number;
  jaap_score:number; daan_score:number; swadhyay_score:number;
  yatra_score:number;
  total_vrats_completed:number; total_anumodanas_received:number;
}
interface DayLog { log_type:string; count:number; duration_min:number; stars_earned:number; }
interface Enrollment { id:number; vrat_name:string; vrat_emoji:string; vrat_color:string; start_date:string; end_date:string; current_day:number; total_days:number; completion_pct:number; status:string; }
interface Badge { badge_key:string; name:string; name_hi:string; emoji:string; color:string; description:string; earned_at:string; }
interface AllBadge { key:string; name:string; name_hi:string; emoji:string; color:string; description:string; stars_reward:number; is_rare:number; }
interface FeedItem { id:number; display_name:string; avatar:string; feed_type:string; message:string; anumodanas:number; created_at:string; }
interface Streak { current_streak:number; longest_streak:number; samayik_streak:number; }
interface Data { profile:Profile; todayLogs:DayLog[]; enrollments:Enrollment[]; badges:Badge[]; allBadges:AllBadge[]; streak:Streak; feed:FeedItem[]; todayStars:number; }

// ── Levels ────────────────────────────────────────────────────
const LEVELS = [
  { name:"Seeker",    nameHi:"साधक",     emoji:"🌱", min:0,     color:"#34D399" },
  { name:"Shravak",   nameHi:"श्रावक",   emoji:"🙏", min:500,   color:"#3B82F6" },
  { name:"Sadhak",    nameHi:"साधक",     emoji:"🧘", min:2000,  color:"#8B5CF6" },
  { name:"Tapasvi",   nameHi:"तपस्वी",  emoji:"🔥", min:5000,  color:"#F97316" },
  { name:"Vrati",     nameHi:"व्रती",   emoji:"💎", min:10000, color:"#06B6D4" },
  { name:"Dharmatma", nameHi:"धर्मात्मा",emoji:"⭐", min:25000, color:"#F59E0B" },
  { name:"Sanpanna",  nameHi:"संपन्न",   emoji:"🌟", min:50000, color:"#EC4899" },
  { name:"Jain Seva", nameHi:"जैन सेवा",emoji:"🕉️", min:100000,color:"#6366F1" },
];
function getLevel(score:number) {
  let lv = LEVELS[0];
  for (const l of LEVELS) if (score >= l.min) lv = l;
  const idx  = LEVELS.indexOf(lv);
  const next = LEVELS[idx+1];
  const pct  = next ? Math.min(100,Math.round(((score-lv.min)/(next.min-lv.min))*100)) : 100;
  return { ...lv, pct, next, idx };
}

// ── Big circular progress ring ─────────────────────────────────
function BigRing({ done, total, color }: { done:number; total:number; color:string }) {
  const pct  = total ? (done/total)*100 : 0;
  const size = 160;
  const stroke = 14;
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{width:size,height:size}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
          style={{transition:"stroke-dasharray 1s ease",filter:`drop-shadow(0 0 8px ${color}80)`}}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-sans font-black text-3xl text-gray-800">{done}</p>
        <p className="font-sans text-xs text-gray-400">of {total}</p>
        <p className="font-hindi text-[10px] text-gray-400">पूर्ण</p>
      </div>
    </div>
  );
}

// ── Small activity ring ────────────────────────────────────────
function SmallRing({ pct, color, emoji, label }: { pct:number; color:string; emoji:string; label:string }) {
  const size=52; const stroke=5; const r=(size-stroke)/2;
  const circ=2*Math.PI*r; const dash=(pct/100)*circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{width:size,height:size}}>
        <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={stroke}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={pct>0?color:"#E5E7EB"} strokeWidth={stroke}
            strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} style={{transition:"stroke-dasharray 0.8s ease"}}/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{fontSize:18,filter:pct===0?"grayscale(1) opacity(0.3)":"none"}}>{emoji}</span>
        </div>
      </div>
      <p className="font-hindi text-[8px] text-gray-400">{label}</p>
    </div>
  );
}

// ── Log Modal ─────────────────────────────────────────────────
const LOG_META: Record<string,{emoji:string;label:string;hi:string;color:string;hasCount?:boolean;hasDur?:boolean;defaultCount?:number}> = {
  samayik:  {emoji:"🧘",label:"Log Samayik",   hi:"सामायिक",   color:"#3B82F6",hasDur:true,defaultCount:1},
  jaap:     {emoji:"📿",label:"Log Jaap",       hi:"नवकार जाप", color:"#8B5CF6",hasCount:true,defaultCount:108},
  temple:   {emoji:"🛕",label:"Temple Visit",   hi:"मंदिर दर्शन",color:"#F97316",defaultCount:1},
  swadhyay: {emoji:"📖",label:"Log Swadhyay",  hi:"स्वाध्याय", color:"#10B981",hasDur:true,defaultCount:1},
  donation: {emoji:"💝",label:"Log Donation",   hi:"दान",        color:"#EC4899",defaultCount:1},
  tap:      {emoji:"🔥",label:"Log Tap/Upvas",  hi:"तप",         color:"#F97316",defaultCount:1},
};

function LogModal({ type, onClose, onLog }: { type:string; onClose:()=>void; onLog:(c:number,d:number)=>Promise<void> }) {
  const m = LOG_META[type] || LOG_META.samayik;
  const [count, setCount] = useState(m.defaultCount||1);
  const [dur,   setDur]   = useState(48);
  const [saving,setSaving] = useState(false);
  async function submit() { setSaving(true); await onLog(count,dur); setSaving(false); onClose(); }
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)"}}>
      <div className="w-full max-w-sm rounded-3xl p-6 shadow-2xl" style={{background:"#FEFEF8",border:`2px solid ${m.color}30`}}>
        <div className="text-center mb-5">
          <div className="text-5xl mb-2">{m.emoji}</div>
          <p className="font-sans font-black text-xl text-gray-800">{m.label}</p>
          <p className="font-hindi text-sm text-gray-400">{m.hi}</p>
        </div>
        {m.hasCount && (
          <div className="mb-4">
            <p className="font-sans text-xs text-gray-500 font-bold uppercase tracking-wider text-center mb-2">Jaap Count</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {[27,54,108,216,1008].map(n=>(
                <button key={n} onClick={()=>setCount(n)}
                  className="rounded-2xl px-4 py-2 font-sans font-black text-sm transition-all"
                  style={{background:count===n?m.color:"#F3F4F6",color:count===n?"white":"#6B7280"}}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}
        {m.hasDur && (
          <div className="mb-4">
            <p className="font-sans text-xs text-gray-500 font-bold uppercase tracking-wider text-center mb-2">Duration</p>
            <div className="flex gap-2 justify-center">
              {[24,48,72,96].map(n=>(
                <button key={n} onClick={()=>setDur(n)}
                  className="rounded-2xl px-4 py-2 font-sans font-black text-sm transition-all"
                  style={{background:dur===n?m.color:"#F3F4F6",color:dur===n?"white":"#6B7280"}}>
                  {n}m
                </button>
              ))}
            </div>
          </div>
        )}
        <button onClick={submit} disabled={saving}
          className="w-full py-4 rounded-2xl font-sans font-black text-base text-white shadow-lg mt-2 transition-all active:scale-95"
          style={{background:m.color,boxShadow:`0 8px 24px ${m.color}40`}}>
          {saving ? "Saving…" : `✓ Log ${m.label}`}
        </button>
        <button onClick={onClose} className="w-full py-2 mt-2 font-sans text-sm text-gray-400 hover:text-gray-600">Cancel</button>
      </div>
    </div>
  );
}

// ── Card wrapper ───────────────────────────────────────────────
function Card({ children, className="", style }: { children:React.ReactNode; className?:string; style?:React.CSSProperties }) {
  return (
    <div className={`bg-white rounded-3xl p-5 shadow-sm border border-gray-100 ${className}`} style={style}>
      {children}
    </div>
  );
}

function SectionTitle({ emoji, title, hi, action, onAction }: { emoji:string; title:string; hi:string; action?:string; onAction?:()=>void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="font-sans font-black text-base text-gray-800">{emoji} {title}</p>
        <p className="font-hindi text-[10px] text-gray-400">{hi}</p>
      </div>
      {action && <button onClick={onAction} className="font-sans text-xs text-amber-600 font-bold">{action} →</button>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
export default function SanyamProfilePage() {
  const [data,    setData]    = useState<Data|null>(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<"overview"|"vrats"|"timeline"|"badges"|"activity"|"social">("overview");
  const [modal,   setModal]   = useState<string|null>(null);
  const [editMode,setEditMode]= useState(false);
  const [editAvatar, setEditAvatar] = useState("");
  const [editName,   setEditName]   = useState("");

  const load = useCallback(async()=>{
    const r = await fetch("/api/sanyam/profile");
    const d = await r.json();
    setData(d);
    setEditAvatar(d.profile?.avatar || "🧘");
    setEditName(d.profile?.display_name || "");
    setLoading(false);
  },[]);

  useEffect(()=>{ load(); },[load]);

  async function logActivity(type:string, count:number, dur:number) {
    await fetch("/api/sanyam/profile",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"log_activity",log_type:type,count,duration_min:dur})
    });
    await load();
  }

  async function saveProfile() {
    await fetch("/api/sanyam/profile",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"update_profile",display_name:editName,avatar:editAvatar})
    });
    setEditMode(false);
    await load();
  }

  async function giveAnumodana(feedId:number) {
    await fetch("/api/sanyam/anumodana",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({feedId})});
    await load();
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-pg-sanyam transition-theme">
      <div className="text-center">
        <div className="text-5xl animate-bounce mb-3">🕉️</div>
        <p className="font-hindi text-amber-600 animate-pulse">साधना पथ लोड हो रहा है...</p>
      </div>
    </div>
  );

  if (!data) return null;
  const { profile, todayLogs, enrollments, badges, allBadges, streak, feed, todayStars } = data;
  const level   = getLevel(profile.spiritual_score || 0);
  const todayMap = Object.fromEntries(todayLogs.map(l=>[l.log_type, l]));
  const DAILY_ACTIVITIES = ["samayik","jaap","temple","swadhyay","donation","tap"];
  const doneToday = DAILY_ACTIVITIES.filter(a => !!todayMap[a]).length;
  const jaapPct   = Math.min(100, Math.round(((todayMap.jaap?.count||0)/108)*100));
  const streakEmoji = streak.current_streak >= 100 ? "🌟" : streak.current_streak >= 30 ? "⚡" : streak.current_streak >= 7 ? "🔥" : "💫";
  const AVATARS = ["🧘","🌸","🦚","🕉️","🙏","💎","⭐","🌺","🪷","🔱","🌟","🎋"];

  return (
    <div className="min-h-screen pb-8 bg-pg-sanyam transition-theme">

      {/* ── TOP BAR ── */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between" style={{background:"var(--card-bg)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
        <Link href="/sanyam" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
          ←
        </Link>
        <p className="font-sans font-black text-sm text-gray-700">Sanyam Profile</p>
        <div className="flex gap-2">
          <button onClick={()=>setEditMode(true)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 text-sm">✏️</button>
          <Link href="/sanyam/leaderboard" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 text-sm">🏆</Link>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">

        {/* ── HERO ── */}
        <div className="text-center pb-2">
          {/* Avatar */}
          <div className="relative inline-block mb-3">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto shadow-lg border-4" style={{borderColor:level.color+"40",background:`linear-gradient(135deg,${level.color}15,${level.color}05)`}}>
              {editMode ? (
                <button onClick={()=>{
                  const arr = AVATARS;
                  const next = arr[(arr.indexOf(editAvatar)+1)%arr.length];
                  setEditAvatar(next);
                }}>{editAvatar}</button>
              ) : profile.avatar || "🧘"}
            </div>
            {/* Level badge */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-white font-sans font-black text-[9px] whitespace-nowrap shadow"
              style={{background:level.color}}>
              {level.emoji} Level {level.idx+1} · {level.nameHi}
            </div>
          </div>

          {/* Name */}
          {editMode ? (
            <div className="flex gap-2 items-center justify-center mt-5 mb-2">
              <input value={editName} onChange={e=>setEditName(e.target.value)}
                className="border-b-2 border-amber-400 bg-transparent font-sans font-black text-xl text-gray-800 text-center outline-none px-2 py-1" style={{maxWidth:200}}/>
              <button onClick={saveProfile} className="rounded-xl px-3 py-1.5 font-sans font-bold text-xs text-white" style={{background:level.color}}>Save</button>
              <button onClick={()=>setEditMode(false)} className="font-sans text-xs text-gray-400">Cancel</button>
            </div>
          ) : (
            <h1 className="font-sans font-black text-2xl text-gray-800 mt-5 mb-1">{profile.display_name}</h1>
          )}

          {/* Dharma points */}
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <span className="text-lg">⭐</span>
            <span className="font-sans font-black text-lg text-amber-600">{profile.spiritual_score.toLocaleString()}</span>
            <span className="font-hindi text-sm text-gray-400">धर्म अंक</span>
          </div>

          {/* Level progress */}
          <div className="mx-auto max-w-xs mb-4">
            <div className="h-2 rounded-full overflow-hidden bg-gray-100">
              <div className="h-full rounded-full transition-all duration-1000" style={{width:`${level.pct}%`,background:`linear-gradient(90deg,${level.color},${level.color}cc)`}}/>
            </div>
            <p className="font-sans text-[9px] text-gray-400 mt-1">{level.pct}% to {level.next?.emoji} {level.next?.name || "Max Level"}</p>
          </div>

          {/* Followers row */}
          <div className="flex items-center justify-center divide-x divide-gray-200 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            {[
              {n:profile.total_anumodanas_received||0, hi:"अनुमोदना", en:"Anumodana"},
              {n:streak.current_streak, hi:"स्ट्रीक", en:`${streakEmoji} Streak`},
              {n:badges.length, hi:"बैज", en:"Badges"},
              {n:profile.total_vrats_completed||0, hi:"व्रत", en:"Vrats"},
            ].map(s=>(
              <div key={s.en} className="flex-1 py-3 text-center">
                <p className="font-sans font-black text-base text-gray-800">{s.n}</p>
                <p className="font-hindi text-[9px] text-gray-400">{s.hi}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── TODAY'S DHARMA PROGRESS ── */}
        <Card>
          <SectionTitle emoji="🟢" title="Today's Dharma Progress" hi="आज का धर्म आचरण"/>
          <div className="flex items-center gap-5">
            <BigRing done={doneToday} total={DAILY_ACTIVITIES.length} color={level.color}/>
            <div className="flex-1">
              <p className="font-sans font-black text-lg text-gray-800 mb-1">{doneToday} / {DAILY_ACTIVITIES.length}</p>
              <p className="font-hindi text-xs text-gray-500 mb-3">दैनिक साधना पूर्ण</p>
              {todayStars > 0 && (
                <div className="rounded-xl px-3 py-2 bg-amber-50 border border-amber-200 mb-3">
                  <p className="font-hindi text-xs text-amber-700">🌟 आज {todayStars} तारे!</p>
                </div>
              )}
              {/* Mini rings */}
              <div className="flex gap-2 flex-wrap">
                <SmallRing pct={todayMap.samayik?100:0}   color="#3B82F6" emoji="🧘" label="सामायिक"/>
                <SmallRing pct={jaapPct}                   color="#8B5CF6" emoji="📿" label="जाप"/>
                <SmallRing pct={todayMap.swadhyay?100:0}  color="#10B981" emoji="📖" label="स्वाध्याय"/>
                <SmallRing pct={todayMap.temple?100:0}    color="#F97316" emoji="🛕" label="मंदिर"/>
                <SmallRing pct={todayMap.tap?100:0}       color="#EF4444" emoji="🔥" label="तप"/>
              </div>
            </div>
          </div>
        </Card>

        {/* ── QUICK ACTIONS ── */}
        <Card>
          <SectionTitle emoji="⚡" title="Quick Actions" hi="साधना दर्ज करें"/>
          <div className="grid grid-cols-3 gap-3">
            {[
              {type:"samayik", emoji:"🧘", label:"Samayik",   hi:"सामायिक",  color:"#3B82F6", bg:"#EFF6FF"},
              {type:"jaap",    emoji:"📿", label:"Record Jaap",hi:"नवकार जाप",color:"#8B5CF6", bg:"#F5F3FF"},
              {type:"temple",  emoji:"🛕", label:"Temple",     hi:"मंदिर",    color:"#F97316", bg:"#FFF7ED"},
              {type:"swadhyay",emoji:"📖", label:"Swadhyay",  hi:"स्वाध्याय",color:"#10B981", bg:"#F0FDF4"},
              {type:"donation",emoji:"💝", label:"Donate",     hi:"दान",       color:"#EC4899", bg:"#FDF2F8"},
              {type:"tap",     emoji:"🔥", label:"Tap/Upvas",  hi:"तप",        color:"#EF4444", bg:"#FEF2F2"},
            ].map(a=>(
              <button key={a.type} onClick={()=>setModal(a.type)}
                className="rounded-2xl p-4 text-center transition-all active:scale-95 hover:shadow-md relative"
                style={{background:todayMap[a.type]?a.bg:"#F9FAFB",border:`1.5px solid ${todayMap[a.type]?a.color+"40":"transparent"}`}}>
                {todayMap[a.type] && <span className="absolute top-1.5 right-1.5 text-[10px]">✅</span>}
                <div className="text-3xl mb-1">{a.emoji}</div>
                <p className="font-sans font-bold text-[10px] text-gray-600">{a.label}</p>
                <p className="font-hindi text-[9px] text-gray-400">{a.hi}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* ── TABS ── */}
        <div className="flex gap-1 overflow-x-auto scrollbar-none bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
          {[
            {id:"overview",  label:"Overview"},
            {id:"vrats",     label:"Vrats"},
            {id:"timeline",  label:"Timeline"},
            {id:"badges",    label:"Badges"},
            {id:"activity",  label:"Activity"},
            {id:"social",    label:"Feed"},
          ].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as typeof tab)}
              className="shrink-0 rounded-xl px-4 py-2 font-sans font-black text-xs transition-all flex-1"
              style={{
                background:tab===t.id?level.color:"transparent",
                color:tab===t.id?"white":"#9CA3AF",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ════ OVERVIEW TAB ════ */}
        {tab === "overview" && (<>

          {/* Active Vrats */}
          <Card>
            <SectionTitle emoji="🔥" title="Current Active Vrats" hi="सक्रिय व्रत" action="See All" onAction={()=>setTab("vrats")}/>
            {enrollments.filter(e=>e.status==="active").length === 0 ? (
              <div className="text-center py-4">
                <p className="font-hindi text-sm text-gray-400 mb-3">कोई सक्रिय व्रत नहीं</p>
                <Link href="/sanyam/vrat-db" className="inline-block rounded-full px-5 py-2.5 font-sans font-black text-sm text-white" style={{background:level.color}}>
                  + Start a Vrat
                </Link>
              </div>
            ) : enrollments.filter(e=>e.status==="active").slice(0,3).map(e=>(
              <div key={e.id} className="rounded-2xl p-4 mb-3 border" style={{borderColor:`${e.vrat_color||"#10B981"}30`,background:`${e.vrat_color||"#10B981"}08`}}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-hindi font-black text-base text-gray-800">{e.vrat_emoji} {e.vrat_name}</p>
                  <Link href={`/sanyam/vrat/${e.vrat_name?.toLowerCase().replace(/ /g,"-")}`}
                    className="font-sans text-[10px] font-bold" style={{color:e.vrat_color||"#10B981"}}>
                    View →
                  </Link>
                </div>
                <p className="font-sans text-xs text-gray-400 mb-2">Day {e.current_day||1} of {e.total_days}</p>
                <div className="h-2.5 rounded-full overflow-hidden bg-gray-100 mb-1">
                  <div className="h-full rounded-full transition-all" style={{width:`${e.completion_pct||0}%`,background:e.vrat_color||"#10B981"}}/>
                </div>
                <p className="font-sans text-[10px] text-gray-400">{e.completion_pct||0}% complete</p>
              </div>
            ))}
          </Card>

          {/* Lifetime Statistics */}
          <Card>
            <SectionTitle emoji="📈" title="Lifetime Statistics" hi="जीवन भर की साधना"/>
            <div className="space-y-3">
              {[
                {emoji:"🙏",label:"Total Vrats",      hi:"व्रत",          val:profile.total_vrats_completed||0, unit:""},
                {emoji:"📿",label:"Navkar Jaap",       hi:"नवकार जाप",    val:((profile.jaap_score||0)/2).toLocaleString(), unit:""},
                {emoji:"🧘",label:"Samayik Sessions",  hi:"सामायिक",      val:Math.round((profile.swadhyay_score||0)/5), unit:""},
                {emoji:"📖",label:"Swadhyay Hours",    hi:"स्वाध्याय",   val:Math.round((profile.swadhyay_score||0)/8), unit:"hrs"},
                {emoji:"🛕",label:"Temple Visits",     hi:"मंदिर दर्शन",  val:Math.round((profile.yatra_score||0)/15), unit:""},
                {emoji:"💝",label:"Daan Points",       hi:"दान",           val:profile.daan_score||0, unit:"pts"},
                {emoji:"🔥",label:"Tap Days",          hi:"तप",            val:Math.round((profile.tap_score||0)/10), unit:"days"},
                {emoji:"⭐",label:"Dharma Points",     hi:"धर्म अंक",     val:(profile.spiritual_score||0).toLocaleString(), unit:""},
              ].map(s=>(
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{s.emoji}</span>
                    <div>
                      <p className="font-sans font-bold text-sm text-gray-700">{s.label}</p>
                      <p className="font-hindi text-[9px] text-gray-400">{s.hi}</p>
                    </div>
                  </div>
                  <p className="font-sans font-black text-base text-gray-800">{s.val}{s.unit?" "+s.unit:""}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Friends Activity preview */}
          {feed.length > 0 && (
            <Card>
              <SectionTitle emoji="👥" title="Friends' Activity" hi="साथियों की साधना" action="See All" onAction={()=>setTab("activity")}/>
              {feed.slice(0,3).map(f=>(
                <div key={f.id} className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl shrink-0">{f.avatar||"🧘"}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm text-gray-700">{f.message}</p>
                    <p className="font-sans text-[10px] text-gray-400 mt-0.5">{new Date(f.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</p>
                  </div>
                  <button onClick={()=>giveAnumodana(f.id)}
                    className="shrink-0 rounded-full px-2.5 py-1.5 font-sans font-bold text-[10px] text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors">
                    🙏 {f.anumodanas||0}
                  </button>
                </div>
              ))}
            </Card>
          )}

          {/* Smart Suggestion */}
          <Card className="border-l-4" style={{borderLeftColor:level.color}}>
            <div className="flex gap-3 items-start">
              <span className="text-3xl">💡</span>
              <div className="flex-1">
                <p className="font-sans font-black text-sm text-gray-800">Suggested Next Step</p>
                <p className="font-hindi text-xs text-gray-500 mb-3">
                  {doneToday === 0 ? "आज अभी तक कोई साधना नहीं। सामायिक से शुरुआत करें।"
                    : doneToday < 3 ? "अच्छी शुरुआत! अब नवकार जाप करें।"
                    : doneToday < 5 ? "बहुत अच्छा! आज का तप भी पूरा करें।"
                    : "शानदार! आज की साधना लगभग पूर्ण है।"}
                </p>
                <button onClick={()=>setModal(doneToday===0?"samayik":doneToday<3?"jaap":"tap")}
                  className="rounded-2xl px-4 py-2 font-sans font-black text-sm text-white"
                  style={{background:level.color}}>
                  {doneToday===0?"🧘 Start Samayik":doneToday<3?"📿 Start Jaap":"🔥 Log Tap"}
                </button>
              </div>
            </div>
          </Card>
        </>)}

        {/* ════ VRATS TAB ════ */}
        {tab === "vrats" && (
          <div className="space-y-4">
            {enrollments.filter(e=>e.status==="active").length > 0 && (
              <Card>
                <SectionTitle emoji="🔥" title="Active Vrats" hi="सक्रिय व्रत"/>
                {enrollments.filter(e=>e.status==="active").map(e=>(
                  <div key={e.id} className="rounded-2xl p-4 mb-3 border" style={{borderColor:`${e.vrat_color||"#10B981"}30`,background:`${e.vrat_color||"#10B981"}08`}}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-hindi font-black text-base text-gray-800">{e.vrat_emoji} {e.vrat_name}</p>
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-sans font-bold text-white" style={{background:e.vrat_color||"#10B981"}}>Active</span>
                    </div>
                    <p className="font-sans text-xs text-gray-400 mb-2">Day {e.current_day||1} of {e.total_days} · Started {new Date(e.start_date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</p>
                    <div className="h-3 rounded-full overflow-hidden bg-gray-100 mb-1">
                      <div className="h-full rounded-full transition-all" style={{width:`${e.completion_pct||0}%`,background:e.vrat_color||"#10B981"}}/>
                    </div>
                    <p className="font-sans text-[10px] text-gray-400">{e.completion_pct||0}% complete</p>
                  </div>
                ))}
              </Card>
            )}
            <Link href="/sanyam/vrat-db"
              className="flex items-center justify-center gap-2 rounded-2xl py-4 font-sans font-black text-sm text-white shadow-lg"
              style={{background:`linear-gradient(135deg,${level.color},${level.color}cc)`}}>
              🙏 Browse & Enroll in Vrats
            </Link>
          </div>
        )}

        {/* ════ TIMELINE TAB ════ */}
        {tab === "timeline" && (
          <Card>
            <SectionTitle emoji="📅" title="Spiritual Journey" hi="आध्यात्मिक यात्रा"/>
            {todayLogs.length > 0 ? (
              <div className="space-y-0">
                {todayLogs.map((l,i)=>{
                  const IC: Record<string,{emoji:string;color:string;hi:string}> = {
                    samayik:{emoji:"🧘",color:"#3B82F6",hi:"सामायिक पूर्ण"},
                    jaap:{emoji:"📿",color:"#8B5CF6",hi:`${l.count} नवकार जाप`},
                    temple:{emoji:"🛕",color:"#F97316",hi:"मंदिर दर्शन"},
                    swadhyay:{emoji:"📖",color:"#10B981",hi:"स्वाध्याय"},
                    donation:{emoji:"💝",color:"#EC4899",hi:"दान"},
                    tap:{emoji:"🔥",color:"#EF4444",hi:"तप पूर्ण"},
                  };
                  const ic = IC[l.log_type]||{emoji:"🙏",color:"#F59E0B",hi:"साधना"};
                  return (
                    <div key={i} className="flex gap-3 relative">
                      {i < todayLogs.length-1 && <div className="absolute left-4 top-9 bottom-0 w-px bg-gray-100"/>}
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10" style={{background:`${ic.color}15`,border:`2px solid ${ic.color}30`}}>
                        <span style={{fontSize:14}}>{ic.emoji}</span>
                      </div>
                      <div className="pb-5">
                        <p className="font-hindi font-black text-sm text-gray-800">{ic.hi}</p>
                        <p className="font-sans text-[10px] text-gray-400">आज · ⭐ {l.stars_earned} pts{l.duration_min>0?` · ${l.duration_min}min`:""}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📅</div>
                <p className="font-hindi text-sm text-gray-400">आज की साधना दर्ज करें और यात्रा प्रारंभ करें</p>
              </div>
            )}
          </Card>
        )}

        {/* ════ BADGES TAB ════ */}
        {tab === "badges" && (
          <div className="space-y-4">
            {badges.length > 0 && (
              <Card>
                <SectionTitle emoji="🏆" title={`${badges.length} Badges Earned`} hi="अर्जित बैज"/>
                <div className="grid grid-cols-3 gap-3">
                  {badges.map(b=>(
                    <div key={b.badge_key} className="rounded-2xl p-3 text-center border-2" style={{borderColor:`${b.color}30`,background:`${b.color}08`}}>
                      <div className="text-4xl mb-1">{b.emoji}</div>
                      <p className="font-hindi font-black text-[11px]" style={{color:b.color}}>{b.name_hi}</p>
                      <p className="font-sans text-[8px] text-gray-400 mt-0.5">{new Date(b.earned_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"2-digit"})}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            <Card>
              <SectionTitle emoji="🎯" title="All Badges" hi="सभी बैज"/>
              <div className="grid grid-cols-3 gap-3">
                {allBadges.map(b=>{
                  const earned = badges.some(e=>e.badge_key===b.key);
                  return (
                    <div key={b.key} className={`rounded-2xl p-3 text-center transition-all ${earned?"":"opacity-35"}`}
                      style={{border:`1.5px solid ${earned?b.color+"40":"#E5E7EB"}`,background:earned?`${b.color}08`:"#F9FAFB"}}>
                      <div className="text-4xl mb-1" style={{filter:earned?"none":"grayscale(1)"}}>{b.emoji}</div>
                      <p className="font-hindi text-[10px] font-bold" style={{color:earned?b.color:"#9CA3AF"}}>{b.name_hi}</p>
                      <p className="font-sans text-[8px] text-gray-400">⭐{b.stars_reward}</p>
                      {b.is_rare===1 && <p className="font-sans text-[7px] font-black text-amber-500">RARE</p>}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* ════ ACTIVITY TAB ════ */}
        {tab === "activity" && (
          <Card>
            <SectionTitle emoji="🌿" title="Community Feed" hi="साथियों की साधना"/>
            {feed.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🌱</div>
                <p className="font-hindi text-sm text-gray-400">अभी कोई गतिविधि नहीं</p>
              </div>
            ) : feed.map(f=>(
              <div key={f.id} className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                <div className="w-11 h-11 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-2xl shrink-0">{f.avatar||"🧘"}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm text-gray-700 leading-relaxed">{f.message}</p>
                  <p className="font-sans text-[10px] text-gray-400 mt-1">{new Date(f.created_at).toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={()=>giveAnumodana(f.id)}
                      className="flex items-center gap-1 rounded-full px-3 py-1 font-sans font-bold text-[10px] text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all active:scale-95">
                      🙏 Anumodana {f.anumodanas > 0 && `· ${f.anumodanas}`}
                    </button>
                    <button className="flex items-center gap-1 rounded-full px-3 py-1 font-sans font-bold text-[10px] text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100">
                      🌸 Bless
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* SOCIAL TAB */}
      {tab === "social" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center" style={{border:"1px solid #F3F4F6"}}>
            <div className="text-4xl mb-3">🌿</div>
            <p className="font-sans font-black text-gray-800 mb-2">Community Feed</p>
            <p className="font-hindi text-sm text-gray-400 mb-4">साथियों की साधना देखें, प्रेरणा लें</p>
            <Link href="/sanyam/feed"
              className="inline-block rounded-2xl px-6 py-3 font-sans font-black text-sm text-white"
              style={{background:"linear-gradient(135deg,#F59E0B,#D97706)"}}>
              🌿 Open Community Feed →
            </Link>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm" style={{border:"1px solid #F3F4F6"}}>
            <p className="font-sans font-black text-sm text-gray-700 mb-3">Share your activity</p>
            <button onClick={()=>setModal("samayik")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-gray-50 transition-colors"
              style={{border:"1px solid #F3F4F6"}}>
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">🧘</div>
              <span className="font-hindi text-sm text-gray-400">आज की साधना शेयर करें...</span>
            </button>
          </div>
        </div>
      )}

      {/* ── LOG MODAL ── */}
      {modal && (
        <LogModal type={modal} onClose={()=>setModal(null)} onLog={(c,d)=>logActivity(modal,c,d)}/>
      )}
    </div>
  );
}
