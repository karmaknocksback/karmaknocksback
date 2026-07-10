"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface CalVrat {
  id:number; name:string; slug:string; emoji:string;
  color:string; jain_month:string; difficulty:string;
  stars_reward:number; description:string;
}

const MONTH_ORDER = [
  "कार्तिक","मार्गशीर्ष","पौष","माघ","फाल्गुन","चैत्र",
  "बैशाख","ज्येष्ठ","आषाढ़","श्रावण","भाद्रपद","आसौज"
];

function getMonth(d: string): string {
  for (const m of MONTH_ORDER) { if (d.includes(m)) return m; }
  return "अन्य";
}

export default function JainCalendarPage() {
  const [vrats, setVrats]     = useState<CalVrat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string|null>(null);

  useEffect(()=>{
    fetch("/api/sanyam/calendar").then(r=>r.json()).then(d=>{
      setVrats(d.vrats||[]); setLoading(false);
    });
  },[]);

  const grouped: Record<string, CalVrat[]> = {};
  vrats.forEach(v=>{
    const m = getMonth(v.jain_month||"");
    if (!grouped[m]) grouped[m]=[];
    grouped[m].push(v);
  });
  const months = MONTH_ORDER.filter(m=>grouped[m]);

  return (
    <div className="min-h-screen" style={{background:"linear-gradient(160deg,#0d0d0d 0%,#1a0800 40%,#0d0d1a 100%)"}}>
      <div className="max-w-5xl mx-auto px-4 py-8 pb-20">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">📅</div>
          <h1 className="font-sans font-black text-2xl text-white mb-1">Jain Festival Calendar</h1>
          <p className="font-hindi text-sm text-amber-400 mb-1">जैन व्रत एवं पर्व कैलेंडर</p>
          <p className="font-sans text-xs text-gray-500 max-w-lg mx-auto">
            Complete list of Jain Vrats & Parvas with Hindu Panchang dates.
            Click any vrat to start it and track in your Sanyam Profile.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2,3,4,5,6].map(i=>
              <div key={i} className="h-24 rounded-2xl animate-pulse" style={{background:"rgba(255,255,255,0.04)"}}/>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {months.map(month=>(
              <div key={month}>
                {/* Month header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1" style={{background:"linear-gradient(90deg,rgba(255,152,0,0.4),transparent)"}}/>
                  <div className="rounded-full px-5 py-2 font-sans font-black text-sm text-amber-900 shrink-0"
                    style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>
                    🌙 {month}
                  </div>
                  <div className="h-px flex-1" style={{background:"linear-gradient(90deg,transparent,rgba(255,152,0,0.4))"}}/>
                </div>

                {/* Vrats in month */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(grouped[month]||[]).map(v=>(
                    <div key={v.id}
                      className="rounded-2xl p-4 cursor-pointer hover:scale-[1.02] transition-all"
                      style={{
                        background:"rgba(255,255,255,0.04)",
                        border:`1.5px solid ${selected===v.slug?"#FF9800":"rgba(255,255,255,0.06)"}`,
                      }}
                      onClick={()=>setSelected(selected===v.slug?null:v.slug)}>
                      <div className="flex items-start gap-3">
                        <span className="text-3xl shrink-0">{v.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-hindi font-black text-sm text-white leading-tight">{v.name}</p>
                          <p className="font-hindi text-[10px] text-amber-400 mt-1">{v.jain_month}</p>
                          <p className="font-sans text-[9px] text-amber-500 font-bold mt-1.5">⭐ {v.stars_reward} stars</p>
                        </div>
                      </div>

                      {selected===v.slug && (
                        <div className="mt-3 pt-3" style={{borderTop:"1px solid rgba(255,255,255,0.07)"}}>
                          <p className="font-hindi text-xs text-gray-400 mb-3 leading-relaxed">{v.description}</p>
                          <Link href={`/sanyam/vrat/${v.slug}`}
                            className="block w-full text-center py-2 rounded-xl font-sans font-black text-xs text-amber-900"
                            style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}
                            onClick={e=>e.stopPropagation()}>
                            📖 Details & Start This Vrat →
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

        {/* Info note */}
        <div className="mt-10 rounded-2xl p-5 text-center"
          style={{background:"rgba(255,152,0,0.04)",border:"1px dashed rgba(255,152,0,0.2)"}}>
          <p className="font-hindi text-xs text-amber-600 mb-1">📌 जानकारी</p>
          <p className="font-hindi text-xs text-gray-600 leading-relaxed">
            ये तिथियाँ हिंदू पंचांग के अनुसार हैं। विस्तृत विधि के लिए आचार्य से संपर्क करें।
          </p>
          <p className="font-sans text-[10px] text-gray-600 mt-1">
            Dates follow Hindu Panchang. Consult your local Jain Acharya for detailed procedures.
          </p>
        </div>

      </div>
    </div>
  );
}
