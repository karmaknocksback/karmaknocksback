"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePlayer } from "@/context/PlayerContext";
import { getLevelFromStars, getLevelProgress, getNextLevel, GuestStars } from "@/lib/karma-stars";

interface AcademyUser { id:number; name:string; email:string; stars_balance:number; current_streak:number; level_name:string; }
interface AcademyStats { courses_enrolled:number; courses_completed:number; quizzes_passed:number; total_stars:number; }
interface SanyamActivity { id:number; vrat_name:string; vrat_emoji:string; status:string; current_day:number; total_days:number; start_date:string; }
interface FeedItem { id:number; display_name:string; avatar:string; vrat_name:string; vrat_emoji:string; feed_type:string; anumodana_count:number; created_at:string; }

const QUICK_LINKS = [
  {href:"/games",        emoji:"🎮", label:"Play Games",       color:"#2196F3", bg:"#E3F2FD"},
  {href:"/sanyam",       emoji:"🧘", label:"Sanyam Profile",   color:"#4CAF50", bg:"#E8F5E9"},
  {href:"/academy",      emoji:"🎓", label:"Academy",          color:"#FF9800", bg:"#FFF3E0"},
  {href:"/sanyam/vrat-db",emoji:"🙏",label:"Start a Vrat",    color:"#9C27B0", bg:"#F3E5F5"},
  {href:"/sanyam/feed",  emoji:"🌟", label:"Activity Feed",    color:"#E91E63", bg:"#FCE4EC"},
  {href:"/academy/courses",emoji:"📚",label:"Browse Courses",  color:"#00BCD4", bg:"#E0F7FA"},
  {href:"/shop",         emoji:"🛍️", label:"Shop",            color:"#795548", bg:"#EFEBE9"},
  {href:"/karma-mirror", emoji:"🪞", label:"Karma Mirror",    color:"#607D8B", bg:"#ECEFF1"},
];

const LEVEL_ICONS: Record<string,string> = {
  Seeker:"🌱", Learner:"📖", Shravak:"🙏", Scholar:"📚", Practitioner:"🧘",
  Teacher:"👨‍🏫", "Jain Master":"🌸", "Karma Master":"⭐", "Wisdom Guide":"💫", Arihant:"🌟",
};

export default function DashboardPage() {
  const { player, clearPlayer } = usePlayer();
  const [academyUser, setAcademyUser] = useState<AcademyUser|null>(null);
  const [academyStats, setAcademyStats] = useState<AcademyStats|null>(null);
  const [sanyamActivities, setSanyamActivities] = useState<SanyamActivity[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [guestStars, setGuestStars] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview"|"academy"|"sanyam"|"games">("overview");

  useEffect(()=>{
    async function load(){
      const tok = localStorage.getItem("academy_token");
      const headers: Record<string,string> = tok ? {"Authorization":`Bearer ${tok}`} : {};

      // Guest stars
      setGuestStars(GuestStars.get());

      // Academy user + stats
      if (tok) {
        try {
          const [tokenRes, dashRes] = await Promise.all([
            fetch("/api/academy/auth/token", {credentials:"include"}),
            fetch("/api/academy/dashboard", {headers, credentials:"include"}),
          ]);
          const tokenData = await tokenRes.json();
          if (tokenData.user) setAcademyUser(tokenData.user);
          const dashData = await dashRes.json();
          if (dashData.stats) setAcademyStats(dashData.stats);
        } catch {}
      }

      // Sanyam activities
      try {
        const sRes = await fetch("/api/sanyam/activity", {headers, credentials:"include"});
        const sData = await sRes.json();
        setSanyamActivities(sData.activities||[]);
      } catch {}

      // Public feed
      try {
        const fRes = await fetch("/api/sanyam/feed?limit=5");
        const fData = await fRes.json();
        setFeed(fData.feed||[]);
      } catch {}

      setLoading(false);
    }
    load();
  },[]);

  const totalStars = (academyUser?.stars_balance || 0) + guestStars;
  const level = getLevelFromStars(totalStars);
  const nextLevel = getNextLevel(totalStars);
  const pct = getLevelProgress(totalStars);
  const activeVrats = sanyamActivities.filter(a=>a.status==="active");
  const completedVrats = sanyamActivities.filter(a=>a.status==="completed");
  const isLoggedIn = !!academyUser;

  const displayName = academyUser?.name || player?.name || "Guest";
  const displayEmail = academyUser?.email || "";
  const displayAvatar = player?.avatar || "👤";
  const streak = academyUser?.current_streak || 0;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center"><div className="text-5xl animate-bounce mb-3">⭐</div><p className="font-sans text-sm text-gray-400 animate-pulse">Loading your dashboard...</p></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-20">

      {/* ── Hero Profile Card ── */}
      <div className="rounded-3xl overflow-hidden mb-6 shadow-xl relative"
        style={{background:`linear-gradient(135deg,#1a0800,#3E1F00,#1a1a2e)`}}>
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-[0.03] text-9xl flex items-center justify-center select-none pointer-events-none">🕉️</div>
        <div className="relative z-10 px-6 sm:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar + level */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-5xl"
                style={{background:`linear-gradient(135deg,${level.color}40,${level.color}20)`,border:`3px solid ${level.color}60`}}>
                {displayAvatar}
              </div>
              <div className="absolute -bottom-1 -right-1 rounded-full px-2 py-0.5 text-[10px] font-black font-sans border-2 border-white"
                style={{background:level.color,color:"white"}}>
                {level.emoji} L{level.level}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="font-sans font-black text-2xl text-white mb-0.5">{displayName}</h1>
              {displayEmail&&<p className="font-sans text-xs text-gray-400 mb-2">{displayEmail}</p>}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{level.emoji}</span>
                <span className="font-sans font-black text-sm" style={{color:level.color}}>{level.name}</span>
                <span className="font-hindi text-xs text-gray-400">{level.nameHi}</span>
              </div>

              {/* Level progress */}
              <div className="max-w-xs">
                <div className="flex justify-between text-[10px] font-sans mb-1">
                  <span className="text-gray-400">⭐ {totalStars.toLocaleString()} Stars</span>
                  {nextLevel&&<span style={{color:nextLevel.color}} className="font-bold">{(nextLevel.min-totalStars).toLocaleString()} to {nextLevel.name}</span>}
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full" style={{width:`${pct}%`,background:`linear-gradient(90deg,${level.color},${nextLevel?.color||level.color})`}}/>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
              {[
                {l:"⭐ Stars",     v:totalStars.toLocaleString(),  c:"#FFD700"},
                {l:"🔥 Streak",   v:`${streak}d`,                  c:"#FF9800"},
                {l:"🙏 Vrats",    v:completedVrats.length,         c:"#9C27B0"},
                {l:"🎓 Courses",  v:academyStats?.courses_completed||0, c:"#4CAF50"},
              ].map(s=>(
                <div key={s.l} className="rounded-xl p-3 text-center"
                  style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"}}>
                  <p className="font-display text-xl font-black" style={{color:s.c}}>{s.v}</p>
                  <p className="font-sans text-[9px] text-gray-400">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {!isLoggedIn&&(
            <div className="mt-4 rounded-xl p-3 flex items-center justify-between"
              style={{background:"rgba(255,215,0,0.08)",border:"1px solid rgba(255,215,0,0.2)"}}>
              <div>
                <p className="font-sans text-xs font-bold text-amber-300">Sign in to save your progress & stars permanently!</p>
                <p className="font-sans text-[10px] text-gray-400">Currently in guest mode — progress may be lost</p>
              </div>
              <Link href="/academy/login"
                className="shrink-0 px-4 py-2 rounded-full font-sans font-black text-xs text-amber-900"
                style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>
                Sign In →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {([
          {id:"overview", label:"📊 Overview"},
          {id:"academy",  label:"🎓 Academy"},
          {id:"sanyam",   label:"🧘 Sanyam"},
          {id:"games",    label:"🎮 Games"},
        ] as {id:typeof activeTab; label:string}[]).map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)}
            className="shrink-0 rounded-full px-5 py-2 font-sans font-black text-xs transition-all"
            style={{
              background:activeTab===t.id?"linear-gradient(135deg,#1a0800,#3E1F00)":"rgba(255,255,255,0.8)",
              color:activeTab===t.id?"white":"#555",
              border:`2px solid ${activeTab===t.id?"transparent":"#E0E0E0"}`,
              boxShadow:activeTab===t.id?"0 4px 12px rgba(0,0,0,0.15)":"none",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab==="overview"&&(
        <div className="space-y-6">
          {/* Quick links */}
          <div>
            <h2 className="font-sans font-black text-base text-gray-800 mb-3">🚀 Quick Access</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {QUICK_LINKS.map(l=>(
                <Link key={l.href} href={l.href}
                  className="rounded-2xl p-4 text-center hover:-translate-y-1 transition-all"
                  style={{background:l.bg,border:`1.5px solid ${l.color}20`}}>
                  <div className="text-3xl mb-1.5">{l.emoji}</div>
                  <p className="font-sans font-black text-xs" style={{color:l.color}}>{l.label}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Active vrats + recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Sanyam */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-sans font-black text-sm text-gray-800">🔥 Active Practices</h2>
                <Link href="/sanyam/profile" className="font-sans text-[10px] text-purple-600 font-bold">See all →</Link>
              </div>
              {activeVrats.length===0 ? (
                <div className="text-center py-6">
                  <p className="font-sans text-xs text-gray-400 mb-3">No active practices. Start your spiritual journey!</p>
                  <Link href="/sanyam/vrat-db"
                    className="inline-block px-4 py-2 rounded-full font-sans font-black text-xs text-white"
                    style={{background:"linear-gradient(135deg,#9C27B0,#7B1FA2)"}}>
                    Browse Vrats →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeVrats.slice(0,4).map(a=>(
                    <div key={a.id} className="flex items-center gap-3 rounded-xl p-3 bg-purple-50">
                      <span className="text-2xl">{a.vrat_emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-bold text-xs text-gray-800 truncate">{a.vrat_name}</p>
                        <p className="font-sans text-[10px] text-purple-600 font-bold">Day {a.current_day}{a.total_days>0?`/${a.total_days}`:""} · Active</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity feed preview */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-sans font-black text-sm text-gray-800">🌟 Community Feed</h2>
                <Link href="/sanyam/feed" className="font-sans text-[10px] text-amber-600 font-bold">See all →</Link>
              </div>
              {feed.length===0 ? (
                <p className="font-sans text-xs text-gray-400 text-center py-6">No activity yet</p>
              ) : (
                <div className="space-y-2">
                  {feed.slice(0,4).map(item=>(
                    <div key={item.id} className="flex items-center gap-2 rounded-xl p-2.5 bg-amber-50">
                      <span className="text-xl">{item.avatar}</span>
                      <p className="font-sans text-xs text-gray-700 flex-1 min-w-0">
                        <span className="font-bold">{item.display_name}</span>{" "}
                        <span>{item.feed_type==="completed"?"completed":"started"}</span>{" "}
                        <span>{item.vrat_emoji} {item.vrat_name}</span>
                      </p>
                      <span className="font-sans text-[9px] text-orange-600 font-bold shrink-0">🙏 {item.anumodana_count||0}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Academy Tab ── */}
      {activeTab==="academy"&&(
        <div className="space-y-4">
          {!isLoggedIn&&(
            <div className="rounded-2xl p-6 text-center" style={{background:"rgba(255,215,0,0.08)",border:"2px dashed rgba(255,215,0,0.4)"}}>
              <div className="text-4xl mb-3">🎓</div>
              <p className="font-sans font-bold text-gray-700 mb-2">Sign in to access your Academy progress</p>
              <Link href="/academy/login" className="inline-block px-6 py-2.5 rounded-full font-sans font-black text-sm text-amber-900"
                style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>Sign In →</Link>
            </div>
          )}
          {academyStats&&(
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                {l:"Courses Enrolled",v:academyStats.courses_enrolled, c:"#2196F3"},
                {l:"Courses Completed",v:academyStats.courses_completed,c:"#4CAF50"},
                {l:"Quizzes Passed",   v:academyStats.quizzes_passed,  c:"#FF9800"},
                {l:"Total Stars",      v:academyStats.total_stars,     c:"#FFD700"},
              ].map(s=>(
                <div key={s.l} className="bg-white rounded-2xl p-4 text-center shadow-sm">
                  <p className="font-display text-2xl font-black" style={{color:s.c}}>{s.v}</p>
                  <p className="font-sans text-[10px] text-gray-400">{s.l}</p>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3 flex-wrap">
            <Link href="/academy/courses" className="px-6 py-3 rounded-2xl font-sans font-black text-sm text-white"
              style={{background:"linear-gradient(135deg,#FF9800,#FFD700)",color:"#1a0800"}}>📚 Browse Courses</Link>
            <Link href="/academy/dashboard" className="px-6 py-3 rounded-2xl font-sans font-black text-sm text-white"
              style={{background:"linear-gradient(135deg,#2196F3,#1565C0)"}}>📊 Full Academy Dashboard</Link>
            <Link href="/academy/leaderboard" className="px-6 py-3 rounded-2xl font-sans font-black text-sm text-white"
              style={{background:"linear-gradient(135deg,#9C27B0,#7B1FA2)"}}>🏆 Leaderboard</Link>
          </div>
        </div>
      )}

      {/* ── Sanyam Tab ── */}
      {activeTab==="sanyam"&&(
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              {l:"Active",v:activeVrats.length,c:"#4CAF50"},
              {l:"Completed",v:completedVrats.length,c:"#2196F3"},
              {l:"Total",v:sanyamActivities.length,c:"#9C27B0"},
            ].map(s=>(
              <div key={s.l} className="bg-white rounded-2xl p-4 text-center shadow-sm">
                <p className="font-display text-2xl font-black" style={{color:s.c}}>{s.v}</p>
                <p className="font-sans text-[10px] text-gray-400">{s.l}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {sanyamActivities.slice(0,8).map(a=>(
              <div key={a.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
                <span className="text-3xl">{a.vrat_emoji||"🙏"}</span>
                <div className="flex-1">
                  <p className="font-sans font-bold text-sm text-gray-800">{a.vrat_name}</p>
                  <p className="font-sans text-[10px]" style={{color:a.status==="active"?"#4CAF50":"#2196F3"}}>
                    {a.status==="active"?`● Active · Day ${a.current_day}`:"✅ Completed"} · {a.start_date}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link href="/sanyam/vrat-db" className="px-6 py-3 rounded-2xl font-sans font-black text-sm text-white"
              style={{background:"linear-gradient(135deg,#9C27B0,#7B1FA2)"}}>+ Start New Practice</Link>
            <Link href="/sanyam/profile" className="px-6 py-3 rounded-2xl font-sans font-black text-sm text-white"
              style={{background:"linear-gradient(135deg,#4CAF50,#2E7D32)"}}>🧘 Full Sanyam Profile</Link>
            <Link href="/sanyam/leaderboard" className="px-6 py-3 rounded-2xl font-sans font-black text-sm text-white"
              style={{background:"linear-gradient(135deg,#FF9800,#E65100)"}}>🏆 Sanyam Leaderboard</Link>
          </div>
        </div>
      )}

      {/* ── Games Tab ── */}
      {activeTab==="games"&&(
        <div className="space-y-4">
          <div className="rounded-2xl p-8 text-center bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="font-sans font-black text-lg text-gray-800 mb-2">Karma Kids World Games</h2>
            <p className="font-sans text-sm text-gray-500 mb-6 max-w-md mx-auto">
              Play Jain-themed games, earn Karma Stars, and learn spiritual values through fun gameplay!
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/games" className="px-8 py-3 rounded-2xl font-sans font-black text-sm text-white"
                style={{background:"linear-gradient(135deg,#2196F3,#1565C0)"}}>🎮 Browse All Games</Link>
              <Link href="/games/word-builder" className="px-6 py-3 rounded-2xl font-sans font-black text-sm text-white"
                style={{background:"linear-gradient(135deg,#9C27B0,#7B1FA2)"}}>📝 Word Builder</Link>
              <Link href="/games/karma-crush" className="px-6 py-3 rounded-2xl font-sans font-black text-sm text-white"
                style={{background:"linear-gradient(135deg,#E91E63,#880E4F)"}}>🪷 Karma Crush</Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings footer ── */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-3 justify-between items-center">
        <div className="flex gap-3 flex-wrap">
          <Link href="/sanyam/profile" className="font-sans text-xs text-gray-500 hover:text-gray-700">🧘 Sanyam Profile</Link>
          <Link href="/academy/dashboard" className="font-sans text-xs text-gray-500 hover:text-gray-700">🎓 Academy</Link>
          <Link href="/sanyam/leaderboard" className="font-sans text-xs text-gray-500 hover:text-gray-700">🏆 Leaderboards</Link>
        </div>
        {isLoggedIn&&(
          <div className="flex gap-2">
            <button onClick={()=>{localStorage.removeItem("academy_token");window.location.href="/";}}
              className="font-sans text-xs text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
              Sign Out
            </button>
            <button onClick={()=>{clearPlayer();window.location.href="/";}}
              className="font-sans text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              Switch Player
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
