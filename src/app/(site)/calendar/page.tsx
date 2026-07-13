"use client";
import { useState, useEffect, useCallback } from "react";

/* ══════════════════════════════════════════════════════════════
   DIGAMBAR JAIN PANCHANG CALENDAR
   ✓ Full month grid with prev/next navigation + year picker
   ✓ Each day shows Tithi (calculated at Brahma Muhurta 4:30 AM)
   ✓ Color-coded Jain festivals & kalyanak
   ✓ Choghadiya for today + selected day
   ✓ Brahma Muhurta tithi note when tithi changes
   ✓ All researched Digambar Jain festivals marked
══════════════════════════════════════════════════════════════ */

interface JainFestival { key:string; name:string; nameHi:string; category:string; emoji:string; color:string; description:string; descriptionHi?:string; }
interface Chog { name:string; nameHi:string; color:string; startTime:string; endTime:string; auspicious:boolean; rating:number; isBrahmaMuhurta?:boolean; }
interface DayData {
  day:number; date:string;
  tithi:{ number:number; name_hi:string; name_en:string; paksha:string; paksha_hi:string };
  nakshatra:{ name_hi:string; name_en:string };
  yoga:{ name:string };
  vaar:{ en:string; hi:string; num:number };
  hindu_month:{ name_hi:string; name_en:string };
  is_purnima:boolean; is_amavasya:boolean; is_ekadashi:boolean; is_chaturdashi:boolean; is_ashtami:boolean;
  jain_significance:string|null;
  brahma_muhurta_tithi_note:string|null;
  jain_festivals:JainFestival[];
  choghadiya:{ day:Chog[]; night:Chog[] };
}

const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_HI   = ["रवि","सोम","मंगल","बुध","गुरु","शुक्र","शनि"];

const CAT_BG: Record<string,string> = {
  kalyanak:"#FFD70022",parva:"#E91E6318",mahaparvа:"#7C4DFF18",
  vrat:"#9C27B015",auspicious:"#4CAF5012",ashtaahnika:"#FF8F0018"
};
const CAT_COLOR: Record<string,string> = {
  kalyanak:"#FFD700",parva:"#E91E63",mahaparvа:"#7C4DFF",
  vrat:"#9C27B0",auspicious:"#4CAF50",ashtaahnika:"#FF8F00"
};

export default function JainCalendarPage() {
  const now   = new Date();
  const [year,   setYear]     = useState(now.getFullYear());
  const [month,  setMonth]    = useState(now.getMonth() + 1);
  const [days,   setDays]     = useState<DayData[]>([]);
  const [today,  setToday]    = useState<DayData|null>(null);
  const [sel,    setSel]      = useState<DayData|null>(null);
  const [loading,setLoading]  = useState(true);
  const [loadMon,setLoadMon]  = useState(true);
  const [view,   setView]     = useState<"calendar"|"choghadiya">("calendar");
  const [waModal, setWaModal]   = useState(false);
  const [waForm,  setWaForm]    = useState({ name:"", phone:"", language:"hi" });
  const [waDone,  setWaDone]    = useState<string|null>(null);
  const [waSending, setWaSending] = useState(false);

  async function submitWA(e: React.FormEvent) {
    e.preventDefault();
    setWaSending(true);
    try {
      const r = await fetch("/api/whatsapp", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ...waForm, preferences:["all"] }),
      });
      const d = await r.json();
      if (d.success) {
        setWaDone(d.waLink || null);
      }
    } catch {}
    setWaSending(false);
  }

  useEffect(()=>{
    fetch("/api/panchang?type=today").then(r=>r.json()).then(d=>setToday(d.panchang||null));
  },[]);

  const loadMonth = useCallback(async(y:number,m:number)=>{
    setLoadMon(true); setSel(null);
    const r = await fetch(`/api/panchang?type=month&year=${y}&month=${m}`);
    const d = await r.json();
    setDays(d.days||[]);
    setLoadMon(false); setLoading(false);
  },[]);

  useEffect(()=>{ loadMonth(year,month); },[year,month,loadMonth]);

  const prev=()=>{ if(month===1){setYear(y=>y-1);setMonth(12);}else setMonth(m=>m-1); };
  const next=()=>{ if(month===12){setYear(y=>y+1);setMonth(1);}else setMonth(m=>m+1); };
  const goToday=()=>{ setYear(now.getFullYear());setMonth(now.getMonth()+1); };

  const firstDay  = new Date(year,month-1,1).getDay();
  const rows      = Math.ceil((firstDay + days.length)/7);
  const isToday   = (d:number)=>year===now.getFullYear()&&month===now.getMonth()+1&&d===now.getDate();

  function dayBg(d?:DayData) {
    if (!d) return "transparent";
    if (d.jain_festivals.some(f=>f.category==="kalyanak")||d.jain_festivals.some(f=>f.category==="mahaparvа")) return "#FFD70018";
    if (d.jain_festivals.some(f=>f.category==="parva")) return "#E91E6310";
    if (d.jain_festivals.some(f=>f.category==="ashtaahnika")) return "#FF8F0012";
    if (d.jain_festivals.some(f=>f.category==="vrat")) return "#9C27B010";
    if (d.is_purnima) return "#FFD70010";
    if (d.is_amavasya) return "#9C27B010";
    if (d.is_ekadashi) return "#4CAF5008";
    if (d.is_chaturdashi) return "#FF980008";
    if (d.is_ashtami) return "#2196F308";
    return "transparent";
  }

  const topFestival = (d?:DayData) => d?.jain_festivals[0]||null;
  const selDay = sel || today;

  return (
    <div className="min-h-screen" style={{background:"linear-gradient(160deg,#0d0d0d 0%,#1a0800 40%,#0d0d1a 100%)"}}>
      <div className="max-w-7xl mx-auto px-4 py-6 pb-20">

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="font-sans font-black text-2xl text-white">🕉️ दिगम्बर जैन पंचांग</h1>
          <p className="font-hindi text-sm text-amber-400 mt-1">Digambar Jain Calendar · Brahma Muhurta Tithi · Choghadiya</p>
          <p className="font-sans text-[10px] text-gray-600 mt-1">तिथि गणना ब्रह्म मुहूर्त (4:30 AM) पर — जैन परंपरानुसार</p>
        </div>

        {/* View toggle */}
        <div className="flex gap-2 justify-center mb-6">
          {(["calendar","choghadiya"] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)}
              className="rounded-full px-5 py-2 font-sans font-black text-xs transition-all"
              style={{
                background:view===v?"linear-gradient(135deg,#FFD700,#FF9800)":"rgba(255,255,255,0.06)",
                color:view===v?"#1a0800":"rgba(255,255,255,0.5)",
                border:view===v?"none":"1px solid rgba(255,255,255,0.1)",
              }}>
              {v==="calendar"?"📅 Calendar":"⏰ Choghadiya"}
            </button>
          ))}
        </div>

        {view==="calendar" ? (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

            {/* ── LEFT PANEL ── */}
            <div className="xl:col-span-1 space-y-4">

              {/* Today's panchang */}
              {today && (
                <div className="rounded-2xl p-4" style={{background:"rgba(255,215,0,0.07)",border:"1px solid rgba(255,215,0,0.2)"}}>
                  <p className="font-hindi text-[10px] text-amber-400 font-black mb-3 uppercase tracking-widest">🕉️ आज का पंचांग</p>
                  <div className="space-y-2">
                    {[
                      {l:"तिथि",  v:`${today.tithi.name_hi}`,            c:"#FFD700"},
                      {l:"पक्ष",  v:today.tithi.paksha_hi,               c:"#FF9800"},
                      {l:"वार",   v:today.vaar.hi,                        c:"#4CAF50"},
                      {l:"नक्षत्र",v:today.nakshatra.name_hi,             c:"#AB47BC"},
                      {l:"योग",   v:today.yoga.name,                      c:"#2196F3"},
                      {l:"माह",   v:today.hindu_month.name_hi,            c:"#FF5722"},
                    ].map(s=>(
                      <div key={s.l} className="flex justify-between rounded-lg px-3 py-1.5"
                        style={{background:"rgba(255,255,255,0.04)"}}>
                        <span className="font-hindi text-[10px] text-gray-500">{s.l}</span>
                        <span className="font-hindi text-[10px] font-bold" style={{color:s.c}}>{s.v}</span>
                      </div>
                    ))}
                  </div>
                  {today.jain_significance && (
                    <div className="mt-2 rounded-lg px-3 py-2" style={{background:"rgba(255,215,0,0.1)",border:"1px solid rgba(255,215,0,0.2)"}}>
                      <p className="font-hindi text-[11px] text-amber-300 font-bold">{today.jain_significance}</p>
                    </div>
                  )}
                  {today.brahma_muhurta_tithi_note && (
                    <div className="mt-2 rounded-lg px-3 py-2" style={{background:"rgba(156,39,176,0.12)",border:"1px solid rgba(156,39,176,0.25)"}}>
                      <p className="font-hindi text-[9px] text-purple-300 leading-relaxed">{today.brahma_muhurta_tithi_note}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Selected day detail */}
              {sel && (
                <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)"}}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-sans font-black text-sm text-white">{sel.day} {MONTHS_EN[month-1]}</p>
                    <button onClick={()=>setSel(null)} className="text-white/30 hover:text-white text-lg">×</button>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    {[
                      {l:"तिथि",  v:sel.tithi.name_hi+" · "+sel.tithi.paksha_hi, c:"#FFD700"},
                      {l:"वार",   v:sel.vaar.hi,          c:"#4CAF50"},
                      {l:"नक्षत्र",v:sel.nakshatra.name_hi,c:"#AB47BC"},
                      {l:"माह",   v:sel.hindu_month.name_hi,c:"#FF5722"},
                    ].map(s=>(
                      <div key={s.l} className="flex justify-between text-[10px]">
                        <span className="font-hindi text-gray-500">{s.l}</span>
                        <span className="font-hindi font-bold" style={{color:s.c}}>{s.v}</span>
                      </div>
                    ))}
                  </div>
                  {sel.jain_festivals.length > 0 ? (
                    <div className="space-y-2">
                      {sel.jain_festivals.map(f=>(
                        <div key={f.key} className="rounded-xl p-3"
                          style={{background:`${f.color}15`,border:`1px solid ${f.color}30`}}>
                          <p className="font-sans font-black text-[11px]" style={{color:f.color}}>{f.emoji} {f.name}</p>
                          <p className="font-hindi text-[10px] text-amber-300 mt-0.5">{f.nameHi}</p>
                          {f.descriptionHi && <p className="font-hindi text-[9px] text-gray-500 mt-1 leading-relaxed">{f.descriptionHi}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center rounded-xl p-3" style={{background:"rgba(255,255,255,0.03)"}}>
                      {sel.is_purnima && <p className="font-hindi text-xs text-amber-300">🌕 पूर्णिमा</p>}
                      {sel.is_amavasya && <p className="font-hindi text-xs text-purple-300">🌑 अमावस्या</p>}
                      {sel.is_ekadashi && <p className="font-hindi text-xs text-green-300">⭐ एकादशी</p>}
                      {sel.is_chaturdashi && <p className="font-hindi text-xs text-orange-300">🙏 चतुर्दशी</p>}
                      {sel.is_ashtami && <p className="font-hindi text-xs text-blue-300">🌟 अष्टमी</p>}
                      {!sel.is_purnima&&!sel.is_amavasya&&!sel.is_ekadashi&&!sel.is_chaturdashi&&!sel.is_ashtami&&(
                        <p className="font-sans text-[10px] text-gray-600">No festival today</p>
                      )}
                    </div>
                  )}
                  {sel.brahma_muhurta_tithi_note && (
                    <div className="mt-2 rounded-lg px-3 py-2" style={{background:"rgba(156,39,176,0.12)",border:"1px solid rgba(156,39,176,0.2)"}}>
                      <p className="font-hindi text-[9px] text-purple-300 leading-relaxed">{sel.brahma_muhurta_tithi_note}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Legend */}
              <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)"}}>
                <p className="font-sans text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Legend</p>
                {[
                  {c:"#FFD700",l:"Tirthankar Kalyanak"},
                  {c:"#7C4DFF",l:"Das Lakshan Mahaparvа"},
                  {c:"#FF8F00",l:"Ashtaahnika Parva"},
                  {c:"#E91E63",l:"Jain Parva"},
                  {c:"#9C27B0",l:"Vrat Period"},
                  {c:"#4CAF50",l:"Purnima / Amavasya"},
                  {c:"#2196F3",l:"Ashtami / Ekadashi"},
                ].map(({c,l})=>(
                  <div key={l} className="flex items-center gap-1.5 mb-1">
                    <div className="w-3 h-3 rounded shrink-0" style={{background:c+"40",border:`1.5px solid ${c}`}}/>
                    <span className="font-sans text-[9px] text-gray-500">{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── CALENDAR GRID ── */}
            <div className="xl:col-span-3">
              {/* Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={prev}
                  className="rounded-xl px-4 py-2 font-sans font-black text-sm text-white hover:bg-white/10">← Prev</button>
                <div className="text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <select value={month} onChange={e=>setMonth(+e.target.value)}
                      className="rounded-lg px-2 py-1 font-sans font-black text-sm text-amber-300 bg-transparent border border-white/10 outline-none cursor-pointer">
                      {MONTHS_EN.map((m,i)=><option key={i} value={i+1} className="bg-gray-900">{m}</option>)}
                    </select>
                    <select value={year} onChange={e=>setYear(+e.target.value)}
                      className="rounded-lg px-2 py-1 font-sans font-black text-sm text-amber-300 bg-transparent border border-white/10 outline-none cursor-pointer">
                      {Array.from({length:25},(_,i)=>2020+i).map(y=>(
                        <option key={y} value={y} className="bg-gray-900">{y}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={goToday} className="font-sans text-[10px] text-amber-500 hover:text-amber-300 mt-0.5 block mx-auto">
                    Go to Today
                  </button>
                </div>
                <button onClick={next}
                  className="rounded-xl px-4 py-2 font-sans font-black text-sm text-white hover:bg-white/10">Next →</button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-0.5 mb-0.5">
                {DAYS_HI.map((d,i)=>(
                  <div key={d} className="text-center py-1">
                    <p className="font-hindi text-[10px] font-bold"
                      style={{color:i===0?"#F44336":i===6?"#2196F3":"rgba(255,255,255,0.35)"}}>
                      {d}
                    </p>
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              {loadMon ? (
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({length:42}).map((_,i)=>(
                    <div key={i} className="rounded-lg animate-pulse" style={{aspectRatio:"1",background:"rgba(255,255,255,0.04)"}}/>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({length:rows*7}).map((_,cellIdx)=>{
                    const dayNum = cellIdx - firstDay + 1;
                    const d = days.find(x=>x.day===dayNum);
                    const valid = dayNum >= 1 && dayNum <= days.length;
                    const today2 = isToday(dayNum);
                    const fest = topFestival(d);
                    const isSel = sel?.day === dayNum;

                    return (
                      <div key={cellIdx}
                        onClick={()=>valid&&d?setSel(isSel?null:d):null}
                        className={`rounded-lg p-1 transition-all relative ${valid?"cursor-pointer hover:scale-105":"opacity-0 pointer-events-none"}`}
                        style={{
                          minHeight:56,
                          background: isSel?"rgba(255,215,0,0.2)":dayBg(d),
                          border: today2?"2px solid #FFD700":isSel?"1.5px solid rgba(255,215,0,0.4)":"1px solid rgba(255,255,255,0.05)",
                        }}>
                        {valid && d && (
                          <>
                            <p className="font-sans font-black text-[11px] leading-none"
                              style={{color:today2?"#FFD700":"rgba(255,255,255,0.8)"}}>
                              {dayNum}
                            </p>
                            <p className="font-hindi text-[7px] leading-tight mt-0.5 truncate"
                              style={{
                                color:d.is_purnima?"#FFD700":d.is_amavasya?"#CE93D8":d.is_ekadashi?"#81C784":d.is_ashtami?"#64B5F6":"rgba(255,255,255,0.25)"
                              }}>
                              {d.tithi.name_hi.slice(0,5)}
                            </p>
                            {fest && (
                              <div className="absolute bottom-0.5 right-0.5" title={fest.name}>
                                <span style={{fontSize:8}}>{fest.emoji}</span>
                              </div>
                            )}
                            {today2 && <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full" style={{background:"#FFD700"}}/>}
                            {d.brahma_muhurta_tithi_note && (
                              <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full" style={{background:"#9C27B0"}} title="Tithi changes today"/>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Festival list for this month */}
              {!loadMon && (
                <div className="mt-4 space-y-1.5">
                  <p className="font-sans text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">
                    {MONTHS_EN[month-1]} {year} — Jain Festivals
                  </p>
                  {days.filter(d=>d.jain_festivals.length>0||d.is_purnima||d.is_amavasya).map(d=>(
                    <div key={d.day}
                      onClick={()=>setSel(sel?.day===d.day?null:d)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer hover:bg-white/5 transition-colors">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-sans font-black text-sm"
                        style={{background:d.jain_festivals[0]?`${(CAT_COLOR[d.jain_festivals[0].category]||"#FFD700")}20`:"rgba(255,255,255,0.06)",
                          color:d.jain_festivals[0]?CAT_COLOR[d.jain_festivals[0].category]||"#FFD700":"rgba(255,255,255,0.4)"}}>
                        {d.day}
                      </div>
                      <div className="flex-1 min-w-0">
                        {d.jain_festivals.map(f=>(
                          <p key={f.key} className="font-hindi text-[11px] font-bold truncate" style={{color:f.color}}>
                            {f.emoji} {f.nameHi}
                          </p>
                        ))}
                        {d.jain_festivals.length===0 && (d.is_purnima||d.is_amavasya) && (
                          <p className="font-hindi text-[11px]" style={{color:d.is_purnima?"#FFD700":"#CE93D8"}}>
                            {d.is_purnima?"🌕 पूर्णिमा":"🌑 अमावस्या"}
                          </p>
                        )}
                      </div>
                      <p className="font-hindi text-[9px] text-gray-600 shrink-0">{d.tithi.name_hi}</p>
                    </div>
                  ))}
                  {days.filter(d=>d.jain_festivals.length>0||d.is_purnima||d.is_amavasya).length===0 && (
                    <p className="font-sans text-[10px] text-gray-600 text-center py-2">No festivals this month</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── CHOGHADIYA VIEW ── */
          <div className="max-w-2xl mx-auto">
            {today && (
              <>
                <div className="rounded-2xl p-4 mb-6" style={{background:"rgba(255,215,0,0.07)",border:"1px solid rgba(255,215,0,0.2)"}}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-hindi font-black text-sm text-amber-300">⏰ आज का चौघड़िया</p>
                    <p className="font-hindi text-[10px] text-gray-500">{today.vaar.hi} · {today.tithi.name_hi}</p>
                  </div>
                  <p className="font-hindi text-[10px] text-amber-600/70">ब्रह्म मुहूर्त: 4:24 – 6:00 · सूर्योदय: 6:00 · सूर्यास्त: 18:00 (IST औसत)</p>
                </div>

                {/* Day Choghadiya */}
                <div className="mb-6">
                  <p className="font-hindi font-black text-sm text-white/60 uppercase mb-3">🌅 दिन का चौघड़िया (सूर्योदय से सूर्यास्त)</p>
                  <div className="space-y-2">
                    {today.choghadiya.day.map((c,i)=>(
                      <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3"
                        style={{background:`${c.color}12`,border:`1px solid ${c.color}25`}}>
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:c.color,boxShadow:`0 0 8px ${c.color}`}}/>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-hindi font-black text-sm" style={{color:c.auspicious?c.color:"rgba(255,255,255,0.4)"}}>
                              {c.nameHi}
                            </p>
                            {c.auspicious
                              ? <span className="font-sans text-[9px] font-bold rounded-full px-2 py-0.5" style={{background:`${c.color}20`,color:c.color}}>शुभ</span>
                              : <span className="font-sans text-[9px] font-bold rounded-full px-2 py-0.5 bg-red-900/30 text-red-400">वर्जित</span>}
                          </div>
                        </div>
                        <p className="font-sans text-[10px] text-gray-400 shrink-0">{c.startTime} – {c.endTime}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Night Choghadiya */}
                <div>
                  <p className="font-hindi font-black text-sm text-white/60 uppercase mb-3">🌙 रात का चौघड़िया (सूर्यास्त से सूर्योदय)</p>
                  <div className="space-y-2">
                    {today.choghadiya.night.map((c,i)=>(
                      <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3"
                        style={{
                          background: c.isBrahmaMuhurta ? "rgba(156,39,176,0.2)" : `${c.color}10`,
                          border:`1px solid ${c.isBrahmaMuhurta?"rgba(156,39,176,0.4)":c.color+"20"}`,
                        }}>
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:c.isBrahmaMuhurta?"#9C27B0":c.color}}/>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-hindi font-black text-sm" style={{color:c.isBrahmaMuhurta?"#CE93D8":c.auspicious?c.color:"rgba(255,255,255,0.4)"}}>
                              {c.nameHi}
                            </p>
                            {c.isBrahmaMuhurta && (
                              <span className="font-hindi text-[9px] font-bold rounded-full px-2 py-0.5" style={{background:"rgba(156,39,176,0.3)",color:"#CE93D8"}}>
                                जैन साधना का सर्वोत्तम समय
                              </span>
                            )}
                            {!c.isBrahmaMuhurta && (c.auspicious
                              ? <span className="font-sans text-[9px] rounded-full px-2 py-0.5" style={{background:`${c.color}15`,color:c.color}}>शुभ</span>
                              : <span className="font-sans text-[9px] rounded-full px-2 py-0.5 bg-red-900/20 text-red-400">वर्जित</span>)}
                          </div>
                        </div>
                        <p className="font-sans text-[10px] text-gray-400 shrink-0">{c.startTime} – {c.endTime}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-2xl p-4 text-center" style={{background:"rgba(255,215,0,0.04)",border:"1px dashed rgba(255,215,0,0.15)"}}>
                  <p className="font-hindi text-[10px] text-amber-600/80">
                    चौघड़िया IST के औसत सूर्योदय (6:00) और सूर्यास्त (18:00) पर आधारित है।
                    सटीक समय के लिए अपने स्थानीय जैन पंचांग से मिलान करें।
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
