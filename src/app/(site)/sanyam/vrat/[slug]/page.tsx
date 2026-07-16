"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Vrat {
  id:number; name:string; name_hi:string; slug:string; category:string;
  emoji:string; color:string; difficulty:string; duration_days:number;
  jain_month:string; jain_date:string; stars_reward:number;
  description:string; description_hi:string; procedure_hi:string;
  rules:string; benefits:string; katha_hi:string; source:string;
  is_active:number;
}

const DIFF_LABEL:{[k:string]:{l:string;c:string;bg:string}} = {
  easy:    {l:"सरल",      c:"#16A34A",bg:"#F0FDF4"},
  medium:  {l:"मध्यम",    c:"#D97706",bg:"#FFFBEB"},
  hard:    {l:"कठोर",     c:"#DC2626",bg:"#FEF2F2"},
  extreme: {l:"अतिकठोर", c:"#7C3AED",bg:"#F5F3FF"},
};

export default function VratDetailPage() {
  const params = useParams<{slug:string}>();
  const [vrat, setVrat] = useState<Vrat|null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [tab, setTab] = useState<"story"|"vidhi"|"benefits">("story");

  useEffect(()=>{
    if (!params?.slug) return;
    fetch(`/api/sanyam/vrats?slug=${params.slug}`)
      .then(r=>r.json())
      .then(d=>{ setVrat(d.vrat); setLoading(false); });
  },[params?.slug]);

  async function enroll() {
    if (!vrat) return;
    setEnrolling(true);
    const r = await fetch("/api/sanyam/enroll",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        vrat_id:vrat.id, vrat_name:vrat.name_hi||vrat.name,
        vrat_emoji:vrat.emoji, vrat_color:vrat.color,
        total_days:vrat.duration_days,
      })
    });
    const d = await r.json();
    if (d.success) setEnrolled(true);
    setEnrolling(false);
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center"><div className="text-5xl animate-bounce mb-3">🙏</div>
        <p className="font-hindi text-amber-600">लोड हो रहा है...</p>
      </div>
    </div>
  );

  if (!vrat) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="text-4xl mb-3">😔</div>
        <p className="font-hindi text-gray-500">व्रत नहीं मिला</p>
        <Link href="/sanyam/vrat-db" className="mt-4 inline-block text-amber-600 font-bold">← वापस जाएं</Link>
      </div>
    </div>
  );

  const diff = DIFF_LABEL[vrat.difficulty] || DIFF_LABEL.easy;

  // Parse katha into paragraphs
  const kathaParas = (vrat.katha_hi||"").split("\n\n").filter(Boolean);

  return (
    <div className="min-h-screen" style={{background:"#F8FAFC"}}>

      {/* ── HERO ── */}
      <div className="relative overflow-hidden" style={{background:`linear-gradient(160deg,${vrat.color}20,${vrat.color}08,#F0F9FF)`}}>
        {/* Pattern */}
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:`radial-gradient(circle,${vrat.color} 1px,transparent 1px)`,backgroundSize:"24px 24px"}}/>

        <div className="max-w-3xl mx-auto px-4 pt-8 pb-8 relative z-10">
          {/* Back */}
          <Link href="/sanyam/vrat-db" className="inline-flex items-center gap-1.5 text-gray-500 font-sans text-sm mb-5 hover:text-gray-700">
            ← व्रत सूची
          </Link>

          <div className="flex items-start gap-4">
            {/* Big emoji */}
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-5xl shadow-lg shrink-0"
              style={{background:"white",border:`3px solid ${vrat.color}30`}}>
              {vrat.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="font-hindi font-black text-2xl text-gray-900 leading-tight mb-1">{vrat.name_hi}</h1>
              <p className="font-sans text-sm text-gray-500 mb-3">{vrat.name}</p>

              <div className="flex flex-wrap gap-2">
                {/* Tithi */}
                <span className="rounded-full px-3 py-1 font-hindi text-xs font-bold bg-white shadow-sm" style={{color:vrat.color,border:`1px solid ${vrat.color}20`}}>
                  📅 {vrat.jain_month} {vrat.jain_date}
                </span>
                {/* Difficulty */}
                <span className="rounded-full px-3 py-1 font-hindi text-xs font-bold" style={{background:diff.bg,color:diff.c,border:`1px solid ${diff.c}20`}}>
                  {diff.l}
                </span>
                {/* Duration */}
                <span className="rounded-full px-3 py-1 font-sans text-xs font-bold bg-white shadow-sm text-gray-500" style={{border:"1px solid #E5E7EB"}}>
                  {vrat.duration_days === 1 ? "1 दिन" : `${vrat.duration_days} दिन`}
                </span>
                {/* Stars */}
                <span className="rounded-full px-3 py-1 font-sans text-xs font-bold bg-amber-50 text-amber-700" style={{border:"1px solid #FDE68A"}}>
                  ⭐ {vrat.stars_reward} pts
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-5 bg-white rounded-2xl p-4 shadow-sm" style={{border:"1px solid #E5E7EB"}}>
            <p className="font-hindi text-sm text-gray-700 leading-relaxed">{vrat.description_hi}</p>
          </div>

          {/* Enroll button */}
          <div className="mt-4">
            {enrolled ? (
              <div className="flex items-center gap-3 rounded-2xl px-5 py-3 bg-green-50" style={{border:"1.5px solid #86EFAC"}}>
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-sans font-black text-sm text-green-700">व्रत शुरू! जय जिनेन्द्र!</p>
                  <p className="font-hindi text-xs text-green-600">आपका व्रत सफलतापूर्वक शुरू हो गया।</p>
                </div>
              </div>
            ) : (
              <button onClick={enroll} disabled={enrolling}
                className="w-full py-4 rounded-2xl font-sans font-black text-base text-white shadow-lg transition-all active:scale-95 disabled:opacity-60"
                style={{background:`linear-gradient(135deg,${vrat.color},${vrat.color}cc)`,boxShadow:`0 8px 24px ${vrat.color}40`}}>
                {enrolling ? "शुरू हो रहा है..." : `🙏 ${vrat.name_hi} शुरू करें`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm mb-4" style={{border:"1px solid #E5E7EB"}}>
          {[
            {id:"story",    l:"📖 कथा",        hi:"Katha / Story"},
            {id:"vidhi",    l:"📋 विधि",       hi:"Vidhi / Procedure"},
            {id:"benefits", l:"🌟 फल",         hi:"Benefits"},
          ].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as typeof tab)}
              className="flex-1 py-2.5 rounded-xl font-sans font-black text-xs transition-all"
              style={{
                background:tab===t.id?vrat.color:"transparent",
                color:tab===t.id?"white":"#6B7280",
              }}>
              {t.l}
            </button>
          ))}
        </div>

        {/* KATHA */}
        {tab==="story" && (
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm" style={{border:"1px solid #E5E7EB"}}>
            {/* Katha header */}
            <div className="px-5 py-4" style={{background:`linear-gradient(135deg,${vrat.color}10,${vrat.color}05)`,borderBottom:"1px solid #F1F5F9"}}>
              <p className="font-sans font-black text-base text-gray-900">{vrat.emoji} व्रत कथा</p>
              <p className="font-hindi text-xs text-gray-500">Vrat Katha / Story</p>
            </div>

            <div className="px-5 py-5">
              {kathaParas.length === 0 ? (
                <p className="font-hindi text-sm text-gray-400 text-center py-8">कथा जल्द उपलब्ध होगी...</p>
              ) : (
                <div className="space-y-4">
                  {kathaParas.map((para, i) => {
                    // Check if it's a bold heading (starts with ** or is a number list)
                    const isBold = para.startsWith("**") || /^\d+\./.test(para.trim());
                    const cleaned = para.replace(/\*\*/g, "");
                    
                    return (
                      <div key={i}>
                        {isBold ? (
                          <p className="font-hindi font-black text-sm text-gray-900 leading-relaxed"
                            style={{color:vrat.color}}>
                            {cleaned}
                          </p>
                        ) : (
                          <p className="font-hindi text-sm text-gray-700 leading-relaxed">
                            {cleaned}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Source */}
              {vrat.source && (
                <div className="mt-5 pt-4" style={{borderTop:"1px solid #F1F5F9"}}>
                  <p className="font-sans text-[10px] text-gray-400">📚 स्रोत: {vrat.source}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIDHI */}
        {tab==="vidhi" && (
          <div className="space-y-4">
            {vrat.procedure_hi && (
              <div className="bg-white rounded-3xl p-5 shadow-sm" style={{border:"1px solid #E5E7EB"}}>
                <p className="font-sans font-black text-base text-gray-900 mb-4">📋 व्रत विधि</p>
                <div className="space-y-3">
                  {vrat.procedure_hi.split("।").filter(Boolean).map((step,i)=>(
                    step.trim() && (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center font-sans font-black text-[10px] shrink-0 text-white" style={{background:vrat.color}}>
                          {i+1}
                        </div>
                        <p className="font-hindi text-sm text-gray-700 leading-relaxed flex-1">{step.trim()}।</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {vrat.rules && (
              <div className="bg-white rounded-3xl p-5 shadow-sm" style={{border:"1px solid #E5E7EB"}}>
                <p className="font-sans font-black text-base text-gray-900 mb-4">⚠️ नियम</p>
                <div className="space-y-2">
                  {vrat.rules.split("।").filter(Boolean).map((rule,i)=>(
                    rule.trim() && (
                      <div key={i} className="flex gap-2 items-start">
                        <span className="text-amber-500 shrink-0">•</span>
                        <p className="font-hindi text-sm text-gray-700 leading-relaxed">{rule.trim()}।</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* BENEFITS */}
        {tab==="benefits" && (
          <div className="bg-white rounded-3xl p-5 shadow-sm" style={{border:"1px solid #E5E7EB"}}>
            <p className="font-sans font-black text-base text-gray-900 mb-4">🌟 व्रत के फल (Benefits)</p>
            {vrat.benefits ? (
              <div className="space-y-3">
                {vrat.benefits.split("।").filter(Boolean).map((b,i)=>(
                  b.trim() && (
                    <div key={i} className="flex gap-3 items-start rounded-2xl p-3" style={{background:`${vrat.color}08`,border:`1px solid ${vrat.color}15`}}>
                      <span className="text-lg shrink-0">✨</span>
                      <p className="font-hindi text-sm text-gray-700 leading-relaxed">{b.trim()}।</p>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <p className="font-hindi text-sm text-gray-400 text-center py-4">जल्द उपलब्ध...</p>
            )}

            {/* Stars reward */}
            <div className="mt-5 rounded-2xl p-4 text-center" style={{background:"#FFFBEB",border:"1px solid #FDE68A"}}>
              <p className="font-sans font-black text-2xl text-amber-700">⭐ {vrat.stars_reward}</p>
              <p className="font-hindi text-xs text-amber-600 mt-1">इस व्रत को पूरा करने पर मिलेंगे {vrat.stars_reward} Dharma Points</p>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-4 pb-8">
          {!enrolled && (
            <button onClick={enroll} disabled={enrolling}
              className="w-full py-4 rounded-2xl font-sans font-black text-base text-white shadow-lg"
              style={{background:`linear-gradient(135deg,${vrat.color},${vrat.color}cc)`}}>
              {enrolling ? "..." : `🙏 ${vrat.name_hi} शुरू करें → My Profile`}
            </button>
          )}
          {enrolled && (
            <Link href="/sanyam/profile"
              className="block w-full py-4 rounded-2xl font-sans font-black text-base text-white text-center shadow-lg"
              style={{background:"linear-gradient(135deg,#16A34A,#15803D)"}}>
              ✅ Profile पर देखें →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
