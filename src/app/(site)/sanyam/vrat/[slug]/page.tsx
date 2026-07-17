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
}

const DIFF:{[k:string]:{l:string;lh:string;c:string;bg:string}} = {
  easy:    {l:"Easy",   lh:"सरल",      c:"#16A34A",bg:"#F0FDF4"},
  medium:  {l:"Medium", lh:"मध्यम",    c:"#D97706",bg:"#FFFBEB"},
  hard:    {l:"Hard",   lh:"कठोर",     c:"#DC2626",bg:"#FEF2F2"},
  extreme: {l:"Extreme",lh:"अतिकठोर", c:"#7C3AED",bg:"#F5F3FF"},
};

export default function VratDetailPage() {
  const params   = useParams<{slug:string}>();
  const [vrat,   setVrat]    = useState<Vrat|null>(null);
  const [loading,setLoading] = useState(true);
  const [enrolled,setEnrolled] = useState(false);
  const [enrolling,setEnrolling] = useState(false);
  const [tab,    setTab]     = useState<"katha"|"vidhi"|"phala">("katha");

  useEffect(()=>{
    if (!params?.slug) return;
    fetch(`/api/sanyam/vrats?slug=${params.slug}`)
      .then(r=>r.json())
      .then(d=>{ setVrat(d.vrat||null); setLoading(false); });
  },[params?.slug]);

  async function enroll() {
    if (!vrat) return;
    setEnrolling(true);
    const r = await fetch("/api/sanyam/enroll",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ vrat_id:vrat.id, vrat_name:vrat.name_hi||vrat.name,
        vrat_emoji:vrat.emoji, vrat_color:vrat.color, total_days:vrat.duration_days })
    });
    if ((await r.json()).success) setEnrolled(true);
    setEnrolling(false);
  }

  /* ── LOADING ── */
  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl animate-bounce mb-4">🙏</div>
        <p className="font-hindi text-amber-600 text-lg font-bold animate-pulse">लोड हो रहा है...</p>
      </div>
    </div>
  );

  /* ── NOT FOUND ── */
  if (!vrat) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">😔</div>
        <p className="font-hindi text-gray-600 text-lg mb-4">व्रत नहीं मिला</p>
        <Link href="/sanyam/vrat-db" className="rounded-2xl px-6 py-3 font-sans font-black text-sm text-white" style={{background:"#F59E0B"}}>← वापस जाएं</Link>
      </div>
    </div>
  );

  const d  = DIFF[vrat.difficulty] || DIFF.easy;
  const paras = (vrat.katha_hi||"").split("\n\n").filter(s=>s.trim());
  const steps = (vrat.procedure_hi||"").split("।").filter(s=>s.trim());
  const rules = (vrat.rules||"").split("।").filter(s=>s.trim());
  const bens  = (vrat.benefits||"").split("।").filter(s=>s.trim());

  return (
    <div className="min-h-screen" style={{background:"#F8FAFC"}}>

      {/* ══ HERO BANNER ══ */}
      <div style={{background:`linear-gradient(160deg,${vrat.color}18 0%,${vrat.color}08 60%,#F0F9FF 100%)`}}>
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-8">
          <Link href="/sanyam/vrat-db"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-800 mb-4">
            ← व्रत सूची
          </Link>

          {/* Emoji + title */}
          <div className="flex items-center gap-5 mb-5">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-5xl flex-shrink-0 shadow-xl"
              style={{background:"white",border:`4px solid ${vrat.color}30`,boxShadow:`0 8px 32px ${vrat.color}20`}}>
              {vrat.emoji}
            </div>
            <div>
              <h1 className="font-hindi font-black text-2xl text-gray-900 leading-tight">{vrat.name_hi}</h1>
              <p className="font-sans text-sm text-gray-400 mt-0.5">{vrat.name}</p>
            </div>
          </div>

          {/* Pills row */}
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="rounded-full px-3 py-1 font-hindi text-xs font-black" style={{background:d.bg,color:d.c,border:`1.5px solid ${d.c}30`}}>
              {d.lh}
            </span>
            <span className="rounded-full px-3 py-1 font-sans text-xs font-bold bg-amber-50 text-amber-700" style={{border:"1.5px solid #FDE68A"}}>
              ⭐ {vrat.stars_reward} pts
            </span>
            <span className="rounded-full px-3 py-1 font-sans text-xs font-bold bg-white text-gray-600 shadow-sm" style={{border:"1px solid #E5E7EB"}}>
              🗓 {vrat.duration_days === 1 ? "1 दिन" : `${vrat.duration_days} दिन`}
            </span>
            {vrat.jain_month && (
              <span className="rounded-full px-3 py-1 font-hindi text-xs font-bold bg-white text-gray-600 shadow-sm" style={{border:"1px solid #E5E7EB"}}>
                📅 {vrat.jain_date}
              </span>
            )}
          </div>

          {/* Description card */}
          <div className="rounded-2xl p-4 bg-white shadow-sm" style={{border:`1.5px solid ${vrat.color}20`}}>
            <p className="font-hindi text-sm text-gray-700 leading-relaxed">{vrat.description_hi || vrat.description}</p>
          </div>

          {/* Enroll CTA */}
          <div className="mt-5">
            {enrolled ? (
              <div className="rounded-2xl p-4 bg-green-50 flex items-center gap-3" style={{border:"1.5px solid #86EFAC"}}>
                <span className="text-3xl">✅</span>
                <div>
                  <p className="font-sans font-black text-green-700">जय जिनेन्द्र! व्रत शुरू हो गया!</p>
                  <Link href="/sanyam/profile" className="font-sans text-xs text-green-600 font-bold hover:underline">
                    Profile पर देखें →
                  </Link>
                </div>
              </div>
            ) : (
              <button onClick={enroll} disabled={enrolling}
                className="w-full py-4 rounded-2xl font-sans font-black text-base text-white shadow-xl transition-all active:scale-95 disabled:opacity-60"
                style={{background:`linear-gradient(135deg,${vrat.color},${vrat.color}bb)`,boxShadow:`0 8px 32px ${vrat.color}40`}}>
                {enrolling ? "⏳ शुरू हो रहा है..." : `🙏 ${vrat.name_hi} शुरू करें`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══ TABS ══ */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex bg-white rounded-2xl p-1 shadow-sm mb-5" style={{border:"1px solid #E2E8F0"}}>
          {[
            {id:"katha", label:"📖 कथा",  sub:"Vrat Story"},
            {id:"vidhi", label:"📋 विधि",  sub:"Procedure"},
            {id:"phala", label:"🌟 फल",    sub:"Benefits"},
          ].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as typeof tab)}
              className="flex-1 rounded-xl py-2.5 transition-all"
              style={{
                background:tab===t.id?vrat.color:"transparent",
                color:tab===t.id?"white":"#6B7280",
              }}>
              <p className="font-sans font-black text-xs">{t.label}</p>
              <p className="font-sans text-[9px] opacity-70">{t.sub}</p>
            </button>
          ))}
        </div>

        {/* ══ KATHA TAB ══ */}
        {tab==="katha" && (
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden" style={{border:"1px solid #E2E8F0"}}>
            {/* Header */}
            <div className="px-5 py-4" style={{background:`linear-gradient(135deg,${vrat.color}12,${vrat.color}04)`}}>
              <p className="font-sans font-black text-base text-gray-900">{vrat.emoji} व्रत कथा</p>
              <p className="font-hindi text-[10px] text-gray-400">पूजा से पहले यह कथा अवश्य सुनें / पढ़ें</p>
            </div>

            {/* Katha content */}
            <div className="px-5 py-6">
              {paras.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">📚</div>
                  <p className="font-hindi text-gray-400">इस व्रत की कथा जल्द उपलब्ध होगी</p>
                  <p className="font-sans text-xs text-gray-400 mt-1">Katha coming soon</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {paras.map((para, i) => {
                    const isBold = para.startsWith("**") || /^[१-९\d]+\.\s/.test(para) || para.length < 60;
                    const clean = para.replace(/\*\*/g, "");
                    if (isBold && clean.length < 60) {
                      return (
                        <div key={i} className="rounded-2xl px-4 py-3" style={{background:`${vrat.color}08`,borderLeft:`4px solid ${vrat.color}`}}>
                          <p className="font-hindi font-black text-sm" style={{color:vrat.color}}>{clean}</p>
                        </div>
                      );
                    }
                    return (
                      <p key={i} className="font-hindi text-sm text-gray-700 leading-relaxed"
                        style={{textAlign:"justify"}}>
                        {clean}
                      </p>
                    );
                  })}
                </div>
              )}

              {/* Source */}
              {vrat.source && (
                <div className="mt-6 pt-4" style={{borderTop:"1px solid #F1F5F9"}}>
                  <p className="font-sans text-[10px] text-gray-400">📚 स्रोत: {vrat.source}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ VIDHI TAB ══ */}
        {tab==="vidhi" && (
          <div className="space-y-4">
            {steps.length > 0 && (
              <div className="bg-white rounded-3xl p-5 shadow-sm" style={{border:"1px solid #E2E8F0"}}>
                <p className="font-sans font-black text-base text-gray-900 mb-4">📋 व्रत विधि (Step by Step)</p>
                <div className="space-y-3">
                  {steps.map((step,i)=>(
                    step.trim() && (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center font-sans font-black text-xs text-white shrink-0"
                          style={{background:vrat.color}}>
                          {i+1}
                        </div>
                        <p className="font-hindi text-sm text-gray-700 leading-relaxed pt-0.5">{step.trim()}।</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {rules.length > 0 && (
              <div className="bg-white rounded-3xl p-5 shadow-sm" style={{border:"1px solid #E2E8F0"}}>
                <p className="font-sans font-black text-base text-gray-900 mb-4">⚠️ महत्त्वपूर्ण नियम</p>
                <div className="space-y-2">
                  {rules.map((rule,i)=>(
                    rule.trim() && (
                      <div key={i} className="flex gap-2 items-start rounded-xl p-3" style={{background:"#FFFBEB",border:"1px solid #FDE68A"}}>
                        <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                        <p className="font-hindi text-sm text-gray-700">{rule.trim()}।</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {(!steps.length && !rules.length) && (
              <div className="bg-white rounded-3xl p-8 text-center shadow-sm" style={{border:"1px solid #E2E8F0"}}>
                <p className="font-hindi text-gray-400">विधि की जानकारी जल्द उपलब्ध होगी</p>
                <p className="font-sans text-xs text-gray-400 mt-1">Consult your local Jain Acharya for detailed procedure</p>
              </div>
            )}
          </div>
        )}

        {/* ══ PHALA TAB ══ */}
        {tab==="phala" && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 shadow-sm" style={{border:"1px solid #E2E8F0"}}>
              <p className="font-sans font-black text-base text-gray-900 mb-4">🌟 व्रत के फल (Spiritual Benefits)</p>
              {bens.length > 0 ? (
                <div className="space-y-3">
                  {bens.map((b,i)=>(
                    b.trim() && (
                      <div key={i} className="flex gap-3 items-start rounded-2xl p-3.5"
                        style={{background:`${vrat.color}08`,border:`1px solid ${vrat.color}15`}}>
                        <span className="text-xl shrink-0">✨</span>
                        <p className="font-hindi text-sm text-gray-700 leading-relaxed">{b.trim()}।</p>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <p className="font-hindi text-sm text-gray-400 text-center py-4">आत्म-शुद्धि और कर्म-निर्जरा</p>
              )}
            </div>

            {/* Stars */}
            <div className="bg-white rounded-3xl p-5 shadow-sm text-center" style={{border:"1.5px solid #FDE68A"}}>
              <p className="font-sans text-5xl font-black text-amber-600">⭐ {vrat.stars_reward}</p>
              <p className="font-hindi text-sm text-amber-700 mt-2 font-bold">व्रत पूर्ण करने पर धर्म अंक</p>
              <p className="font-sans text-[10px] text-gray-400 mt-1">Dharma Points on completion</p>
            </div>
          </div>
        )}

        <div className="py-8">
          <Link href="/sanyam/vrat-db"
            className="block w-full py-3 rounded-2xl font-sans font-black text-sm text-center text-gray-600 bg-white shadow-sm"
            style={{border:"1px solid #E2E8F0"}}>
            ← All Vrats
          </Link>
        </div>
      </div>
    </div>
  );
}
