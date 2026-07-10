"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Panchang {
  date: string; gregorian: string;
  vaar: { en:string; hi:string };
  tithi: { number:number; name_en:string; name_hi:string; paksha:string; paksha_hi:string };
  nakshatra: { name_en:string; name_hi:string };
  yoga: { name:string };
  hindu_month: { name_en:string; name_hi:string };
  jain_significance: string|null;
  is_purnima:boolean; is_amavasya:boolean; is_ekadashi:boolean; is_chaturdashi:boolean;
}

interface CalVrat { id:number; name:string; slug:string; emoji:string; color:string; jain_month:string; stars_reward:number; }

const MONTH_ORDER = ["चैत्र","वैशाख","ज्येष्ठ","आषाढ़","श्रावण","भाद्रपद","आसौज","कार्तिक","मार्गशीर्ष","पौष","माघ","फाल्गुन"];
function getMonth(d:string){ for(const m of MONTH_ORDER){ if(d.includes(m)) return m; } return "अन्य"; }

export default function JainCalendarPage() {
  const [today, setToday]       = useState<Panchang|null>(null);
  const [upcoming, setUpcoming] = useState<Panchang[]>([]);
  const [vrats, setVrats]       = useState<CalVrat[]>([]);
  const [selected, setSelected] = useState<string|null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(()=>{
    Promise.all([
      fetch("/api/panchang?type=today").then(r=>r.json()).then(d=>setToday(d.panchang)),
      fetch("/api/panchang?type=upcoming&days=45").then(r=>r.json()).then(d=>setUpcoming(d.highlights||[])),
      fetch("/api/sanyam/calendar").then(r=>r.json()).then(d=>setVrats(d.vrats||[])),
    ]).finally(()=>setLoading(false));
  },[]);

  const grouped: Record<string, CalVrat[]> = {};
  vrats.forEach(v=>{ const m=getMonth(v.jain_month||""); if(!grouped[m]) grouped[m]=[]; grouped[m].push(v); });
  const months = MONTH_ORDER.filter(m=>grouped[m]);

  const tithiColor = (p:Panchang) => p.is_purnima?"#FFD700":p.is_amavasya?"#9C27B0":p.is_ekadashi?"#4CAF50":p.is_chaturdashi?"#E91E63":"#FF9800";

  return (
    <div className="min-h-screen" style={{background:"linear-gradient(160deg,#0d0d0d 0%,#1a0800 40%,#0d0d1a 100%)"}}>
      <div className="max-w-5xl mx-auto px-4 py-8 pb-20">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📅</div>
          <h1 className="font-sans font-black text-2xl text-white mb-1">Jain Festival Calendar</h1>
          <p className="font-hindi text-sm text-amber-400 mb-1">जैन व्रत एवं पर्व कैलेंडर</p>
          <p className="font-sans text-xs text-gray-500">Live Hindu Panchang · Jain festival dates · Start your vrat</p>
        </div>

        {/* TODAY'S PANCHANG CARD */}
        {loading ? (
          <div className="rounded-3xl h-44 animate-pulse mb-8" style={{background:"rgba(255,215,0,0.06)"}}/>
        ) : today && (
          <div className="rounded-3xl p-6 mb-8 relative overflow-hidden"
            style={{background:"linear-gradient(135deg,rgba(255,215,0,0.1),rgba(255,152,0,0.06))",border:"1.5px solid rgba(255,215,0,0.2)"}}>
            {/* Gold decoration */}
            <div className="absolute top-0 right-0 text-8xl opacity-[0.04] font-sans select-none">🕉️</div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-2xl animate-pulse">🕉️</div>
                <p className="font-hindi font-black text-amber-400 text-sm">आज का पंचांग</p>
                <p className="font-sans text-[10px] text-gray-500 ml-auto">{today.gregorian}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {/* Tithi */}
                <div className="rounded-2xl p-3 text-center"
                  style={{background:`${tithiColor(today)}15`,border:`1.5px solid ${tithiColor(today)}30`}}>
                  <p className="font-sans text-[9px] text-gray-500 uppercase tracking-wider mb-1">Tithi</p>
                  <p className="font-hindi font-black text-sm leading-tight" style={{color:tithiColor(today)}}>{today.tithi.name_hi}</p>
                  <p className="font-sans text-[9px] text-gray-500">{today.tithi.paksha_hi}</p>
                </div>
                {/* Vaar */}
                <div className="rounded-2xl p-3 text-center" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}>
                  <p className="font-sans text-[9px] text-gray-500 uppercase tracking-wider mb-1">Vaar</p>
                  <p className="font-hindi font-black text-sm text-white">{today.vaar.hi}</p>
                  <p className="font-sans text-[9px] text-gray-500">{today.vaar.en}</p>
                </div>
                {/* Nakshatra */}
                <div className="rounded-2xl p-3 text-center" style={{background:"rgba(156,39,176,0.1)",border:"1px solid rgba(156,39,176,0.2)"}}>
                  <p className="font-sans text-[9px] text-gray-500 uppercase tracking-wider mb-1">Nakshatra</p>
                  <p className="font-hindi font-black text-sm text-purple-300">{today.nakshatra.name_hi}</p>
                  <p className="font-sans text-[9px] text-gray-500">{today.nakshatra.name_en}</p>
                </div>
                {/* Yoga */}
                <div className="rounded-2xl p-3 text-center" style={{background:"rgba(33,150,243,0.08)",border:"1px solid rgba(33,150,243,0.15)"}}>
                  <p className="font-sans text-[9px] text-gray-500 uppercase tracking-wider mb-1">Yoga</p>
                  <p className="font-sans font-black text-sm text-blue-300">{today.yoga.name}</p>
                </div>
                {/* Month */}
                <div className="rounded-2xl p-3 text-center" style={{background:"rgba(255,152,0,0.08)",border:"1px solid rgba(255,152,0,0.15)"}}>
                  <p className="font-sans text-[9px] text-gray-500 uppercase tracking-wider mb-1">Month</p>
                  <p className="font-hindi font-black text-sm text-amber-300">{today.hindu_month.name_hi}</p>
                  <p className="font-sans text-[9px] text-gray-500">{today.hindu_month.name_en}</p>
                </div>
              </div>

              {/* Jain significance */}
              {today.jain_significance && (
                <div className="mt-3 rounded-xl px-4 py-2.5 text-center"
                  style={{background:"rgba(255,215,0,0.08)",border:"1px solid rgba(255,215,0,0.2)"}}>
                  <p className="font-hindi text-sm text-amber-300 font-bold">{today.jain_significance}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* UPCOMING JAIN IMPORTANT DAYS */}
        {!loading && upcoming.length > 0 && (
          <div className="mb-8">
            <h2 className="font-sans font-black text-sm text-white/60 uppercase tracking-widest mb-4">
              ⭐ Upcoming Jain Important Days
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {upcoming.slice(0,10).map(p=>{
                const c = tithiColor(p);
                const daysAway = Math.round((new Date(p.date).getTime() - Date.now()) / 86400000);
                return (
                  <div key={p.date} className="flex items-center gap-3 rounded-2xl p-3"
                    style={{background:`${c}08`,border:`1px solid ${c}20`}}>
                    <div className="shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center"
                      style={{background:`${c}20`}}>
                      <p className="font-sans font-black text-[10px]" style={{color:c}}>{new Date(p.date).getDate()}</p>
                      <p className="font-sans text-[8px] text-gray-500">{new Date(p.date).toLocaleString("en",{month:"short"})}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-hindi font-black text-xs text-white truncate">{p.tithi.name_hi}</p>
                      <p className="font-sans text-[9px]" style={{color:c}}>{p.jain_significance}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-sans text-[9px] text-gray-500">{daysAway===0?"Today":daysAway===1?"Tomorrow":`${daysAway} days`}</p>
                      <p className="font-hindi text-[9px] text-gray-600">{p.vaar.hi}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VRAT DATABASE BY HINDU MONTH */}
        <div>
          <h2 className="font-sans font-black text-sm text-white/60 uppercase tracking-widest mb-6">
            📚 Jain Vrats by Hindu Month
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i=><div key={i} className="h-32 rounded-2xl animate-pulse" style={{background:"rgba(255,255,255,0.04)"}}/>)}
            </div>
          ) : months.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{border:"2px dashed rgba(255,255,255,0.07)"}}>
              <p className="font-sans text-white/30">No vrats seeded yet.</p>
              <p className="font-sans text-[11px] text-gray-600 mt-1">Run: POST /api/sanyam/seed</p>
            </div>
          ) : (
            <div className="space-y-8">
              {months.map(month=>(
                <div key={month}>
                  {/* Month header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1" style={{background:"linear-gradient(90deg,rgba(255,152,0,0.3),transparent)"}}/>
                    <div className="rounded-full px-5 py-2 font-sans font-black text-sm shrink-0 text-amber-900"
                      style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>
                      🌙 {month}
                    </div>
                    <div className="h-px flex-1" style={{background:"linear-gradient(90deg,transparent,rgba(255,152,0,0.3))"}}/>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(grouped[month]||[]).map(v=>(
                      <div key={v.id}
                        className="rounded-2xl p-4 cursor-pointer hover:scale-[1.02] transition-all"
                        style={{
                          background: selected===v.slug ? `${v.color||"#FF9800"}12` : "rgba(255,255,255,0.04)",
                          border: `1.5px solid ${selected===v.slug ? v.color||"#FF9800" : "rgba(255,255,255,0.06)"}`,
                        }}
                        onClick={()=>setSelected(selected===v.slug?null:v.slug)}>
                        <div className="flex items-start gap-3">
                          <span className="text-3xl shrink-0">{v.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-hindi font-black text-sm text-white leading-tight">{v.name}</p>
                            <p className="font-hindi text-[10px] text-amber-400/70 mt-1 leading-snug">{v.jain_month}</p>
                            <p className="font-sans text-[9px] text-amber-500 font-bold mt-1">⭐ {v.stars_reward}</p>
                          </div>
                        </div>

                        {selected===v.slug && (
                          <div className="mt-3 pt-3" style={{borderTop:"1px solid rgba(255,255,255,0.07)"}}>
                            <Link href={`/sanyam/vrat/${v.slug}`}
                              className="block w-full text-center py-2.5 rounded-xl font-sans font-black text-xs text-amber-900"
                              style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}
                              onClick={e=>e.stopPropagation()}>
                              📖 View Details & Start This Vrat →
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info note */}
        <div className="mt-10 rounded-2xl p-5 text-center"
          style={{background:"rgba(255,215,0,0.03)",border:"1px dashed rgba(255,215,0,0.15)"}}>
          <p className="font-hindi text-xs text-amber-600 mb-1">📌 पंचांग जानकारी</p>
          <p className="font-hindi text-xs text-gray-600 mb-1">
            तिथि और नक्षत्र की गणना खगोलीय सूत्रों से की जाती है। विस्तृत विधि के लिए अपने आचार्य से संपर्क करें।
          </p>
          <p className="font-sans text-[10px] text-gray-600">
            Panchang calculated using astronomical algorithms (Jean Meeus method). For official religious guidance, consult your local Jain Acharya.
          </p>
        </div>

      </div>
    </div>
  );
}
