"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface DashboardData {
  user: { id:number;name:string;email:string;avatar_url:string|null;current_level:number;total_stars:number;streak_days:number;email_verified:number } | null;
  enrollments: {id:number;progress_percent:number;completed:number;course_title:string;course_slug:string;course_thumbnail:string}[];
  badges: {id:number;name:string;icon:string;earned_at:string}[];
  notifications: {id:number;title:string;is_read:number;created_at:string}[];
  leaderboardRank: {rank:number} | null;
  levelInfo: {name:string;name_hi:string;color:string} | null;
  nextLevel: {name:string;stars_required:number} | null;
  recentActivity: {stars:number;reason:string;created_at:string}[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/academy/dashboard", { headers: { Authorization: `Bearer ${localStorage.getItem("academy_token")}` } })
      .then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-center"><div className="text-5xl mb-3 animate-bounce">📿</div><p className="font-hindi text-sm text-amber-600">लोड हो रहा है...</p></div></div>;

  if (!data?.user) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center"><div className="text-5xl mb-4">🔒</div>
        <h2 className="font-display-hi text-xl font-black text-amber-900 mb-3">Sign in to view dashboard</h2>
        <Link href="/academy/login" className="px-6 py-2.5 rounded-2xl font-sans font-black text-sm text-amber-900" style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>Sign In</Link>
      </div>
    </div>
  );

  const { user, enrollments, badges, notifications, leaderboardRank, levelInfo, nextLevel, recentActivity } = data;
  const starsToNext = nextLevel ? nextLevel.stars_required - user.total_stars : 0;
  const levelPct = nextLevel ? Math.min(100, Math.round(((user.total_stars - (levelInfo?.name?0:0)) / nextLevel.stars_required)*100)) : 100;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-20">
      {/* Profile card */}
      <div className="rounded-3xl p-6 mb-6 bg-white shadow-md" style={{border:"3px solid rgba(255,215,0,0.4)"}}>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl font-black text-amber-900" style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>
            {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full rounded-full object-cover"/> : user.name[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="font-sans font-black text-xl text-gray-800">{user.name}</h1>
            <p className="font-sans text-xs text-gray-400">{user.email}</p>
            {!user.email_verified && <p className="font-sans text-xs font-bold text-orange-500 mt-1">⚠️ Please verify your email to unlock all features</p>}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="rounded-full px-3 py-1 font-sans text-xs font-black text-white" style={{background:levelInfo?.color||"#FFD700"}}>{levelInfo?.name_hi||"Beginner"}</span>
              <span className="font-sans text-xs text-gray-500">🔥 {user.streak_days} day streak</span>
              <span className="font-sans text-xs text-gray-500">🏆 Rank #{leaderboardRank?.rank||"—"}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-4xl font-black text-amber-800">⭐ {user.total_stars}</p>
            <p className="font-sans text-xs text-gray-400">Total Stars</p>
          </div>
        </div>
        {nextLevel && (
          <div className="mt-4">
            <div className="flex justify-between text-xs font-sans mb-1">
              <span className="text-gray-500">Progress to {nextLevel.name}</span>
              <span className="font-bold text-amber-700">{starsToNext} stars needed</span>
            </div>
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{width:`${levelPct}%`,background:"linear-gradient(90deg,#FFD700,#FF9800)"}}/>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Courses */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm" style={{border:"2px solid rgba(255,215,0,0.2)"}}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-sans font-black text-sm text-gray-800">📚 My Courses</h2>
              <Link href="/academy/courses" className="font-sans text-xs text-amber-700 font-bold">Browse more →</Link>
            </div>
            {enrollments.length === 0 ? (
              <div className="text-center py-6"><div className="text-4xl mb-2">📚</div><p className="font-sans text-xs text-gray-400">No courses yet</p>
                <Link href="/academy/courses" className="mt-3 inline-block px-4 py-2 rounded-xl font-sans text-xs font-black text-amber-900" style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>Start Learning</Link>
              </div>
            ) : enrollments.map(e=>(
              <Link key={e.id} href={`/academy/courses/${e.course_slug}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 transition-colors mb-2">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-amber-100 flex items-center justify-center shrink-0">
                  {e.course_thumbnail ? <img src={e.course_thumbnail} className="w-full h-full object-cover"/> : <span className="text-2xl">📚</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-xs font-black text-gray-800 truncate">{e.course_title}</p>
                  <div className="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{width:`${e.progress_percent}%`,background:"linear-gradient(90deg,#FFD700,#4CAF50)"}}/>
                  </div>
                  <p className="font-sans text-[10px] text-gray-400 mt-0.5">{e.progress_percent}% complete {e.completed?"✅":""}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Badges */}
          <div className="bg-white rounded-2xl p-5 shadow-sm" style={{border:"2px solid rgba(255,215,0,0.2)"}}>
            <h2 className="font-sans font-black text-sm text-gray-800 mb-4">🏅 My Badges</h2>
            {badges.length === 0 ? (
              <p className="text-center py-4 font-sans text-xs text-gray-400">Complete courses to earn badges!</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {badges.map(b=>(
                  <div key={b.id} className="flex flex-col items-center gap-1 rounded-xl p-3 bg-amber-50 border border-amber-200">
                    <span className="text-3xl">{b.icon}</span>
                    <span className="font-sans text-[9px] font-black text-amber-800 text-center">{b.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Activity + Notifications */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm" style={{border:"2px solid rgba(255,215,0,0.2)"}}>
            <h2 className="font-sans font-black text-sm text-gray-800 mb-4">⭐ Recent Stars</h2>
            {recentActivity.length === 0 ? <p className="font-sans text-xs text-gray-400 text-center py-3">No activity yet</p>
            : recentActivity.slice(0,6).map((a,i)=>(
              <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                <p className="font-sans text-xs text-gray-600 truncate pr-2">{a.reason}</p>
                <span className="font-sans text-xs font-black text-amber-700 shrink-0">{a.stars>0?"+":""}{a.stars}⭐</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm" style={{border:"2px solid rgba(255,215,0,0.2)"}}>
            <h2 className="font-sans font-black text-sm text-gray-800 mb-4">🔔 Notifications</h2>
            {notifications.length === 0 ? <p className="font-sans text-xs text-gray-400 text-center py-3">All caught up!</p>
            : notifications.slice(0,5).map(n=>(
              <div key={n.id} className={`py-2 border-b border-gray-50 last:border-0 ${!n.is_read?"bg-amber-50 rounded-lg px-2":""}`}>
                <p className="font-sans text-xs font-bold text-gray-700">{n.title}</p>
                <p className="font-sans text-[10px] text-gray-400">{new Date(n.created_at).toLocaleDateString("hi")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}