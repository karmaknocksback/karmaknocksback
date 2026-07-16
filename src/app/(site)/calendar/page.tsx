"use client";
import { useState, useEffect, useCallback } from "react";

/* ══════════════════════════════════════════════════════════════
   DIGAMBAR JAIN PANCHANG CALENDAR
   Inspired by physical Tirthankar Vardhaman Jain Panchang
   ✓ Bold large date numbers
   ✓ Tithi + Paksha clearly shown in each cell
   ✓ Color-coded: Purnima=Gold, Amavasya=Purple, Kalyanak=Red
   ✓ Right panel: Month's festivals & vrats
   ✓ Left panel: Today's detailed panchang
   ✓ Brahma Muhurta tithi calculation (4:30 AM)
══════════════════════════════════════════════════════════════ */

interface JainFest { key:string; name:string; nameHi:string; emoji:string; color:string; description:string; descriptionHi?:string; category:string; }
interface DayData {
  day:number; date:string;
  tithi:{ number:number; name_hi:string; name_en:string; paksha:string; paksha_hi:string };
  nakshatra:{ name_hi:string; name_en:string };
  yoga:{ name:string };
  vaar:{ en:string; hi:string; num:number };
  hindu_month:{ name_hi:string; name_en:string };
  is_purnima:boolean; is_amavasya:boolean; is_ekadashi:boolean;
  is_chaturdashi:boolean; is_ashtami:boolean;
  jain_significance:string|null;
  brahma_muhurta_tithi_note:string|null;
  jain_festivals:JainFest[];
  choghadiya:{ day:{name:string;nameHi:string;color:string;startTime:string;endTime:string;auspicious:boolean}[]; night:{name:string;nameHi:string;color:string;startTime:string;endTime:string;auspicious:boolean;isBrahmaMuhurta?:boolean}[] };
}

const VAARS_HI = ["रवि","सोम","मंगल","बुध","गुरु","शुक्र","शनि"];
const VAARS_EN = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_HI = ["जनवरी","फ़रवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितम्बर","अक्टूबर","नवम्बर","दिसम्बर"];

function getDayBg(d:DayData, isSel:boolean, isToday:boolean): { bg:string; border:string; textColor:string } {
  const hasMajorFest = d.jain_festivals.some(f=>f.category==="kalyanak"||f.category==="mahaparva");
  const hasParva     = d.jain_festivals.some(f=>f.category==="parva"||f.category==="ashtaahnika");
  
  if (isToday)      return { bg:"#FEF3C7", border:"3px solid #F59E0B", textColor:"#92400E" };
  if (isSel)        return { bg:"#DBEAFE", border:"2px solid #3B82F6", textColor:"#1E3A5F" };
  if (hasMajorFest) return { bg:"#FFF1F2", border:"1.5px solid #FDA4AF", textColor:"#9F1239" };
  if (hasParva)     return { bg:"#FDF4FF", border:"1.5px solid #E9D5FF", textColor:"#7E22CE" };
  if (d.is_purnima) return { bg:"#FFFBEB", border:"1.5px solid #FDE68A", textColor:"#92400E" };
  if (d.is_amavasya)return { bg:"#F5F3FF", border:"1.5px solid #DDD6FE", textColor:"#5B21B6" };
  if (d.is_ekadashi)return { bg:"#F0FDF4", border:"1.5px solid #BBF7D0", textColor:"#14532D" };
  if (d.is_ashtami) return { bg:"#EFF6FF", border:"1px solid #BFDBFE",  textColor:"#1E3A8A" };
  if (d.vaar.num===0)return{ bg:"#FFF7ED", border:"1px solid #FDE8CC",  textColor:"#7C2D12" };
  if (d.vaar.num===6)return{ bg:"#F0F9FF", border:"1px solid #BAE6FD",  textColor:"#0C4A6E" };
  return { bg:"white",   border:"1px solid #E5E7EB",  textColor:"#111827" };
}

export default function JainCalendarPage() {
  const now = new Date();
  const [year,   setYear]      = useState(now.getFullYear());
  const [month,  setMonth]     = useState(now.getMonth()+1);
  const [days,   setDays]      = useState<DayData[]>([]);
  const [today,  setToday]     = useState<DayData|null>(null);
  const [sel,    setSel]       = useState<DayData|null>(null);
  const [loading,setLoading]   = useState(true);
  const [loadMon,setLoadMon]   = useState(true);
  const [view,   setView]      = useState<"calendar"|"choghadiya">("calendar");

  useEffect(()=>{
    fetch("/api/panchang?type=today").then(r=>r.json()).then(d=>setToday(d.panchang||null));
  },[]);

  const loadMonth = useCallback(async(y:number,m:number)=>{
    setLoadMon(true); setSel(null);
    const r = await fetch(`/api/panchang?type=month&year=${y}&month=${m}`);
    const d = await r.json();
    setDays(d.days||[]); setLoadMon(false); setLoading(false);
  },[]);
  useEffect(()=>{ loadMonth(year,month); },[year,month,loadMonth]);

  const prev=()=>{ if(month===1){setYear(y=>y-1);setMonth(12);}else setMonth(m=>m-1); };
  const next=()=>{ if(month===12){setYear(y=>y+1);setMonth(1);}else setMonth(m=>m+1); };
  const goToday=()=>{ setYear(now.getFullYear());setMonth(now.getMonth()+1); };

  const firstDay = new Date(year,month-1,1).getDay();
  const rows     = Math.ceil((firstDay+days.length)/7);
  const isToday  = (d:number)=>year===now.getFullYear()&&month===now.getMonth()+1&&d===now.getDate();
  const festDays = days.filter(d=>d.jain_festivals.length>0||d.is_purnima||d.is_amavasya||d.is_ekadashi||d.is_chaturdashi||d.is_ashtami);
  const selDay   = sel || today;

  return (
    <div className="min-h-screen pb-8" style={{background:"linear-gradient(180deg,#FFFDF5 0%,#FFF8F0 100%)"}}>

      {/* ── HEADER ── */}
      <div className="text-center py-6 px-4" style={{background:"linear-gradient(135deg,#B91C1C 0%,#7C2D12 100%)"}}>
        <div className="max-w-7xl mx-auto">
          <h1 className="font-sans font-black text-white text-2xl sm:text-3xl tracking-wide mb-1">
            🕉️ दिगम्बर जैन पंचांग
          </h1>
          <p className="font-sans text-red-200 text-sm">Digambar Jain Panchang · Brahma Muhurta Tithi · {year}</p>
          <div className="flex gap-2 justify-center mt-3">
            {(["calendar","choghadiya"] as const).map(v=>(
              <button key={v} onClick={()=>setView(v)}
                className="rounded-full px-4 py-1.5 font-sans font-black text-xs transition-all"
                style={{background:view===v?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.15)",color:view===v?"#B91C1C":"white"}}>
                {v==="calendar"?"📅 Calendar":"⏰ Choghadiya"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view==="calendar" ? (
        <div className="max-w-7xl mx-auto px-3 py-4">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">

            {/* ── LEFT PANEL — Panchang Details ── */}
            <div className="xl:col-span-1 space-y-3">
              
              {/* Today's Panchang */}
              {today && (
                <div className="rounded-2xl overflow-hidden shadow-md"
                  style={{border:"2px solid #F59E0B"}}>
                  <div className="px-4 py-2.5" style={{background:"linear-gradient(135deg,#F59E0B,#D97706)"}}>
                    <p className="font-sans font-black text-white text-sm">🕉️ आज का पंचांग</p>
                    <p className="font-sans text-yellow-100 text-[10px]">Today's Panchang · {today.date}</p>
                  </div>
                  <div className="bg-white px-4 py-3 space-y-2">
                    {[
                      {l:"तिथि",  v:`${today.tithi.name_hi}`,           c:"#B45309"},
                      {l:"पक्ष",  v:today.tithi.paksha_hi,              c:"#D97706"},
                      {l:"वार",   v:today.vaar.hi,                       c:"#047857"},
                      {l:"नक्षत्र",v:today.nakshatra.name_hi,            c:"#7C3AED"},
                      {l:"योग",   v:today.yoga.name,                     c:"#0369A1"},
                      {l:"माह",   v:today.hindu_month.name_hi,           c:"#B91C1C"},
                    ].map(s=>(
                      <div key={s.l} className="flex justify-between items-center py-1" style={{borderBottom:"1px solid #F9FAFB"}}>
                        <span className="font-hindi text-[11px] text-gray-500 font-bold">{s.l}</span>
                        <span className="font-hindi text-[11px] font-black" style={{color:s.c}}>{s.v}</span>
                      </div>
                    ))}
                    {today.jain_significance && (
                      <div className="mt-2 rounded-lg px-3 py-2 text-center"
                        style={{background:"#FEF3C7",border:"1px solid #FDE68A"}}>
                        <p className="font-hindi text-[11px] text-amber-800 font-bold">{today.jain_significance}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Selected day detail */}
              {sel && (
                <div className="rounded-2xl overflow-hidden shadow-md" style={{border:"2px solid #3B82F6"}}>
                  <div className="px-4 py-2.5" style={{background:"linear-gradient(135deg,#3B82F6,#1D4ED8)"}}>
                    <div className="flex items-center justify-between">
                      <p className="font-sans font-black text-white text-sm">{sel.day} {MONTHS_HI[month-1]}</p>
                      <button onClick={()=>setSel(null)} className="text-white/60 hover:text-white">✕</button>
                    </div>
                    <p className="font-hindi text-blue-100 text-[10px]">{sel.tithi.name_hi} · {sel.tithi.paksha_hi}</p>
                  </div>
                  <div className="bg-white px-4 py-3 space-y-2">
                    {[
                      {l:"वार",   v:sel.vaar.hi,           c:"#047857"},
                      {l:"नक्षत्र",v:sel.nakshatra.name_hi, c:"#7C3AED"},
                      {l:"योग",   v:sel.yoga.name,          c:"#0369A1"},
                      {l:"माह",   v:sel.hindu_month.name_hi, c:"#B91C1C"},
                    ].map(s=>(
                      <div key={s.l} className="flex justify-between py-1" style={{borderBottom:"1px solid #F9FAFB"}}>
                        <span className="font-hindi text-[11px] text-gray-500">{s.l}</span>
                        <span className="font-hindi text-[11px] font-black" style={{color:s.c}}>{s.v}</span>
                      </div>
                    ))}
                    {sel.jain_festivals.map(f=>(
                      <div key={f.key} className="rounded-xl px-3 py-2 mt-1"
                        style={{background:`${f.color}10`,border:`1px solid ${f.color}30`}}>
                        <p className="font-sans font-black text-[11px]" style={{color:f.color}}>{f.emoji} {f.nameHi}</p>
                        {f.descriptionHi && <p className="font-hindi text-[9px] text-gray-500 mt-0.5">{f.descriptionHi.slice(0,80)}...</p>}
                      </div>
                    ))}
                    {sel.brahma_muhurta_tithi_note && (
                      <div className="rounded-lg px-2 py-1.5 mt-1" style={{background:"#F5F3FF",border:"1px solid #DDD6FE"}}>
                        <p className="font-hindi text-[9px] text-purple-700">{sel.brahma_muhurta_tithi_note}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="rounded-2xl bg-white shadow-sm p-4" style={{border:"1px solid #E5E7EB"}}>
                <p className="font-sans font-black text-xs text-gray-500 uppercase tracking-widest mb-3">Legend</p>
                {[
                  {bg:"#FFF1F2",bd:"#FDA4AF",l:"Tirthankar Kalyanak"},
                  {bg:"#FDF4FF",bd:"#E9D5FF",l:"Jain Parva"},
                  {bg:"#FFFBEB",bd:"#FDE68A",l:"Purnima 🌕"},
                  {bg:"#F5F3FF",bd:"#DDD6FE",l:"Amavasya 🌑"},
                  {bg:"#F0FDF4",bd:"#BBF7D0",l:"Ekadashi ⭐"},
                  {bg:"#EFF6FF",bd:"#BFDBFE",l:"Ashtami 🌟"},
                ].map(({bg,bd,l})=>(
                  <div key={l} className="flex items-center gap-2 mb-1.5">
                    <div className="w-4 h-4 rounded-sm shrink-0" style={{background:bg,border:`1.5px solid ${bd}`}}/>
                    <span className="font-sans text-[10px] text-gray-500">{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── CENTER — Calendar Grid ── */}
            <div className="xl:col-span-2">
              {/* Navigation */}
              <div className="flex items-center justify-between mb-4 bg-white rounded-2xl p-3 shadow-sm" style={{border:"1px solid #E5E7EB"}}>
                <button onClick={prev} className="w-9 h-9 rounded-full flex items-center justify-center font-sans font-black text-gray-600 hover:bg-gray-100 transition-colors">←</button>
                <div className="text-center">
                  <div className="flex items-center gap-3 justify-center">
                    <select value={month} onChange={e=>setMonth(+e.target.value)}
                      className="font-sans font-black text-base text-red-800 bg-transparent outline-none cursor-pointer">
                      {MONTHS_EN.map((m,i)=><option key={i} value={i+1}>{MONTHS_HI[i]} / {m}</option>)}
                    </select>
                    <select value={year} onChange={e=>setYear(+e.target.value)}
                      className="font-sans font-black text-base text-red-800 bg-transparent outline-none cursor-pointer">
                      {Array.from({length:25},(_,i)=>2020+i).map(y=><option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <button onClick={goToday} className="font-sans text-[10px] text-amber-600 hover:text-amber-800 font-bold">→ आज पर जाएं</button>
                </div>
                <button onClick={next} className="w-9 h-9 rounded-full flex items-center justify-center font-sans font-black text-gray-600 hover:bg-gray-100 transition-colors">→</button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {VAARS_EN.map((d,i)=>(
                  <div key={d} className="rounded-lg py-2 text-center"
                    style={{background:i===0?"#FEE2E2":i===6?"#DBEAFE":"#F3F4F6"}}>
                    <p className="font-sans font-black text-[10px]" style={{color:i===0?"#B91C1C":i===6?"#1D4ED8":"#374151"}}>{d}</p>
                    <p className="font-hindi text-[9px]" style={{color:i===0?"#B91C1C":i===6?"#1D4ED8":"#6B7280"}}>{VAARS_HI[i]}</p>
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              {loadMon ? (
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({length:42}).map((_,i)=>(
                    <div key={i} className="rounded-xl animate-pulse bg-gray-100" style={{minHeight:72}}/>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({length:rows*7}).map((_,cellIdx)=>{
                    const dayNum = cellIdx-firstDay+1;
                    const d      = days.find(x=>x.day===dayNum);
                    const valid  = dayNum>=1&&dayNum<=days.length;
                    const today2 = isToday(dayNum);
                    const isSel  = sel?.day===dayNum;
                    if (!valid) return <div key={cellIdx} className="rounded-xl" style={{minHeight:72}}/>;
                    if (!d)     return <div key={cellIdx} className="rounded-xl bg-gray-50" style={{minHeight:72}}/>;

                    const { bg, border, textColor } = getDayBg(d, isSel, today2);
                    const topFest = d.jain_festivals[0];
                    const pakshaNum = d.tithi.number<=15 ? d.tithi.number : d.tithi.number-15;

                    return (
                      <div key={cellIdx}
                        onClick={()=>setSel(isSel?null:d)}
                        className="rounded-xl p-1.5 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] select-none"
                        style={{minHeight:72,background:bg,border}}>

                        {/* Date number — large and bold like physical calendar */}
                        <div className="flex items-start justify-between mb-0.5">
                          <p className="font-sans font-black leading-none" style={{fontSize:"clamp(18px,3vw,26px)",color:textColor}}>
                            {dayNum}
                          </p>
                          {topFest && <span style={{fontSize:10}}>{topFest.emoji}</span>}
                        </div>

                        {/* Tithi — like physical calendar */}
                        <p className="font-hindi leading-tight" style={{fontSize:"clamp(7px,1.2vw,9px)",color:textColor,opacity:0.85}}>
                          {d.tithi.paksha==="Shukla"?"शु":"कृ"} {pakshaNum}
                        </p>
                        <p className="font-hindi leading-tight truncate" style={{fontSize:"clamp(7px,1.2vw,9px)",color:textColor,opacity:0.7}}>
                          {d.tithi.name_hi.slice(0,6)}
                        </p>

                        {/* Nakshatra */}
                        <p className="font-hindi leading-tight truncate" style={{fontSize:"clamp(6px,1vw,8px)",color:textColor,opacity:0.5}}>
                          {d.nakshatra.name_hi.slice(0,5)}
                        </p>

                        {/* Today dot */}
                        {today2 && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-0.5 mx-auto"/>}

                        {/* Brahma muhurta change warning */}
                        {d.brahma_muhurta_tithi_note && (
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-0.5"/>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── RIGHT PANEL — Month Festivals ── */}
            <div className="xl:col-span-1 space-y-3">

              {/* Month heading */}
              <div className="rounded-2xl overflow-hidden shadow-md" style={{border:"2px solid #B91C1C"}}>
                <div className="px-4 py-2.5" style={{background:"linear-gradient(135deg,#B91C1C,#7C2D12)"}}>
                  <p className="font-sans font-black text-white text-sm">📅 माह के प्रमुख व्रत</p>
                  <p className="font-sans text-red-200 text-[10px]">{MONTHS_HI[month-1]} {year} के व्रत व पर्व</p>
                </div>
                <div className="bg-white divide-y divide-gray-100 max-h-72 overflow-y-auto">
                  {festDays.length===0 ? (
                    <p className="font-sans text-xs text-gray-400 text-center py-4">No festivals</p>
                  ) : festDays.map(d=>{
                    const topFest = d.jain_festivals[0];
                    const color = topFest?.color || (d.is_purnima?"#F59E0B":d.is_amavasya?"#7C3AED":d.is_ekadashi?"#059669":"#6B7280");
                    return (
                      <div key={d.day} onClick={()=>setSel(sel?.day===d.day?null:d)}
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50">
                        {/* Date badge */}
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-sans font-black text-sm"
                          style={{background:`${color}15`,color}}>
                          {d.day}
                        </div>
                        <div className="flex-1 min-w-0">
                          {topFest ? (
                            <>
                              <p className="font-hindi font-black text-[10px] truncate" style={{color}}>{topFest.emoji} {topFest.nameHi}</p>
                              <p className="font-hindi text-[9px] text-gray-400">{d.tithi.name_hi} · {d.vaar.hi}</p>
                            </>
                          ) : (
                            <>
                              <p className="font-hindi font-black text-[10px]" style={{color}}>
                                {d.is_purnima?"🌕 पूर्णिमा":d.is_amavasya?"🌑 अमावस्या":d.is_ekadashi?"⭐ एकादशी":d.is_chaturdashi?"🙏 चतुर्दशी":"🌟 अष्टमी"}
                              </p>
                              <p className="font-hindi text-[9px] text-gray-400">{d.tithi.name_hi} · {d.vaar.hi}</p>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sarvarth Siddhi Yoga note */}
              <div className="rounded-2xl bg-white shadow-sm p-4" style={{border:"1px solid #BBF7D0"}}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"/>
                  <p className="font-sans font-black text-xs text-green-700">सर्वार्थ सिद्धि योग</p>
                </div>
                <p className="font-hindi text-[9px] text-gray-500 leading-relaxed">
                  जब तिथि, नक्षत्र और वार का विशेष संयोग हो। इस दिन किए कार्य अवश्य सफल होते हैं।
                </p>
              </div>

              {/* Brahma muhurta note */}
              <div className="rounded-2xl bg-white shadow-sm p-4" style={{border:"1px solid #DDD6FE"}}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-purple-400"/>
                  <p className="font-sans font-black text-xs text-purple-700">ब्रह्म मुहूर्त नियम</p>
                </div>
                <p className="font-hindi text-[9px] text-gray-500 leading-relaxed">
                  जैन परंपरा में तिथि की गणना ब्रह्म मुहूर्त (4:30 AM) पर होती है। 🟣 चिह्न = उस दिन तिथि परिवर्तन।
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* CHOGHADIYA VIEW */
        <div className="max-w-2xl mx-auto px-4 py-6">
          {today && (
            <>
              <div className="rounded-2xl overflow-hidden shadow-md mb-5" style={{border:"2px solid #F59E0B"}}>
                <div className="px-4 py-3 flex items-center justify-between" style={{background:"linear-gradient(135deg,#F59E0B,#D97706)"}}>
                  <div>
                    <p className="font-sans font-black text-white">⏰ आज का चौघड़िया</p>
                    <p className="font-hindi text-yellow-100 text-[10px]">{today.vaar.hi} · {today.tithi.name_hi} · {today.date}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Day */}
                <div>
                  <p className="font-sans font-black text-sm text-gray-700 mb-3">🌅 दिन का चौघड़िया</p>
                  <div className="space-y-2">
                    {today.choghadiya.day.map((c,i)=>(
                      <div key={i} className="rounded-xl px-4 py-2.5 flex items-center justify-between"
                        style={{background:`${c.color}10`,border:`1px solid ${c.color}25`}}>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{background:c.color}}/>
                          <p className="font-hindi font-black text-sm" style={{color:c.auspicious?c.color:"rgba(0,0,0,0.4)"}}>
                            {c.nameHi}
                          </p>
                          {!c.auspicious && <span className="text-[9px] text-red-500 font-bold">वर्जित</span>}
                        </div>
                        <p className="font-sans text-[10px] text-gray-400">{c.startTime} – {c.endTime}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Night */}
                <div>
                  <p className="font-sans font-black text-sm text-gray-700 mb-3">🌙 रात का चौघड़िया</p>
                  <div className="space-y-2">
                    {today.choghadiya.night.map((c,i)=>(
                      <div key={i} className="rounded-xl px-4 py-2.5 flex items-center justify-between"
                        style={{background:c.isBrahmaMuhurta?"rgba(139,92,246,0.08)":`${c.color}08`,border:c.isBrahmaMuhurta?"1px solid rgba(139,92,246,0.3)":`1px solid ${c.color}20`}}>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{background:c.isBrahmaMuhurta?"#7C3AED":c.color}}/>
                          <div>
                            <p className="font-hindi font-black text-sm" style={{color:c.isBrahmaMuhurta?"#7C3AED":c.auspicious?c.color:"rgba(0,0,0,0.4)"}}>
                              {c.nameHi}
                            </p>
                            {c.isBrahmaMuhurta && <p className="font-hindi text-[8px] text-purple-500">जैन साधना का सर्वोत्तम समय</p>}
                          </div>
                        </div>
                        <p className="font-sans text-[10px] text-gray-400">{c.startTime} – {c.endTime}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
