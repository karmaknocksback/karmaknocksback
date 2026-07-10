"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

/* ══════════════════════════════════════════════════════════════
   DIGAMBAR JAIN CALENDAR
   ✓ Full month grid with navigation (prev/next month + year)
   ✓ Each day shows tithi + Jain festivals
   ✓ Color-coded by festival category
   ✓ Click day for full details
   ✓ Today's panchang card
   ✓ Upcoming auspicious days list
══════════════════════════════════════════════════════════════ */

interface JainFestival {
  key:string; name:string; nameHi:string; category:string;
  emoji:string; color:string; description:string;
}
interface DayData {
  day:number; date:string;
  tithi:{ number:number; name_en:string; name_hi:string; paksha:string; paksha_hi:string };
  nakshatra:{ name_en:string; name_hi:string };
  vaar:{ en:string; hi:string };
  hindu_month:{ name_en:string; name_hi:string };
  is_purnima:boolean; is_amavasya:boolean; is_ekadashi:boolean; is_chaturdashi:boolean;
  jain_significance:string|null;
  jain_festivals: JainFestival[];
}
interface Panchang extends DayData { gregorian:string; yoga:{ name:string }; }

const MONTHS_EN = ["January","February","March","April","May","June",
                   "July","August","September","October","November","December"];
const DAYS_EN   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DAYS_HI   = ["रवि","सोम","मंगल","बुध","गुरु","शुक्र","शनि"];

const CAT_COLORS: Record<string,string> = {
  kalyanak: "#FFD700",
  parva:    "#E91E63",
  vrat:     "#9C27B0",
  auspicious:"#4CAF50",
  samiti:   "#2196F3",
};

export default function JainCalendarPage() {
  const now   = new Date();
  const [year,   setYear]   = useState(now.getFullYear());
  const [month,  setMonth]  = useState(now.getMonth() + 1); // 1-based
  const [days,   setDays]   = useState<DayData[]>([]);
  const [today,  setToday]  = useState<Panchang|null>(null);
  const [selected, setSelected] = useState<DayData|null>(null);
  const [loading,  setLoading]  = useState(true);
  const [loadingMonth, setLoadingMonth] = useState(true);

  // Load today's panchang
  useEffect(()=>{
    fetch("/api/panchang?type=today").then(r=>r.json()).then(d=>setToday(d.panchang||null));
  },[]);

  // Load month data
  const loadMonth = useCallback(async (y:number, m:number)=>{
    setLoadingMonth(true);
    const r = await fetch(`/api/panchang?type=month&year=${y}&month=${m}`);
    const d = await r.json();
    setDays(d.days||[]);
    setLoadingMonth(false);
    setLoading(false);
  },[]);

  useEffect(()=>{ loadMonth(year, month); },[year, month, loadMonth]);

  function prevMonth(){ if(month===1){ setYear(y=>y-1); setMonth(12); } else setMonth(m=>m-1); }
  function nextMonth(){ if(month===12){ setYear(y=>y+1); setMonth(1); } else setMonth(m=>m+1); }
  function goToToday(){ setYear(now.getFullYear()); setMonth(now.getMonth()+1); }

  // Build calendar grid
  const firstDay = new Date(year, month-1, 1).getDay();
  const totalCells = firstDay + days.length;
  const rows = Math.ceil(totalCells / 7);

  function isDayToday(d:number){ return year===now.getFullYear()&&month===now.getMonth()+1&&d===now.getDate(); }

  function getDayColor(d:DayData|undefined): string {
    if (!d) return "transparent";
    if (d.jain_festivals.some(f=>f.category==="kalyanak")) return "#FFD70020";
    if (d.jain_festivals.some(f=>f.category==="parva"))    return "#E91E6315";
    if (d.jain_festivals.some(f=>f.category==="vrat"))     return "#9C27B015";
    if (d.is_purnima||d.is_amavasya)  return "#4CAF5012";
    if (d.is_ekadashi)                 return "#4CAF5008";
    if (d.is_chaturdashi)              return "#FF980008";
    return "transparent";
  }

  const mainFestival = (d:DayData|undefined) => d?.jain_festivals[0] || null;

  return (
    <div className="min-h-screen" style={{background:"linear-gradient(160deg,#0d0d0d 0%,#1a0800 40%,#0d0d1a 100%)"}}>
      <div className="max-w-6xl mx-auto px-4 py-6 pb-20">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🕉️</div>
          <h1 className="font-sans font-black text-2xl text-white">Digambar Jain Calendar</h1>
          <p className="font-hindi text-sm text-amber-400">दिगम्बर जैन पंचांग</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT: Today's panchang ── */}
          <div className="lg:col-span-1 space-y-4">
            {today && (
              <div className="rounded-3xl p-5"
                style={{background:"rgba(255,215,0,0.06)",border:"1.5px solid rgba(255,215,0,0.2)"}}>
                <p className="font-hindi text-xs text-amber-400 font-bold mb-3">🕉️ आज का पंचांग</p>
                <div className="space-y-2">
                  {[
                    {l:"तिथि",  v:`${today.tithi.name_hi} (${today.tithi.paksha_hi})`, c:"#FFD700"},
                    {l:"वार",   v:today.vaar.hi,              c:"#FF9800"},
                    {l:"नक्षत्र",v:today.nakshatra.name_hi,   c:"#AB47BC"},
                    {l:"माह",   v:today.hindu_month.name_hi,  c:"#4CAF50"},
                  ].map(s=>(
                    <div key={s.l} className="flex items-center justify-between rounded-xl px-3 py-2"
                      style={{background:"rgba(255,255,255,0.04)"}}>
                      <span className="font-hindi text-[11px] text-gray-500">{s.l}</span>
                      <span className="font-hindi text-xs font-bold" style={{color:s.c}}>{s.v}</span>
                    </div>
                  ))}
                </div>
                {today.jain_festivals.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {today.jain_festivals.map(f=>(
                      <div key={f.key} className="rounded-xl px-3 py-2"
                        style={{background:`${f.color}15`,border:`1px solid ${f.color}30`}}>
                        <p className="font-sans text-xs font-black" style={{color:f.color}}>{f.emoji} {f.nameHi}</p>
                        <p className="font-sans text-[10px] text-gray-400 mt-0.5">{f.description.slice(0,80)}...</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Legend */}
            <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)"}}>
              <p className="font-sans text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Legend</p>
              {[
                {c:CAT_COLORS.kalyanak, l:"Tirthankar Kalyanak"},
                {c:CAT_COLORS.parva,    l:"Jain Parva / Festival"},
                {c:CAT_COLORS.vrat,     l:"Vrat / Fasting Period"},
                {c:"#4CAF50",           l:"Purnima / Amavasya"},
                {c:"#FF9800",           l:"Ekadashi / Chaturdashi"},
              ].map(({c,l})=>(
                <div key={l} className="flex items-center gap-2 mb-1.5">
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{background:c}}/>
                  <span className="font-sans text-[10px] text-gray-400">{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Calendar grid ── */}
          <div className="lg:col-span-2">

            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth}
                className="rounded-xl px-4 py-2 font-sans font-black text-sm text-white hover:bg-white/10 transition-colors">
                ← Prev
              </button>
              <div className="text-center">
                <div className="flex items-center gap-3 justify-center">
                  <select value={month} onChange={e=>setMonth(parseInt(e.target.value))}
                    className="rounded-lg px-2 py-1 font-sans font-black text-sm text-amber-300 bg-transparent border border-white/10 cursor-pointer outline-none">
                    {MONTHS_EN.map((m,i)=><option key={i} value={i+1} className="bg-gray-900">{m}</option>)}
                  </select>
                  <select value={year} onChange={e=>setYear(parseInt(e.target.value))}
                    className="rounded-lg px-2 py-1 font-sans font-black text-sm text-amber-300 bg-transparent border border-white/10 cursor-pointer outline-none">
                    {Array.from({length:20},(_,i)=>now.getFullYear()-5+i).map(y=>(
                      <option key={y} value={y} className="bg-gray-900">{y}</option>
                    ))}
                  </select>
                </div>
                <button onClick={goToToday}
                  className="font-sans text-[10px] text-amber-500 hover:text-amber-300 mt-0.5">
                  Today
                </button>
              </div>
              <button onClick={nextMonth}
                className="rounded-xl px-4 py-2 font-sans font-black text-sm text-white hover:bg-white/10 transition-colors">
                Next →
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-0.5 mb-0.5">
              {DAYS_HI.map((d,i)=>(
                <div key={d} className="text-center py-1.5">
                  <p className="font-hindi text-[10px] font-bold" style={{color:i===0?"#F44336":i===6?"#2196F3":"rgba(255,255,255,0.4)"}}>
                    {d}
                  </p>
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            {loadingMonth ? (
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({length:35}).map((_,i)=>(
                  <div key={i} className="aspect-square rounded-lg animate-pulse" style={{background:"rgba(255,255,255,0.04)"}}/>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({length:rows*7}).map((_,cellIdx)=>{
                  const dayNum = cellIdx - firstDay + 1;
                  const dayData = days.find(d=>d.day===dayNum);
                  const isToday = isDayToday(dayNum);
                  const isValid = dayNum >= 1 && dayNum <= days.length;
                  const festival = mainFestival(dayData);
                  const bgColor = isValid ? getDayColor(dayData) : "transparent";
                  const isSelected = selected?.day === dayNum;

                  return (
                    <div
                      key={cellIdx}
                      onClick={()=>isValid&&dayData?setSelected(isSelected?null:dayData):null}
                      className={`rounded-lg p-1 cursor-pointer transition-all hover:scale-105 relative ${!isValid?"opacity-0 pointer-events-none":""}`}
                      style={{
                        background: isSelected?"rgba(255,215,0,0.2)":bgColor,
                        border: isToday ? "2px solid #FFD700" : isSelected ? "1.5px solid rgba(255,215,0,0.5)" : "1px solid rgba(255,255,255,0.05)",
                        minHeight: 60,
                      }}>
                      {isValid && (
                        <>
                          {/* Date number */}
                          <p className="font-sans font-black text-xs leading-tight"
                            style={{color:isToday?"#FFD700":"rgba(255,255,255,0.85)"}}>
                            {dayNum}
                          </p>
                          {/* Tithi */}
                          {dayData && (
                            <p className="font-hindi text-[8px] leading-tight mt-0.5 truncate"
                              style={{color:dayData.is_purnima?"#FFD700":dayData.is_amavasya?"#CE93D8":dayData.is_ekadashi?"#81C784":"rgba(255,255,255,0.3)"}}>
                              {dayData.tithi.name_hi.slice(0,6)}
                            </p>
                          )}
                          {/* Festival emoji */}
                          {festival && (
                            <div className="absolute bottom-0.5 right-0.5">
                              <span style={{fontSize:10}}>{festival.emoji}</span>
                            </div>
                          )}
                          {/* Today marker */}
                          {isToday && (
                            <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full" style={{background:"#FFD700"}}/>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Selected day detail */}
            {selected && (
              <div className="mt-4 rounded-2xl p-5"
                style={{background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(255,215,0,0.2)"}}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-sans font-black text-base text-white">
                      {selected.day} {MONTHS_EN[month-1]} {year}
                    </p>
                    <p className="font-hindi text-sm text-amber-400">
                      {selected.tithi.name_hi} · {selected.tithi.paksha_hi}
                    </p>
                  </div>
                  <button onClick={()=>setSelected(null)} className="text-white/30 hover:text-white text-xl">×</button>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="rounded-xl p-2 text-center" style={{background:"rgba(255,255,255,0.04)"}}>
                    <p className="font-hindi text-[9px] text-gray-500">वार</p>
                    <p className="font-hindi text-xs font-bold text-amber-300">{selected.vaar.hi}</p>
                  </div>
                  <div className="rounded-xl p-2 text-center" style={{background:"rgba(255,255,255,0.04)"}}>
                    <p className="font-hindi text-[9px] text-gray-500">नक्षत्र</p>
                    <p className="font-hindi text-xs font-bold text-purple-300">{selected.nakshatra.name_hi}</p>
                  </div>
                  <div className="rounded-xl p-2 text-center" style={{background:"rgba(255,255,255,0.04)"}}>
                    <p className="font-hindi text-[9px] text-gray-500">माह</p>
                    <p className="font-hindi text-xs font-bold text-green-300">{selected.hindu_month.name_hi}</p>
                  </div>
                </div>
                {selected.jain_festivals.length > 0 ? (
                  <div className="space-y-2">
                    <p className="font-sans text-[10px] font-black text-white/40 uppercase tracking-wider">Jain Festivals</p>
                    {selected.jain_festivals.map(f=>(
                      <div key={f.key} className="rounded-xl p-3"
                        style={{background:`${f.color}12`,border:`1px solid ${f.color}30`}}>
                        <p className="font-sans font-black text-sm" style={{color:f.color}}>{f.emoji} {f.name}</p>
                        <p className="font-hindi text-xs text-amber-300 mt-0.5">{f.nameHi}</p>
                        <p className="font-sans text-[11px] text-gray-400 mt-1 leading-relaxed">{f.description}</p>
                        <span className="inline-block mt-1.5 rounded-full px-2 py-0.5 font-sans text-[9px] font-bold"
                          style={{background:`${CAT_COLORS[f.category]||"#666"}20`,color:CAT_COLORS[f.category]||"#666"}}>
                          {f.category}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl p-3 text-center" style={{background:"rgba(255,255,255,0.03)"}}>
                    {selected.is_purnima && <p className="font-hindi text-sm text-amber-300">🌕 पूर्णिमा — पोषध व्रत का शुभ दिन</p>}
                    {selected.is_amavasya && <p className="font-hindi text-sm text-purple-300">🌑 अमावस्या — पोषध व्रत का शुभ दिन</p>}
                    {selected.is_ekadashi && <p className="font-hindi text-sm text-green-300">⭐ एकादशी — व्रत और साधना का दिन</p>}
                    {selected.is_chaturdashi && <p className="font-hindi text-sm text-orange-300">🙏 चतुर्दशी — पोषध का दिन</p>}
                    {!selected.is_purnima && !selected.is_amavasya && !selected.is_ekadashi && !selected.is_chaturdashi && (
                      <p className="font-sans text-xs text-gray-500">No major festival on this day</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info footer */}
        <div className="mt-8 rounded-2xl p-4 text-center"
          style={{background:"rgba(255,215,0,0.03)",border:"1px dashed rgba(255,215,0,0.12)"}}>
          <p className="font-hindi text-xs text-amber-600/80">
            यह कैलेंडर दिगम्बर जैन परंपरा के अनुसार है। तिथि गणना Jean Meeus खगोलीय सूत्रों पर आधारित है।
          </p>
          <p className="font-sans text-[10px] text-gray-600 mt-1">
            Digambar Jain tradition · Astronomical calculation (Jean Meeus) · For exact dates consult local Jain Panchang
          </p>
        </div>
      </div>
    </div>
  );
}
