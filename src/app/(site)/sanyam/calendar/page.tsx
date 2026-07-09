"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface CalVrat {
  id:number; name:string; slug:string; emoji:string;
  color:string; jain_month:string; difficulty:string;
  stars_reward:number; description:string;
}

// Month ordering for display (Jain Hindu months)
const MONTH_ORDER = [
  "कार्तिक","मार्गशीर्ष","पौष","माघ","फाल्गुन","चैत्र",
  "बैशाख","ज्येष्ठ","आषाढ़","श्रावण","भाद्रपद","आसौज"
];

function getMonthFromDate(d: string): string {
  for (const m of MONTH_ORDER) {
    if (d.startsWith(m) || d.includes(m)) return m;
  }
  return "अन्य";
}

export default function JainCalendarPage() {
  const [vrats, setVrats] = useState<CalVrat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string|null>(null);

  useEffect(()=>{
    fetch("/api/sanyam/calendar").then(r=>r.json()).then(d=>{
      setVrats(d.vrats||[]);
      setLoading(false);
    });
  },[]);

  // Group by Jain month
  const grouped: Record<string, CalVrat[]> = {};
  vrats.forEach(v=>{
    const m = getMonthFromDate(v.jain_month||"");
    if (!grouped[m]) grouped[m] = [];
    grouped[m].push(v);
  });

  const months = MONTH_ORDER.filter(m=>grouped[m]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-20">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">📅</div>
        <h1 className="font-sans font-black text-2xl text-gray-800 mb-1">Jain Festival Calendar</h1>
        <p className="font-hindi text-sm text-amber-700 mb-1">जैन व्रत एवं पर्व कैलेंडर</p>
        <p className="font-sans text-xs text-gray-400 max-w-lg mx-auto">
          Complete list of Jain Vrats, Parvas, and sacred observances with Hindu calendar dates.
          Start any vrat to add it to your Sanyam Profile.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2,3,4,5,6].map(i=><div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse"/>)}
        </div>
      ) : (
        <div className="space-y-8">
          {months.map(month=>(
            <div key={month}>
              {/* Month header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1" style={{background:"linear-gradient(90deg,rgba(255,152,0,0.5),transparent)"}}/>
                <div className="flex items-center gap-2 rounded-full px-5 py-2 font-sans font-black text-sm"
                  style={{background:"linear-gradient(135deg,#FF9800,#FFD700)",color:"#1a0800"}}>
                  🌙 {month}
                </div>
                <div className="h-px flex-1" style={{background:"linear-gradient(90deg,transparent,rgba(255,152,0,0.5))"}}/>
              </div>

              {/* Vrats in this month */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(grouped[month]||[]).map(v=>(
                  <div key={v.id}
                    className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
                    style={{border:`2px solid ${selected===v.slug?"#FF9800":"transparent"}`}}
                    onClick={()=>setSelected(selected===v.slug?null:v.slug)}>
                    <div className="flex items-start gap-3">
                      <span className="text-3xl shrink-0">{v.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-hindi font-black text-sm text-gray-800 leading-tight">{v.name}</p>
                        <p className="font-hindi text-[10px] text-amber-700 mt-1 leading-snug">{v.jain_month}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="font-sans text-[9px] text-amber-600 font-bold">⭐ {v.stars_reward}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded state */}
                    {selected===v.slug&&(
                      <div className="mt-3 pt-3 border-t border-amber-100">
                        <p className="font-hindi text-xs text-gray-600 mb-3">{v.description}</p>
                        <div className="flex gap-2">
                          <Link href={`/sanyam/vrat/${v.slug}`}
                            className="flex-1 text-center py-2 rounded-xl font-sans font-black text-xs text-white"
                            style={{background:"linear-gradient(135deg,#FF9800,#FFD700)",color:"#1a0800"}}
                            onClick={e=>e.stopPropagation()}>
                            📖 Details & Start
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="mt-10 rounded-2xl p-5" style={{background:"rgba(255,152,0,0.06)",border:"1.5px dashed rgba(255,152,0,0.3)"}}>
        <p className="font-hindi text-sm text-amber-800 font-bold text-center mb-2">📌 जानकारी</p>
        <p className="font-hindi text-xs text-gray-600 text-center leading-relaxed">
          ये तिथियाँ हिंदू पंचांग (Hindu Calendar) के अनुसार हैं।<br/>
          किसी भी व्रत की विस्तृत विधि और नियम जानने के लिए "Details" पर क्लिक करें।<br/>
          व्रत शुरू करें और अपनी साधना को Sanyam Profile में ट्रैक करें।
        </p>
      </div>
    </div>
  );
}
