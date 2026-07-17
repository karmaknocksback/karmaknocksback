"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { VRAT_BY_SLUG } from "@/lib/sanyam/static-vrats";

/* INSTANT — static data, only enrollment write hits DB */

const DIFF:{[k:string]:{l:string;hi:string;c:string;bg:string}} = {
  easy:    {l:"Easy",    hi:"सरल",      c:"#16A34A", bg:"#F0FDF4"},
  medium:  {l:"Medium",  hi:"मध्यम",    c:"#D97706", bg:"#FFFBEB"},
  hard:    {l:"Hard",    hi:"कठोर",     c:"#DC2626", bg:"#FEF2F2"},
  extreme: {l:"Extreme", hi:"अतिकठोर", c:"#7C3AED", bg:"#F5F3FF"},
};

export default function VratDetailPage() {
  const params   = useParams<{slug:string}>();
  const vrat     = params?.slug ? VRAT_BY_SLUG[params.slug] : null;
  const [tab,    setTab]     = useState<"katha"|"vidhi"|"phala">("katha");
  const [enrolled,setEnrolled] = useState(false);
  const [enrolling,setEnrolling] = useState(false);

  // Check if already enrolled
  useEffect(()=>{
    if (typeof window !== "undefined") {
      const key = `enrolled_${params?.slug}`;
      if (sessionStorage.getItem(key)) setEnrolled(true);
    }
  },[params?.slug]);

  async function enroll() {
    if (!vrat) return;
    setEnrolling(true);
    try {
      const r = await fetch("/api/sanyam/enroll",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ vrat_id:vrat.id, vrat_name:vrat.name_hi||vrat.name,
          vrat_emoji:vrat.emoji, vrat_color:vrat.color, total_days:vrat.duration_days }),
      });
      const d = await r.json();
      if (d.success || d.error === "Already enrolled") {
        setEnrolled(true);
        sessionStorage.setItem(`enrolled_${vrat.slug}`, "1");
      }
    } catch {}
    setEnrolling(false);
  }

  if (!vrat) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"#F8FAFC"}}>
      <div className="text-center">
        <div className="text-5xl mb-3">🙏</div>
        <p className="font-hindi text-lg text-gray-600 mb-2">व्रत नहीं मिला</p>
        <p className="font-sans text-sm text-gray-400 mb-5">Vrat not found for slug: {params?.slug}</p>
        <Link href="/sanyam/vrat-db"
          className="inline-block px-6 py-3 rounded-2xl font-sans font-black text-sm text-white"
          style={{background:"#F59E0B"}}>
          ← Back to Vrat List
        </Link>
      </div>
    </div>
  );

  const diff = DIFF[vrat.difficulty] || DIFF.easy;
  const kathaParas = (vrat.katha_hi || "").split("\n\n").filter(p=>p.trim());
  const vidhiSteps = (vrat.procedure_hi || "").split("।").filter(s=>s.trim());
  const benefitsList = (vrat.benefits || "").split("।").filter(b=>b.trim());

  return (
    <div className="min-h-screen pb-24" style={{background:"#F8FAFC"}}>

      {/* ── HERO ── */}
      <div className="relative overflow-hidden"
        style={{background:`linear-gradient(160deg,${vrat.color}15 0%,${vrat.color}05 100%)`}}>
        {/* Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{backgroundImage:`radial-gradient(circle,${vrat.color} 1px,transparent 1px)`,backgroundSize:"20px 20px"}}/>

        <div className="max-w-3xl mx-auto px-4 pt-5 pb-6 relative z-10">
          <Link href="/sanyam/vrat-db"
            className="inline-flex items-center gap-1.5 text-gray-500 font-sans text-sm mb-4 hover:text-gray-700 font-bold">
            ← सभी व्रत
          </Link>

          <div className="flex items-start gap-4 mb-5">
            {/* Emoji card */}
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-5xl shadow-lg shrink-0 bg-white"
              style={{border:`3px solid ${vrat.color}30`}}>
              {vrat.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="font-hindi font-black text-2xl text-gray-900 leading-snug mb-1">{vrat.name_hi}</h1>
              <p className="font-sans text-xs text-gray-400 mb-3">{vrat.name}</p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full px-3 py-1 font-hindi text-xs font-bold"
                  style={{background:diff.bg,color:diff.c,border:`1px solid ${diff.c}30`}}>
                  {diff.hi}
                </span>
                <span className="rounded-full px-3 py-1 font-sans text-xs font-bold bg-white text-amber-600 shadow-sm">
                  ⭐ {vrat.stars_reward} pts
                </span>
                <span className="rounded-full px-3 py-1 font-sans text-xs font-bold bg-white text-gray-500 shadow-sm">
                  {vrat.duration_days === 1 ? "1 दिन" : `${vrat.duration_days} दिन`}
                </span>
                <span className="rounded-full px-3 py-1 font-hindi text-xs font-bold bg-white shadow-sm"
                  style={{color:vrat.color}}>
                  📅 {vrat.jain_month} {vrat.jain_date}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4" style={{border:"1px solid #E5E7EB"}}>
            <p className="font-hindi text-sm text-gray-700 leading-relaxed">{vrat.description_hi}</p>
          </div>

          {/* Enroll button */}
          {enrolled ? (
            <div className="flex items-center gap-3 rounded-2xl px-5 py-3.5 bg-green-50" style={{border:"2px solid #86EFAC"}}>
              <span className="text-2xl">✅</span>
              <div className="flex-1">
                <p className="font-sans font-black text-sm text-green-700">व्रत शुरू हो गया! जय जिनेन्द्र!</p>
                <p className="font-hindi text-xs text-green-600">आपका व्रत profile में दर्ज है</p>
              </div>
              <Link href="/sanyam/profile" className="font-sans text-xs font-black text-green-600 shrink-0">Profile →</Link>
            </div>
          ) : (
            <button onClick={enroll} disabled={enrolling}
              className="w-full py-4 rounded-2xl font-sans font-black text-base text-white shadow-lg transition-all active:scale-98 disabled:opacity-60"
              style={{background:`linear-gradient(135deg,${vrat.color},${vrat.color}dd)`,
                boxShadow:`0 8px 24px ${vrat.color}35`}}>
              {enrolling ? "शुरू हो रहा है..." : `🙏 ${vrat.name_hi} शुरू करें`}
            </button>
          )}
        </div>
      </div>

      {/* ── CONTENT TABS ── */}
      <div className="max-w-3xl mx-auto px-4 py-4">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm mb-4" style={{border:"1px solid #E5E7EB"}}>
          {[
            {id:"katha", l:"📖 व्रत कथा",  sub:"Story"},
            {id:"vidhi", l:"📋 विधि",       sub:"Procedure"},
            {id:"phala", l:"🌟 फल",         sub:"Benefits"},
          ].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as typeof tab)}
              className="flex-1 py-2.5 rounded-xl font-sans font-black text-xs transition-all"
              style={{
                background:tab===t.id?vrat.color:"transparent",
                color:tab===t.id?"white":"#6B7280",
              }}>
              {t.l}
              <span className="block text-[8px] opacity-70 font-normal">{t.sub}</span>
            </button>
          ))}
        </div>

        {/* ── KATHA TAB ── */}
        {tab === "katha" && (
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm" style={{border:"1px solid #E5E7EB"}}>
            {/* Katha header */}
            <div className="px-5 py-4" style={{
              background:`linear-gradient(135deg,${vrat.color}10,${vrat.color}05)`,
              borderBottom:"1px solid #F1F5F9"
            }}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{vrat.emoji}</span>
                <div>
                  <p className="font-sans font-black text-sm text-gray-900">व्रत कथा</p>
                  <p className="font-hindi text-[10px] text-gray-500">Vrat Katha · Spiritual Story</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-5">
              {kathaParas.length === 0 ? (
                <p className="font-hindi text-sm text-gray-400 text-center py-8">कथा शीघ्र उपलब्ध होगी...</p>
              ) : (
                <div className="space-y-4">
                  {kathaParas.map((para, i) => {
                    const isHeader = para.startsWith("**") || para.match(/^[१२३४५६७८९।]/) || para.match(/^\d+\./);
                    const cleaned  = para.replace(/\*\*/g, "");
                    return (
                      <p key={i}
                        className={`leading-relaxed ${isHeader ? "font-hindi font-black text-sm" : "font-hindi text-sm text-gray-700"}`}
                        style={isHeader ? {color:vrat.color} : {}}>
                        {cleaned}
                      </p>
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

        {/* ── VIDHI TAB ── */}
        {tab === "vidhi" && (
          <div className="space-y-4">
            {vidhiSteps.length > 0 && (
              <div className="bg-white rounded-3xl p-5 shadow-sm" style={{border:"1px solid #E5E7EB"}}>
                <p className="font-sans font-black text-base text-gray-900 mb-5">📋 व्रत विधि — Step by Step</p>
                <div className="space-y-3">
                  {vidhiSteps.filter(s=>s.trim().length > 3).map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center font-sans font-black text-[11px] text-white shrink-0 mt-0.5"
                        style={{background:vrat.color, minWidth:28}}>
                        {i+1}
                      </div>
                      <p className="font-hindi text-sm text-gray-700 leading-relaxed flex-1">{step.trim()}।</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {vrat.rules && (
              <div className="bg-white rounded-3xl p-5 shadow-sm" style={{border:"1px solid #E5E7EB"}}>
                <p className="font-sans font-black text-base text-gray-900 mb-4">⚠️ व्रत के नियम</p>
                <div className="space-y-2.5">
                  {vrat.rules.split("।").filter(r=>r.trim().length>3).map((rule, i) => (
                    <div key={i} className="flex gap-2.5 items-start">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{background:`${vrat.color}15`}}>
                        <span className="text-[9px]" style={{color:vrat.color}}>✓</span>
                      </div>
                      <p className="font-hindi text-sm text-gray-700 leading-relaxed">{rule.trim()}।</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PHALA TAB ── */}
        {tab === "phala" && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 shadow-sm" style={{border:"1px solid #E5E7EB"}}>
              <p className="font-sans font-black text-base text-gray-900 mb-5">🌟 व्रत के फल — Spiritual Benefits</p>
              <div className="space-y-3">
                {benefitsList.filter(b=>b.trim().length>3).map((b, i) => (
                  <div key={i} className="flex gap-3 items-start rounded-2xl p-3"
                    style={{background:`${vrat.color}06`,border:`1px solid ${vrat.color}15`}}>
                    <span className="text-lg shrink-0">✨</span>
                    <p className="font-hindi text-sm text-gray-700 leading-relaxed">{b.trim()}।</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reward card */}
            <div className="rounded-2xl p-5 text-center" style={{background:"#FFFBEB",border:"2px solid #FDE68A"}}>
              <p className="font-sans font-black text-3xl text-amber-700 mb-1">⭐ {vrat.stars_reward}</p>
              <p className="font-hindi text-sm text-amber-600">Dharma Points मिलेंगे इस व्रत को पूरा करने पर</p>
              {!enrolled && (
                <button onClick={enroll} disabled={enrolling}
                  className="mt-4 px-6 py-2.5 rounded-2xl font-sans font-black text-sm text-white"
                  style={{background:vrat.color}}>
                  {enrolling ? "..." : "🙏 अभी शुरू करें"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-2 bg-white shadow-lg" style={{borderTop:"1px solid #E5E7EB"}}>
        <div className="max-w-xl mx-auto flex gap-3">
          <Link href="/sanyam/vrat-db"
            className="flex-1 py-3 rounded-2xl font-sans font-black text-sm text-gray-600 text-center bg-gray-100 hover:bg-gray-200">
            ← सभी व्रत
          </Link>
          {enrolled ? (
            <Link href="/sanyam/profile"
              className="flex-1 py-3 rounded-2xl font-sans font-black text-sm text-white text-center"
              style={{background:"#16A34A"}}>
              ✅ Profile देखें →
            </Link>
          ) : (
            <button onClick={enroll} disabled={enrolling}
              className="flex-1 py-3 rounded-2xl font-sans font-black text-sm text-white transition-all disabled:opacity-60"
              style={{background:`linear-gradient(135deg,${vrat.color},${vrat.color}dd)`}}>
              {enrolling ? "..." : `🙏 ${vrat.name_hi} शुरू करें`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
