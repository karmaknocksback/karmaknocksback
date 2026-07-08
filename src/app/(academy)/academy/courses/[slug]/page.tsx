"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Video {
  id:number;title:string;youtube_id:string|null;youtube_url:string;
  duration_seconds:number;sequence_order:number;is_mandatory:number;
  is_free_preview:number;completed?:number;watch_percent?:number;
}
interface CourseData {
  course: {
    id:number;title:string;title_hi:string|null;slug:string;
    description:string|null;difficulty:string;total_videos:number;
    stars_reward:number;passing_marks:number;is_free:number;
  };
  videos: Video[];
  quiz: { id:number;title:string;time_limit_minutes:number;passing_percent:number } | null;
  enrollment: { progress_percent:number;completed:number } | null;
}

export default function CourseDetailPage() {
  const { slug } = useParams<{slug:string}>();
  const router = useRouter();

  const [data, setData]             = useState<CourseData|null>(null);
  const [loading, setLoading]       = useState(true);
  const [activeVideo, setActiveVideo] = useState<Video|null>(null);
  const [enrolled, setEnrolled]     = useState(false);
  const [enrolling, setEnrolling]   = useState(false);
  const [enrollError, setEnrollError] = useState("");

  // Auth state — resolved via API (works for BOTH cookie login and localStorage)
  const [token, setToken]       = useState<string|null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // ── Step 1: resolve auth (cookie OR localStorage) ──────────────
  useEffect(() => {
    async function resolveAuth() {
      // First try localStorage (fast path)
      const lsToken = localStorage.getItem("academy_token");
      if (lsToken) {
        setToken(lsToken);
        setAuthChecked(true);
        return;
      }
      // Fall back to cookie (handles Google OAuth and server-set sessions)
      try {
        const res = await fetch("/api/academy/auth/token", { credentials:"include" });
        const data = await res.json();
        if (data.token) {
          // Save to localStorage so future page loads are instant
          localStorage.setItem("academy_token", data.token);
          setToken(data.token);
        }
      } catch { /* ignore network errors */ }
      setAuthChecked(true);
    }
    resolveAuth();
  }, []);

  const isLoggedIn = authChecked && !!token;

  // ── Step 2: load course after auth is known ──────────────────
  const fetchCourse = useCallback(async (tok: string|null) => {
    const headers: Record<string,string> = tok ? { "Authorization": `Bearer ${tok}` } : {};
    try {
      const res = await fetch(`/api/academy/courses/${slug}`, {
        headers, credentials: "include"
      });
      if (!res.ok) { setLoading(false); return; }
      const d: CourseData = await res.json();
      setData(d);
      setEnrolled(!!d.enrollment);
      setActiveVideo(prev => prev || d.videos?.[0] || null);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    if (authChecked) fetchCourse(token);
  }, [authChecked]); // eslint-disable-line

  // ── Step 3: enroll ───────────────────────────────────────────
  const enroll = useCallback(async () => {
    // Re-read token fresh
    const tok = localStorage.getItem("academy_token") || token;
    if (!tok) {
      router.push("/academy/login?redirect=" + encodeURIComponent("/academy/courses/" + slug));
      return;
    }
    setEnrolling(true); setEnrollError("");
    try {
      const res = await fetch(`/api/academy/courses/${slug}/enroll`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${tok}`, "Content-Type": "application/json" },
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setEnrolled(true);
        await fetchCourse(tok);
      } else if (res.status === 401) {
        // Token invalid — clear and re-login
        localStorage.removeItem("academy_token");
        router.push("/academy/login?redirect=" + encodeURIComponent("/academy/courses/" + slug));
      } else {
        setEnrollError(json.error || "Enrollment failed. Please try again.");
      }
    } catch {
      setEnrollError("Network error. Please try again.");
    } finally { setEnrolling(false); }
  }, [slug, token, router, fetchCourse]);

  function getYTId(url: string) {
    return url.match(/(?:v=|youtu\.be\/)([^&?]+)/)?.[1] || "";
  }
  function canWatch(v: Video) {
    return enrolled || v.is_free_preview === 1;
  }

  // ── Loading states ────────────────────────────────────────────
  if (!authChecked || loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-5xl animate-bounce mb-4">📚</div>
        <p className="font-sans text-sm text-gray-400 animate-pulse">Loading course...</p>
      </div>
    </div>
  );

  if (!data?.course) return (
    <div className="text-center py-20">
      <p className="font-sans text-gray-500 mb-3">Course not found.</p>
      <Link href="/academy/courses" className="font-sans text-sm text-amber-600 hover:underline">← All Courses</Link>
    </div>
  );

  const { course, videos, quiz, enrollment } = data;
  const completedCount = videos.filter(v => v.completed).length;
  const progressPct = enrollment?.progress_percent || 0;
  const ytId = activeVideo ? (activeVideo.youtube_id || getYTId(activeVideo.youtube_url)) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-sans text-xs text-gray-400 mb-4 flex-wrap">
        <Link href="/academy" className="hover:text-amber-600">Academy</Link>
        <span>/</span>
        <Link href="/academy/courses" className="hover:text-amber-600">Courses</Link>
        <span>/</span>
        <span className="text-amber-700 font-bold truncate max-w-xs">{course.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Player + Info ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Video player */}
          <div className="rounded-2xl overflow-hidden bg-gray-900 relative" style={{aspectRatio:"16/9"}}>
            {activeVideo && canWatch(activeVideo) && ytId ? (
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                className="w-full h-full"
                allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
                allowFullScreen title={activeVideo.title}/>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-5 px-8 text-center"
                style={{background:"linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)"}}>
                <div className="text-6xl">🔒</div>
                <div>
                  <p className="font-sans font-black text-white text-xl mb-2">
                    {activeVideo ? "Video Locked" : "Select a Video"}
                  </p>
                  <p className="font-sans text-gray-300 text-sm">
                    {!isLoggedIn
                      ? "Create a free account to unlock all videos"
                      : "Enroll in this course to watch all videos"}
                  </p>
                </div>
                {!isLoggedIn ? (
                  <div className="flex gap-3 flex-wrap justify-center">
                    <Link href={"/academy/login?redirect=" + encodeURIComponent("/academy/courses/" + slug)}
                      className="px-6 py-2.5 rounded-full font-sans font-black text-sm text-amber-900"
                      style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>
                      🔑 Sign In
                    </Link>
                    <Link href="/academy/register"
                      className="px-6 py-2.5 rounded-full font-sans font-black text-sm text-white"
                      style={{background:"linear-gradient(135deg,#9C27B0,#7B1FA2)"}}>
                      ✨ Register Free
                    </Link>
                  </div>
                ) : (
                  <button onClick={enroll} disabled={enrolling}
                    className="px-8 py-3 rounded-full font-sans font-black text-sm text-amber-900 disabled:opacity-60"
                    style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>
                    {enrolling ? "Enrolling..." : "🎓 Enroll Free to Watch"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Active video info */}
          {activeVideo && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h2 className="font-sans font-black text-base text-gray-800">{activeVideo.title}</h2>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs font-sans">
                <span className="text-gray-400">⏱️ {Math.round(activeVideo.duration_seconds/60)} min</span>
                {activeVideo.completed
                  ? <span className="text-green-600 font-bold">✅ Completed</span>
                  : activeVideo.watch_percent
                    ? <span className="text-blue-500">{activeVideo.watch_percent}% watched</span>
                    : null}
                {!canWatch(activeVideo) && (
                  <span className="text-orange-500 font-bold">🔒 Enroll to watch</span>
                )}
                {activeVideo.is_free_preview === 1 && (
                  <span className="text-green-600 font-bold bg-green-50 rounded-full px-2 py-0.5">Free Preview</span>
                )}
              </div>
            </div>
          )}

          {/* Course info */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h1 className="font-sans font-black text-xl text-gray-800 mb-1">{course.title}</h1>
            {course.title_hi && (
              <p className="font-display-hi text-base text-amber-700 mb-3">{course.title_hi}</p>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="rounded-full px-3 py-1 font-sans text-xs font-bold bg-green-100 text-green-700 capitalize">
                {course.difficulty}
              </span>
              <span className="font-sans text-xs text-gray-500">📹 {course.total_videos} videos</span>
              <span className="font-sans text-xs text-gray-500">⭐ {course.stars_reward} stars</span>
              {course.is_free ? (
                <span className="rounded-full px-3 py-1 font-sans text-xs font-bold bg-amber-100 text-amber-700">FREE</span>
              ) : null}
            </div>
            {course.description && (
              <p className="font-sans text-sm text-gray-600 leading-relaxed">{course.description}</p>
            )}
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-4">

          {/* Enroll / Progress card */}
          <div className="bg-white rounded-2xl p-5 shadow-md sticky top-20"
            style={{border:"2px solid rgba(255,215,0,0.4)"}}>

            {/* Progress */}
            {enrolled && enrollment && (
              <div className="mb-5">
                <div className="flex justify-between text-xs font-sans mb-1.5">
                  <span className="text-gray-500 font-bold">Your Progress</span>
                  <span className="text-amber-700 font-black">{progressPct}%</span>
                </div>
                <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{width:`${progressPct}%`, background:"linear-gradient(90deg,#FFD700,#4CAF50)"}}/>
                </div>
                <p className="font-sans text-xs text-gray-400 mt-1">
                  {completedCount}/{videos.length} videos completed
                </p>
              </div>
            )}

            {/* Error */}
            {enrollError && (
              <div className="mb-3 rounded-xl p-3 bg-red-50 border border-red-200">
                <p className="font-sans text-xs text-red-600 font-bold">{enrollError}</p>
              </div>
            )}

            {/* CTA — only show AFTER auth is known */}
            {!authChecked ? (
              <div className="h-12 rounded-2xl bg-gray-100 animate-pulse"/>
            ) : !isLoggedIn ? (
              <div className="space-y-2.5">
                <p className="font-sans text-xs text-gray-500 text-center mb-3">
                  Sign in to enroll and watch all videos free
                </p>
                <Link
                  href={"/academy/login?redirect=" + encodeURIComponent("/academy/courses/" + slug)}
                  className="block w-full text-center py-3.5 rounded-2xl font-sans font-black text-sm text-amber-900"
                  style={{background:"linear-gradient(135deg,#FFD700,#FF9800)", boxShadow:"0 4px 16px rgba(255,215,0,0.4)"}}>
                  🔑 Sign In to Enroll
                </Link>
                <Link
                  href="/academy/register"
                  className="block w-full text-center py-2.5 rounded-2xl font-sans font-bold text-sm text-purple-700 bg-purple-50 border-2 border-purple-200">
                  ✨ Create Free Account
                </Link>
              </div>
            ) : !enrolled ? (
              <button onClick={enroll} disabled={enrolling}
                className="w-full py-3.5 rounded-2xl font-sans font-black text-sm text-amber-900 disabled:opacity-60 transition-all hover:scale-[1.02]"
                style={{background:"linear-gradient(135deg,#FFD700,#FF9800)", boxShadow:"0 4px 16px rgba(255,215,0,0.4)"}}>
                {enrolling ? "⏳ Enrolling..." : "🎓 Enroll Free — Watch Now!"}
              </button>
            ) : quiz && progressPct >= 75 ? (
              <Link href={`/academy/quiz/${quiz.id}`}
                className="block w-full text-center py-3.5 rounded-2xl font-sans font-black text-sm text-white"
                style={{background:"linear-gradient(135deg,#4CAF50,#66BB6A)"}}>
                🎯 Take Quiz & Earn Certificate
              </Link>
            ) : (
              <div className="text-center rounded-xl p-4 bg-green-50 border border-green-200">
                <p className="font-sans text-sm font-black text-green-700">✅ Enrolled!</p>
                <p className="font-sans text-xs text-green-600 mt-1">Watch more videos to unlock the quiz</p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5">
              {[
                "✅ Enroll once, watch forever",
                `⭐ Earn ${course.stars_reward} Karma Stars`,
                "🏅 Certificate after quiz",
                "♾️ Free lifetime access",
              ].map(t => <p key={t} className="font-sans text-xs text-gray-500">{t}</p>)}
            </div>
          </div>

          {/* Playlist */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-sans font-black text-sm text-gray-800">📹 Course Videos</h3>
              <span className="font-sans text-[10px] text-gray-400">{videos.length} video{videos.length!==1?"s":""}</span>
            </div>
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
              {videos.map((v, i) => {
                const watchable = canWatch(v);
                const isActive = activeVideo?.id === v.id;
                return (
                  <button key={v.id}
                    onClick={() => {
                      if (watchable) setActiveVideo(v);
                      else if (isLoggedIn) enroll();
                      else router.push("/academy/login?redirect=" + encodeURIComponent("/academy/courses/" + slug));
                    }}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors ${isActive ? "bg-amber-50" : "hover:bg-gray-50"}`}>
                    <span className="text-sm shrink-0 w-6 text-center">
                      {v.completed ? "✅" : isActive ? "▶️" : watchable ? `${i+1}.` : "🔒"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-sans text-xs font-bold truncate ${watchable ? "text-gray-800" : "text-gray-400"}`}>
                        {v.title}
                      </p>
                      <p className="font-sans text-[10px] text-gray-400">
                        {Math.round(v.duration_seconds/60)} min
                        {v.is_free_preview ? " · Free preview" : ""}
                      </p>
                    </div>
                    {v.watch_percent && v.watch_percent > 0 && !v.completed ? (
                      <div className="w-8 h-1.5 rounded-full bg-gray-100 overflow-hidden shrink-0">
                        <div className="h-full bg-amber-400 rounded-full"
                          style={{width: `${v.watch_percent}%`}}/>
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
