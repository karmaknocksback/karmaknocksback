"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ══════════════════════════════════════════════════════════════
   SANYAM PROFILE — Flagship Spiritual Social Network
   Instagram + Duolingo + Apple Health × Jain Dharma
══════════════════════════════════════════════════════════════ */

// ── Types ─────────────────────────────────────────────────────
interface Profile {
  display_name:string; avatar:string; bio:string|null;
  spiritual_score:number; vrat_score:number; tap_score:number;
  jaap_score:number; daan_score:number; swadhyay_score:number;
  total_vrats_completed:number; total_anumodanas_received:number;
}
interface DayLog { log_type:string; count:number; duration_min:number; stars_earned:number; }
interface Enrollment { id:number; vrat_name:string; vrat_emoji:string; vrat_color:string; start_date:string; current_day:number; total_days:number; completion_pct:number; }
interface Badge { badge_key:string; name:string; name_hi:string; emoji:string; color:string; description:string; earned_at:string; }
interface AllBadge { key:string; name:string; name_hi:string; emoji:string; color:string; description:string; stars_reward:number; is_rare:number; }
interface FeedItem { id:number; display_name:string; avatar:string; feed_type:string; message:string; anumodanas:number; created_at:string; }
interface Streak { current_streak:number; longest_streak:number; samayik_streak:number; }
interface Data { profile:Profile; todayLogs:DayLog[]; enrollments:Enrollment[]; badges:Badge[]; allBadges:AllBadge[]; streak:Streak; feed:FeedItem[]; todayStars:number; isGuest:boolean; }

// ── Spiritual Levels ──────────────────────────────────────────
const LEVELS = [
  { name:"Seeker",     nameHi:"साधक",     emoji:"🌱", min:0,     color:"#4CAF50" },
  { name:"Shravak",    nameHi:"श्रावक",    emoji:"🙏", min:500,   color:"#2196F3" },
  { name:"Sadhak",     nameHi:"साधक",      emoji:"🧘", min:2000,  color:"#9C27B0" },
  { name:"Tapasvi",    nameHi:"तपस्वी",   emoji:"🔥", min:5000,  color:"#FF5722" },
  { name:"Vrati",      nameHi:"व्रती",    emoji:"💎", min:10000, color:"#00BCD4" },
  { name:"Dharmatma",  nameHi:"धर्मात्मा", emoji:"⭐", min:25000, color:"#FFD700" },
  { name:"Sanpanna",   nameHi:"संपन्न",    emoji:"🌟", min:50000, color:"#FF9800" },
  { name:"Jain Seva",  nameHi:"जैन सेवा", emoji:"🕉️", min:100000,color:"#E91E63" },
];

function getLevel(score:number) {
  let level = LEVELS[0];
  for (const l of LEVELS) { if (score >= l.min) level = l; }
  const idx = LEVELS.indexOf(level);
  const next = LEVELS[idx+1];
  const pct = next ? Math.round(((score - level.min)/(next.min - level.min))*100) : 100;
  return { ...level, pct: Math.min(100, pct), next };
}

// ── Activity Ring SVG ─────────────────────────────────────────
function Ring({ pct, color, size=80, stroke=8, children }: { pct:number; color:string; size?:number; stroke?:number; children?:React.ReactNode }) {
  const r = (size-stroke)/2;
  const circ = 2*Math.PI*r;
  const dash = (pct/100)*circ;
  return (
    <div className="relative flex items-center justify-center" style={{width:size,height:size}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
          style={{transition:"stroke-dasharray 0.8s ease"}}/>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        {children}
      </div>
    </div>
  );
}

// ── Quick Action Button ────────────────────────────────────────
function ActionBtn({ emoji, label, labelHi, color, onClick, done }:
  { emoji:string; label:string; labelHi:string; color:string; onClick:()=>void; done?:boolean }) {
  return (
    <button onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-2xl p-3 transition-all active:scale-95 hover:scale-105 relative"
      style={{
        background: done ? `${color}25` : "rgba(255,255,255,0.06)",
        border: done ? `1.5px solid ${color}60` : "1px solid rgba(255,255,255,0.09)",
        minWidth: 70,
      }}>
      {done && <div className="absolute top-1.5 right-1.5 text-[8px]">✅</div>}
      <span className="text-2xl">{emoji}</span>
      <span className="font-sans font-black text-[9px] uppercase tracking-wide" style={{color:done?color:"rgba(255,255,255,0.6)"}}>{label}</span>
      <span className="font-hindi text-[9px]" style={{color:done?color:"rgba(255,255,255,0.3)"}}>{labelHi}</span>
    </button>
  );
}

// ── Anumodana button ──────────────────────────────────────────
function AanuButton({ feedId, count, onDone }:{ feedId:number; count:number; onDone:()=>void }) {
  const [n, setN] = useState(count);
  const [done, setDone] = useState(false);
  async function give() {
    if (done) return;
    setDone(true); setN(x=>x+1);
    await fetch("/api/sanyam/anumodana", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({feedId}) });
    onDone();
  }
  return (
    <button onClick={give}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-sans font-black text-[10px] transition-all active:scale-95"
      style={{background:done?"rgba(255,152,0,0.2)":"rgba(255,255,255,0.06)",color:done?"#FF9800":"rgba(255,255,255,0.4)",border:done?"1px solid rgba(255,152,0,0.4)":"1px solid rgba(255,255,255,0.08)"}}>
      🙏 {n > 0 ? n : ""} Anumodana
    </button>
  );
}

// ── Log Modal ─────────────────────────────────────────────────
function LogModal({ type, onClose, onLog }:{ type:string; onClose:()=>void; onLog:(count:number,dur:number)=>void }) {
  const [count, setCount] = useState(type==="jaap"?108:1);
  const [dur,   setDur]   = useState(48);

  const META: Record<string,{emoji:string;label:string;hi:string;color:string;hasCount?:boolean;hasDur?:boolean}> = {
    samayik:  {emoji:"🧘",label:"Log Samayik",    hi:"सामायिक दर्ज करें",color:"#2196F3",hasDur:true},
    jaap:     {emoji:"📿",label:"Log Navkar Jaap", hi:"नवकार जाप दर्ज करें",color:"#9C27B0",hasCount:true},
    temple:   {emoji:"🛕",label:"Temple Visit",    hi:"मंदिर दर्शन",         color:"#FF9800"},
    swadhyay: {emoji:"📖",label:"Log Swadhyay",   hi:"स्वाध्याय दर्ज करें", color:"#4CAF50",hasDur:true},
    donation: {emoji:"💝",label:"Log Donation",    hi:"दान दर्ज करें",       color:"#E91E63"},
    tap:      {emoji:"🔥",label:"Log Tap",         hi:"तप दर्ज करें",        color:"#FF5722"},
  };
  const m = META[type] || {emoji:"🙏",label:"Log",hi:"दर्ज",color:"#FFD700"};

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4" style={{background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)"}}>
      <div className="w-full max-w-sm rounded-3xl p-6" style={{background:"linear-gradient(160deg,#0d0d1a,#1a0800)",border:`1.5px solid ${m.color}30`}}>
        <div className="text-center mb-5">
          <div className="text-5xl mb-2">{m.emoji}</div>
          <p className="font-sans font-black text-lg text-white">{m.label}</p>
          <p className="font-hindi text-sm text-gray-400">{m.hi}</p>
        </div>

        {m.hasCount && (
          <div className="mb-4">
            <p className="font-hindi text-xs text-gray-500 mb-2 text-center">जाप संख्या</p>
            <div className="flex items-center gap-3 justify-center">
              {[27,54,108,216,1008].map(n=>(
                <button key={n} onClick={()=>setCount(n)}
                  className="rounded-xl px-3 py-2 font-sans font-black text-sm transition-all"
                  style={{background:count===n?`${m.color}25`:"rgba(255,255,255,0.06)",color:count===n?m.color:"rgba(255,255,255,0.4)",border:count===n?`1px solid ${m.color}50`:"1px solid rgba(255,255,255,0.08)"}}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {m.hasDur && (
          <div className="mb-4">
            <p className="font-hindi text-xs text-gray-500 mb-2 text-center">समय (मिनट)</p>
            <div className="flex items-center gap-3 justify-center">
              {[24,48,72,96].map(n=>(
                <button key={n} onClick={()=>setDur(n)}
                  className="rounded-xl px-3 py-2 font-sans font-black text-sm transition-all"
                  style={{background:dur===n?`${m.color}25`:"rgba(255,255,255,0.06)",color:dur===n?m.color:"rgba(255,255,255,0.4)",border:dur===n?`1px solid ${m.color}50`:"1px solid rgba(255,255,255,0.08)"}}>
                  {n} min
                </button>
              ))}
            </div>
          </div>
        )}

        <button onClick={()=>onLog(count,dur)}
          className="w-full py-3.5 rounded-2xl font-sans font-black text-sm text-white mb-3"
          style={{background:`linear-gradient(135deg,${m.color},${m.color}cc)`,boxShadow:`0 8px 24px ${m.color}40`}}>
          ✓ {m.label}
        </button>
        <button onClick={onClose} className="w-full py-2 font-sans text-xs text-gray-500 hover:text-gray-300">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN PROFILE PAGE
// ══════════════════════════════════════════════════════════════
export default function SanyamProfilePage() {
  const [data,    setData]    = useState<Data|null>(null);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState<string|null>(null);
  const [tab,     setTab]     = useState<"progress"|"vrats"|"badges"|"feed"|"timeline">("progress");
  const [logging, setLogging] = useState<string|null>(null); // which action is logging
  const router = useRouter();

  const load = useCallback(async()=>{
    const r = await fetch("/api/sanyam/profile");
    if (r.status === 401) { router.push("/academy/login?redirect=/sanyam/profile&reason=signin_required"); return; }
    const d = await r.json();
    setData(d);
    setLoading(false);
  },[router]);

  useEffect(()=>{ load(); },[load]);

  async function logActivity(type:string, count:number, dur:number) {
    setLogging(type);
    setModal(null);
    await fetch("/api/sanyam/profile",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"log_activity",log_type:type,count,duration_min:dur})
    });
    await load();
    setLogging(null);
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{background:"linear-gradient(160deg,#0d0d0d 0%,#1a0800 40%,#0d0d1a 100%)"}}>
      <div className="text-5xl animate-spin">🕉️</div>
      <p className="font-hindi text-amber-400 animate-pulse">साधना पथ लोड हो रहा है...</p>
    </div>
  );

  if (!data) return null;

  const { profile, todayLogs, enrollments, badges, allBadges, streak, feed, todayStars } = data;
  const level   = getLevel(profile.spiritual_score || 0);
  const todayMap = Object.fromEntries(todayLogs.map(l=>[l.log_type, l]));

  // Today's Dharma progress
  const samayikDone  = !!todayMap.samayik;
  const jaapCount    = todayMap.jaap?.count || 0;
  const jaapPct      = Math.min(100, Math.round((jaapCount/108)*100));
  const swadhyayDone = !!todayMap.swadhyay;
  const templeDone   = !!todayMap.temple;
  const tapDone      = !!todayMap.tap;

  // Streak fire emoji based on length
  const streakEmoji = streak.current_streak >= 100 ? "🌟" : streak.current_streak >= 30 ? "⚡" : streak.current_streak >= 7 ? "🔥" : "💫";

  return (
    <div className="min-h-screen pb-24" style={{background:"linear-gradient(160deg,#0d0d0d 0%,#1a0800 40%,#0d0d1a 100%)"}}>

      {/* ════ HERO SECTION ════ */}
      <div className="relative overflow-hidden" style={{background:"linear-gradient(180deg,rgba(255,152,0,0.08) 0%,transparent 100%)"}}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{backgroundImage:"radial-gradient(circle at 50% 50%, #FFD700 1px, transparent 1px)",backgroundSize:"30px 30px"}}/>

        <div className="relative z-10 max-w-2xl mx-auto px-5 pt-8 pb-6">
          {/* Avatar + level ring */}
          <div className="flex items-start gap-5 mb-5">
            <div className="relative shrink-0">
              <Ring pct={level.pct} color={level.color} size={88} stroke={5}>
                <div className="text-4xl">{profile.avatar || "🧘"}</div>
              </Ring>
              {/* Level badge */}
              <div className="absolute -bottom-1 -right-1 rounded-full px-2 py-0.5 font-sans font-black text-[9px]"
                style={{background:level.color,color:"#1a0800"}}>
                {level.emoji} {level.nameHi}
              </div>
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <h1 className="font-sans font-black text-xl text-white truncate">{profile.display_name}</h1>
              {profile.bio && <p className="font-hindi text-[11px] text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{profile.bio}</p>}

              {/* Stats row */}
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {[
                  {l:"⭐",v:profile.spiritual_score.toLocaleString(),hi:"अंक"},
                  {l:streakEmoji,v:streak.current_streak,hi:"streak"},
                  {l:"🙏",v:profile.total_anumodanas_received,hi:"अनुमोदना"},
                  {l:"💎",v:badges.length,hi:"badges"},
                ].map(s=>(
                  <div key={s.hi} className="text-center">
                    <p className="font-sans font-black text-sm text-white">{s.l} {s.v}</p>
                    <p className="font-hindi text-[9px] text-gray-500">{s.hi}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Level progress bar */}
          <div className="rounded-2xl p-3 mb-5" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-sans font-black text-[10px]" style={{color:level.color}}>{level.emoji} {level.name}</span>
              {level.next && <span className="font-sans text-[9px] text-gray-500">Next: {level.next.emoji} {level.next.name}</span>}
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.08)"}}>
              <div className="h-full rounded-full transition-all duration-1000" style={{width:`${level.pct}%`,background:`linear-gradient(90deg,${level.color},${level.color}cc)`}}/>
            </div>
            <p className="font-sans text-[9px] text-gray-600 mt-1">{level.pct}% to {level.next?.name || "Max Level"}</p>
          </div>

          {/* Today's stars earned */}
          {todayStars > 0 && (
            <div className="rounded-xl px-4 py-2 text-center mb-2"
              style={{background:"rgba(255,215,0,0.08)",border:"1px dashed rgba(255,215,0,0.2)"}}>
              <p className="font-hindi text-xs text-amber-300">🌟 आज {todayStars} तारे अर्जित किए!</p>
            </div>
          )}
        </div>
      </div>

      {/* ════ TODAY'S DHARMA PROGRESS ════ */}
      <div className="max-w-2xl mx-auto px-5 mb-6">
        <div className="rounded-3xl p-5" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-sans font-black text-sm text-white">Today's Dharma</p>
              <p className="font-hindi text-[10px] text-amber-400">आज का धर्म आचरण</p>
            </div>
            <div className="rounded-full px-3 py-1" style={{background:"rgba(255,152,0,0.12)"}}>
              <p className="font-sans font-black text-[10px] text-amber-400">{new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}</p>
            </div>
          </div>

          {/* Activity Rings Row */}
          <div className="flex items-center justify-around mb-5">
            <div className="text-center">
              <Ring pct={samayikDone?100:0} color="#2196F3" size={72} stroke={7}>
                <span className="text-xl">🧘</span>
              </Ring>
              <p className="font-hindi text-[9px] mt-1" style={{color:samayikDone?"#2196F3":"rgba(255,255,255,0.3)"}}>सामायिक</p>
              {samayikDone && <p className="font-sans text-[8px] text-blue-400">✓ Done</p>}
            </div>
            <div className="text-center">
              <Ring pct={jaapPct} color="#9C27B0" size={72} stroke={7}>
                <span className="text-xl">📿</span>
              </Ring>
              <p className="font-hindi text-[9px] mt-1" style={{color:jaapCount>0?"#9C27B0":"rgba(255,255,255,0.3)"}}>जाप</p>
              <p className="font-sans text-[8px]" style={{color:jaapCount>=108?"#9C27B0":"rgba(255,255,255,0.3)"}}>{jaapCount}/108</p>
            </div>
            <div className="text-center">
              <Ring pct={swadhyayDone?100:0} color="#4CAF50" size={72} stroke={7}>
                <span className="text-xl">📖</span>
              </Ring>
              <p className="font-hindi text-[9px] mt-1" style={{color:swadhyayDone?"#4CAF50":"rgba(255,255,255,0.3)"}}>स्वाध्याय</p>
              {swadhyayDone && <p className="font-sans text-[8px] text-green-400">✓ Done</p>}
            </div>
            <div className="text-center">
              <Ring pct={templeDone?100:0} color="#FF9800" size={72} stroke={7}>
                <span className="text-xl">🛕</span>
              </Ring>
              <p className="font-hindi text-[9px] mt-1" style={{color:templeDone?"#FF9800":"rgba(255,255,255,0.3)"}}>मंदिर</p>
              {templeDone && <p className="font-sans text-[8px] text-amber-400">✓ Done</p>}
            </div>
            <div className="text-center">
              <Ring pct={tapDone?100:0} color="#FF5722" size={72} stroke={7}>
                <span className="text-xl">🔥</span>
              </Ring>
              <p className="font-hindi text-[9px] mt-1" style={{color:tapDone?"#FF5722":"rgba(255,255,255,0.3)"}}>तप</p>
              {tapDone && <p className="font-sans text-[8px] text-orange-400">✓ Done</p>}
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-3 rounded-2xl p-3"
            style={{background:`rgba(255,87,34,0.08)`,border:"1px solid rgba(255,87,34,0.15)"}}>
            <span className="text-2xl">{streakEmoji}</span>
            <div>
              <p className="font-sans font-black text-sm text-white">{streak.current_streak} Day Streak</p>
              <p className="font-hindi text-[10px] text-gray-500">सर्वाधिक: {streak.longest_streak} दिन</p>
            </div>
            <div className="ml-auto text-right">
              <p className="font-sans text-[10px] text-orange-400 font-bold">Keep going!</p>
              <p className="font-hindi text-[9px] text-gray-600">जारी रखो</p>
            </div>
          </div>
        </div>
      </div>

      {/* ════ QUICK ACTIONS ════ */}
      <div className="max-w-2xl mx-auto px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="font-sans font-black text-sm text-white">Quick Log</p>
          <p className="font-hindi text-[10px] text-amber-400">आज की साधना दर्ज करें</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            {type:"samayik", emoji:"🧘", label:"Samayik",  hi:"सामायिक",  color:"#2196F3"},
            {type:"jaap",    emoji:"📿", label:"Jaap",     hi:"जाप",       color:"#9C27B0"},
            {type:"temple",  emoji:"🛕", label:"Temple",   hi:"मंदिर",    color:"#FF9800"},
            {type:"swadhyay",emoji:"📖", label:"Swadhyay", hi:"स्वाध्याय",color:"#4CAF50"},
            {type:"donation",emoji:"💝", label:"Donation", hi:"दान",       color:"#E91E63"},
            {type:"tap",     emoji:"🔥", label:"Tap",      hi:"तप",        color:"#FF5722"},
          ].map(a=>(
            <ActionBtn key={a.type} emoji={a.emoji} label={a.label} labelHi={a.hi} color={a.color}
              done={!!todayMap[a.type]}
              onClick={()=>setModal(a.type)}/>
          ))}
        </div>
        <p className="font-sans text-[9px] text-gray-600 text-center mt-2">Tap to log today's spiritual activities</p>
      </div>

      {/* ════ TABS ════ */}
      <div className="max-w-2xl mx-auto px-5 mb-4">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {[
            {id:"progress",label:"Progress",emoji:"📊"},
            {id:"vrats",   label:"Vrats",   emoji:"🙏"},
            {id:"badges",  label:"Badges",  emoji:"🏆"},
            {id:"feed",    label:"Feed",    emoji:"🌿"},
            {id:"timeline",label:"Journey", emoji:"📅"},
          ].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as typeof tab)}
              className="shrink-0 rounded-full px-4 py-2 font-sans font-black text-xs transition-all"
              style={{
                background:tab===t.id?"linear-gradient(135deg,#FFD700,#FF9800)":"rgba(255,255,255,0.06)",
                color:tab===t.id?"#1a0800":"rgba(255,255,255,0.4)",
                border:tab===t.id?"none":"1px solid rgba(255,255,255,0.08)",
              }}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ════ TAB CONTENT ════ */}
      <div className="max-w-2xl mx-auto px-5">

        {/* PROGRESS TAB */}
        {tab === "progress" && (
          <div className="space-y-4">
            {/* Category scores */}
            <div className="rounded-3xl p-5" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}>
              <p className="font-sans font-black text-sm text-white mb-4">Dharma Categories</p>
              {[
                {k:"vrat",     hi:"व्रत",      score:profile.vrat_score,     color:"#7C4DFF", emoji:"🙏"},
                {k:"tap",      hi:"तप",        score:profile.tap_score,      color:"#FF5722", emoji:"🔥"},
                {k:"jaap",     hi:"जाप",       score:profile.jaap_score,     color:"#9C27B0", emoji:"📿"},
                {k:"swadhyay", hi:"स्वाध्याय", score:profile.swadhyay_score, color:"#4CAF50", emoji:"📖"},
                {k:"daan",     hi:"दान",       score:profile.daan_score,     color:"#E91E63", emoji:"💝"},
              ].map(c=>{
                const max = Math.max(profile.vrat_score,profile.tap_score,profile.jaap_score,profile.swadhyay_score,profile.daan_score,1);
                const pct = Math.round((c.score/max)*100);
                return (
                  <div key={c.k} className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-hindi text-[11px] text-white">{c.emoji} {c.hi}</span>
                      <span className="font-sans text-[10px] font-bold" style={{color:c.color}}>⭐ {c.score}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.06)"}}>
                      <div className="h-full rounded-full transition-all duration-800" style={{width:`${pct}%`,background:c.color}}/>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active vrats summary */}
            {enrollments.length > 0 && (
              <div>
                <p className="font-sans font-black text-sm text-white mb-3">Active Vrats 🙏</p>
                {enrollments.slice(0,3).map(e=>(
                  <div key={e.id} className="rounded-2xl p-4 mb-2" style={{background:`${e.vrat_color||"#FF9800"}10`,border:`1px solid ${e.vrat_color||"#FF9800"}25`}}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-hindi font-black text-sm text-white">{e.vrat_emoji} {e.vrat_name}</span>
                      <span className="font-sans text-[10px]" style={{color:e.vrat_color||"#FF9800"}}>Day {e.current_day}/{e.total_days}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.06)"}}>
                      <div className="h-full rounded-full" style={{width:`${e.completion_pct||0}%`,background:e.vrat_color||"#FF9800"}}/>
                    </div>
                  </div>
                ))}
                <button onClick={()=>setTab("vrats")} className="font-sans text-[10px] text-amber-400 hover:text-amber-300 mt-1">
                  View all vrats →
                </button>
              </div>
            )}
          </div>
        )}

        {/* VRATS TAB */}
        {tab === "vrats" && (
          <div>
            {enrollments.length === 0 ? (
              <div className="rounded-3xl p-10 text-center" style={{border:"2px dashed rgba(255,255,255,0.07)"}}>
                <div className="text-5xl mb-4">🙏</div>
                <p className="font-sans font-black text-white mb-2">No Active Vrats</p>
                <p className="font-hindi text-xs text-gray-500 mb-5">कोई व्रत अभी सक्रिय नहीं है</p>
                <Link href="/sanyam/vrat-db"
                  className="inline-block px-6 py-2.5 rounded-full font-sans font-black text-sm text-amber-900"
                  style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>
                  Browse Vrats →
                </Link>
              </div>
            ) : enrollments.map(e=>(
              <div key={e.id} className="rounded-2xl p-5 mb-3" style={{background:`${e.vrat_color||"#FF9800"}10`,border:`1.5px solid ${e.vrat_color||"#FF9800"}30`}}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-hindi font-black text-base text-white">{e.vrat_emoji} {e.vrat_name}</p>
                    <p className="font-sans text-[10px] text-gray-500 mt-0.5">Started {new Date(e.start_date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</p>
                  </div>
                  <div className="rounded-xl px-3 py-1.5 text-center" style={{background:`${e.vrat_color||"#FF9800"}20`}}>
                    <p className="font-sans font-black text-sm" style={{color:e.vrat_color||"#FF9800"}}>Day {e.current_day}</p>
                    <p className="font-sans text-[9px] text-gray-500">of {e.total_days}</p>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden mb-2" style={{background:"rgba(255,255,255,0.06)"}}>
                  <div className="h-full rounded-full transition-all" style={{width:`${e.completion_pct||0}%`,background:e.vrat_color||"#FF9800"}}/>
                </div>
                <p className="font-sans text-[10px] text-gray-600">{e.completion_pct||0}% complete</p>
              </div>
            ))}
            <Link href="/sanyam/vrat-db"
              className="mt-3 flex items-center justify-center gap-2 rounded-2xl py-3.5 font-sans font-black text-sm text-amber-900"
              style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>
              + Start a New Vrat
            </Link>
          </div>
        )}

        {/* BADGES TAB */}
        {tab === "badges" && (
          <div>
            {badges.length > 0 && (
              <div className="mb-5">
                <p className="font-sans font-black text-sm text-white mb-3">🏆 Earned Badges</p>
                <div className="grid grid-cols-3 gap-3">
                  {badges.map(b=>(
                    <div key={b.badge_key} className="rounded-2xl p-3 text-center"
                      style={{background:`${b.color}15`,border:`1.5px solid ${b.color}40`}}>
                      <div className="text-3xl mb-1">{b.emoji}</div>
                      <p className="font-hindi text-[10px] font-bold" style={{color:b.color}}>{b.name_hi}</p>
                      <p className="font-sans text-[8px] text-gray-500 mt-0.5">{new Date(b.earned_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"2-digit"})}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="font-sans font-black text-sm text-white/40 mb-3 uppercase tracking-widest text-[10px]">All Badges</p>
              <div className="grid grid-cols-3 gap-3">
                {allBadges.map(b=>{
                  const earned = badges.some(e=>e.badge_key===b.key);
                  return (
                    <div key={b.key} className={`rounded-2xl p-3 text-center transition-all ${earned?"":"opacity-40"}`}
                      style={{background:earned?`${b.color}15`:"rgba(255,255,255,0.03)",border:earned?`1.5px solid ${b.color}40`:"1px solid rgba(255,255,255,0.06)"}}>
                      <div className="text-3xl mb-1" style={{filter:earned?"none":"grayscale(100%)"}}>{b.emoji}</div>
                      <p className="font-hindi text-[10px]" style={{color:earned?b.color:"rgba(255,255,255,0.3)"}}>{b.name_hi}</p>
                      <p className="font-sans text-[8px] text-gray-600 mt-0.5">⭐{b.stars_reward}</p>
                      {b.is_rare === 1 && <p className="font-sans text-[7px] text-amber-500">RARE</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* FEED TAB */}
        {tab === "feed" && (
          <div className="space-y-3">
            {feed.length === 0 ? (
              <div className="rounded-3xl p-8 text-center" style={{border:"2px dashed rgba(255,255,255,0.07)"}}>
                <div className="text-5xl mb-3">🌿</div>
                <p className="font-sans font-black text-white mb-1">No activities yet</p>
                <p className="font-hindi text-xs text-gray-500">साधना करें और समुदाय को प्रेरित करें</p>
              </div>
            ) : feed.map(f=>(
              <div key={f.id} className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl shrink-0">{f.avatar || "🧘"}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm text-white">{f.message}</p>
                    <p className="font-sans text-[10px] text-gray-500 mt-1">
                      {new Date(f.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <AanuButton feedId={f.id} count={f.anumodanas||0} onDone={load}/>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TIMELINE TAB */}
        {tab === "timeline" && (
          <div>
            {todayLogs.length === 0 && (
              <div className="rounded-2xl p-6 text-center mb-4" style={{background:"rgba(255,215,0,0.05)",border:"1px dashed rgba(255,215,0,0.15)"}}>
                <p className="font-hindi text-sm text-amber-400">आज कोई साधना दर्ज नहीं</p>
                <p className="font-sans text-xs text-gray-500 mt-1">Log today's activities to build your timeline</p>
              </div>
            )}
            {/* Show today's logs as timeline entries */}
            {todayLogs.map((l,i)=>{
              const ICONS: Record<string,{emoji:string;color:string;hi:string}> = {
                samayik:{emoji:"🧘",color:"#2196F3",hi:"सामायिक"},jaap:{emoji:"📿",color:"#9C27B0",hi:"नवकार जाप"},
                temple:{emoji:"🛕",color:"#FF9800",hi:"मंदिर दर्शन"},swadhyay:{emoji:"📖",color:"#4CAF50",hi:"स्वाध्याय"},
                donation:{emoji:"💝",color:"#E91E63",hi:"दान"},tap:{emoji:"🔥",color:"#FF5722",hi:"तप"},
              };
              const ic = ICONS[l.log_type] || {emoji:"🙏",color:"#FFD700",hi:"साधना"};
              return (
                <div key={i} className="flex gap-4 mb-4">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                      style={{background:`${ic.color}20`,border:`2px solid ${ic.color}40`}}>
                      {ic.emoji}
                    </div>
                    {i < todayLogs.length-1 && <div className="flex-1 w-0.5 mt-2" style={{background:"rgba(255,255,255,0.06)"}}/>}
                  </div>
                  <div className="pb-4">
                    <p className="font-hindi font-black text-sm text-white">{ic.hi} पूर्ण</p>
                    <p className="font-sans text-[10px] text-gray-500 mt-0.5">
                      आज · ⭐ {l.stars_earned} stars
                      {l.log_type==="jaap" && ` · ${l.count} जाप`}
                      {l.duration_min > 0 && ` · ${l.duration_min} min`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ════ LOG MODAL ════ */}
      {modal && (
        <LogModal type={modal} onClose={()=>setModal(null)} onLog={(c,d)=>logActivity(modal,c,d)}/>
      )}

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2"
        style={{background:"linear-gradient(0deg,rgba(13,13,13,0.98) 60%,transparent)"}}>
        <div className="flex gap-2 max-w-2xl mx-auto">
          <Link href="/sanyam"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 font-sans font-black text-sm"
            style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.6)",border:"1px solid rgba(255,255,255,0.1)"}}>
            🏠 Community
          </Link>
          <Link href="/sanyam/vrat-db"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 font-sans font-black text-sm text-amber-900"
            style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>
            🙏 Start Vrat
          </Link>
        </div>
      </div>
    </div>
  );
}
