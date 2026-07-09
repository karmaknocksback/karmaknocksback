"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface Vrat {
  id:number; name:string; name_hi:string; slug:string; category:string;
  emoji:string; color:string; difficulty:string; duration_days:number;
  stars_reward:number; stars_per_day:number; description:string;
  description_hi:string; rules:string; benefits:string; jain_month:string;
}

const DIFF_COLOR: Record<string,string> = {easy:"#4CAF50",medium:"#FF9800",hard:"#F44336",extreme:"#9C27B0"};
const DIFF_LABEL: Record<string,string> = {easy:"Beginner",medium:"Moderate",hard:"Advanced",extreme:"Expert Only"};

export default function VratDetailPage() {
  const { slug } = useParams<{slug:string}>();
  const router = useRouter();
  const [vrat, setVrat] = useState<Vrat|null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(()=>{
    setIsLoggedIn(!!localStorage.getItem("academy_token"));
    fetch("/api/sanyam/vrats").then(r=>r.json()).then(d=>{
      const found=(d.vrats||[]).find((v:Vrat)=>v.slug===slug);
      setVrat(found||null); setLoading(false);
    });
  },[slug]);

  async function startVrat() {
    if (!vrat) return;
    setStarting(true); setError("");
    const tok = localStorage.getItem("academy_token");
    const gid = localStorage.getItem("sanyam_guest") || ("g_"+Math.random().toString(36).slice(2,10));
    localStorage.setItem("sanyam_guest", gid);
    
    try {
      const res = await fetch("/api/sanyam/activity", {
        method:"POST", credentials:"include",
        headers: {
          ...(tok?{"Authorization":`Bearer ${tok}`}:{}),
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          vrat_id:vrat.id, is_public:true, guestId:gid,
          displayName:localStorage.getItem("academy_token")?"":"A devotee",
          avatar:"🧘"
        })
      });
      const d = await res.json();
      if (d.success || d.activityId) {
        setStarted(true);
        setTimeout(()=>router.push("/sanyam/profile"), 2000);
      } else {
        setError(d.error||"Could not start. Try again.");
      }
    } catch { setError("Network error. Please try again."); }
    setStarting(false);
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="text-5xl animate-bounce">🙏</div></div>;
  if (!vrat) return <div className="text-center py-20 font-sans text-gray-500">Vrat not found. <a href="/sanyam/vrat-db" className="text-purple-600">Browse all →</a></div>;

  const rules = (vrat.rules||"").split("|").filter(Boolean);
  const diffCol = DIFF_COLOR[vrat.difficulty]||"#666";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-20">
      {/* Header card */}
      <div className="rounded-3xl overflow-hidden mb-6 shadow-xl"
        style={{border:`3px solid ${vrat.color}40`}}>
        <div className="px-8 py-10 text-center"
          style={{background:`linear-gradient(135deg,${vrat.color}18,${vrat.color}08)`}}>
          <div className="text-7xl mb-4">{vrat.emoji}</div>
          <h1 className="font-sans font-black text-2xl text-gray-800 mb-1">{vrat.name}</h1>
          <p className="font-hindi text-base text-gray-500 mb-4">{vrat.name_hi}</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="rounded-full px-3 py-1.5 font-sans font-black text-xs"
              style={{background:`${diffCol}18`,color:diffCol,border:`1.5px solid ${diffCol}40`}}>
              {DIFF_LABEL[vrat.difficulty]||vrat.difficulty}
            </span>
            <span className="font-sans text-xs text-amber-700 font-bold bg-amber-50 rounded-full px-3 py-1.5">⭐ {vrat.stars_reward} stars</span>
            {vrat.duration_days>0 ? (
              <span className="font-sans text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1.5">{vrat.duration_days} day{vrat.duration_days!==1?"s":""}</span>
            ) : (
              <span className="font-sans text-xs text-green-600 bg-green-50 rounded-full px-3 py-1.5">Ongoing practice</span>
            )}
            {vrat.jain_month&&<span className="font-hindi text-xs text-amber-700 bg-amber-50 rounded-full px-3 py-1.5 border border-amber-200">📅 {vrat.jain_month}</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* Description */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-sans font-black text-sm text-gray-800 mb-3">📖 About This Practice</h2>
          <p className="font-sans text-sm text-gray-600 leading-relaxed mb-3">{vrat.description}</p>
          {vrat.description_hi&&<p className="font-hindi text-sm text-gray-500 leading-relaxed">{vrat.description_hi}</p>}
        </div>

        {/* Rules */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-sans font-black text-sm text-gray-800 mb-3">📋 Rules & Guidelines</h2>
          {rules.length > 0 ? (
            <ul className="space-y-2">
              {rules.map((r,i)=>(
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500 font-bold shrink-0 mt-0.5">✓</span>
                  <span className="font-sans text-xs text-gray-600 leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
          ) : <p className="font-sans text-xs text-gray-400">Follow traditional guidelines</p>}
        </div>
      </div>

      {/* Calendar vrat special notice */}
      {vrat.slug?.startsWith("calendar-")&&(
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4"
          style={{border:"2px solid rgba(255,152,0,0.3)"}}>
          <h2 className="font-sans font-black text-sm text-amber-800 mb-2">📅 पंचांग तिथि / Hindu Calendar Date</h2>
          <p className="font-hindi text-sm text-amber-700 font-bold mb-3">{vrat.jain_month}</p>
          <div className="rounded-xl p-3" style={{background:"rgba(255,152,0,0.06)"}}>
            <p className="font-hindi text-xs text-gray-600 leading-relaxed">
              इस व्रत/पर्व की विस्तृत विधि, नियम और आचरण के लिए अपने स्थानीय जैन मंदिर के 
              आचार्य या पंडित जी से संपर्क करें। हम शीघ्र ही इस व्रत की सम्पूर्ण जानकारी जोड़ेंगे।
            </p>
            <p className="font-sans text-[10px] text-amber-600 font-bold mt-2">
              📌 For detailed procedure, rules & guidance, consult your local Jain Acharya or temple.
              We will soon add complete vidhi for this vrat.
            </p>
          </div>
        </div>
      )}
      {/* Benefits */}
      {vrat.benefits&&(
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6"
          style={{border:`2px solid ${vrat.color}20`}}>
          <h2 className="font-sans font-black text-sm mb-2" style={{color:vrat.color}}>✨ Spiritual Benefits</h2>
          <p className="font-sans text-sm text-gray-600">{vrat.benefits}</p>
        </div>
      )}

      {/* Star rewards */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <h2 className="font-sans font-black text-sm text-gray-800 mb-3">⭐ Karma Stars Earned</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3 text-center" style={{background:"rgba(255,152,0,0.1)"}}>
            <p className="font-display text-2xl font-black text-amber-600">{vrat.stars_reward}</p>
            <p className="font-sans text-[10px] text-gray-400">On Completion</p>
          </div>
          {vrat.stars_per_day>0&&(
            <div className="rounded-xl p-3 text-center" style={{background:"rgba(76,175,80,0.1)"}}>
              <p className="font-display text-2xl font-black text-green-600">{vrat.stars_per_day}</p>
              <p className="font-sans text-[10px] text-gray-400">Per Day</p>
            </div>
          )}
        </div>
      </div>

      {/* START BUTTON */}
      <div className="rounded-3xl p-6 text-center"
        style={{background:`linear-gradient(135deg,${vrat.color}12,${vrat.color}06)`,border:`3px solid ${vrat.color}30`}}>
        {started ? (
          <div>
            <div className="text-5xl mb-3">🎉</div>
            <p className="font-sans font-black text-lg text-gray-800 mb-1">Started! Redirecting to profile...</p>
            <p className="font-hindi text-sm text-gray-500">जय जिनेन्द्र! आपकी साधना शुरू हो गई।</p>
          </div>
        ) : (
          <>
            <p className="font-sans text-sm text-gray-600 mb-5">
              Ready to begin <strong>{vrat.name}</strong>?<br/>
              This will be added to your Sanyam Profile and shared on the activity feed.
            </p>
            {error&&<p className="font-sans text-xs text-red-500 font-bold mb-3 bg-red-50 rounded-xl p-2">{error}</p>}
            <button onClick={startVrat} disabled={starting}
              className="w-full py-4 rounded-2xl font-sans font-black text-base disabled:opacity-60 mb-3"
              style={{background:`linear-gradient(135deg,${vrat.color},${vrat.color}99)`,color:"white",
                boxShadow:`0 8px 24px ${vrat.color}50`}}>
              {starting?"Starting...": `${vrat.emoji} Start ${vrat.name}`}
            </button>
            {!isLoggedIn&&(
              <p className="font-sans text-xs text-gray-400">
                <a href="/academy/login" className="text-purple-600 font-bold hover:underline">Sign in</a> to save progress permanently & earn stars to your account
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
