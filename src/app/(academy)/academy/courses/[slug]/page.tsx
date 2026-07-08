"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface CourseData {
  course: { id:number;title:string;title_hi:string|null;slug:string;description:string|null;thumbnail_url:string|null;difficulty:string;total_videos:number;stars_reward:number;passing_marks:number;is_free:number;category_name:string|null };
  videos: { id:number;title:string;youtube_id:string|null;youtube_url:string;duration_seconds:number;sequence_order:number;is_mandatory:number;is_free_preview:number;completed?:number;watch_percent?:number }[];
  quiz: { id:number;title:string;time_limit_minutes:number;passing_percent:number } | null;
  enrollment: { progress_percent:number;completed:number } | null;
}

export default function CourseDetailPage() {
  const { slug } = useParams<{slug:string}>();
  const router = useRouter();
  const [data, setData] = useState<CourseData|null>(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<CourseData["videos"][0]|null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  // Always read token fresh
  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("academy_token") : null;
  const isLoggedIn = !!getToken();

  const loadCourse = useCallback(async () => {
    const token = getToken();
    const headers: Record<string,string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`/api/academy/courses/${slug}`, { headers });
    const d = await res.json();
    setData(d);
    setEnrolled(!!d.enrollment);
    if (d.videos?.[0]) setActiveVideo(d.videos[0]);
    setLoading(false);
  }, [slug]);

  useEffect(() => { loadCourse(); }, [loadCourse]);

  const enroll = useCallback(async () => {
    const token = getToken();
    if (!token) { router.push(`/academy/login?redirect=/academy/courses/${slug}`); return; }
    setEnrolling(true);
    const res = await fetch(`/api/academy/courses/${slug}/enroll`, {
      method:"POST",
      headers:{ "Authorization": `Bearer ${token}`, "Content-Type":"application/json" }
    });
    if (res.ok) {
      setEnrolled(true);
      await loadCourse(); // refresh progress
    }
    setEnrolling(false);
  }, [slug, router, loadCourse]);

  function canWatch(v: CourseData["videos"][0]) {
    return enrolled || v.is_free_preview === 1;
  }

  function getYTId(url: string): string {
    const m = url.match(/(?:v=|youtu\.be\/)([^&?]+)/);
    return m?.[1] || "";
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-5xl animate-bounce">📚</div></div>;
  if (!data?.course) return <div className="text-center py-20"><p className="font-sans text-gray-500">Course not found</p></div>;

  const { course, videos, quiz, enrollment } = data;
  const completedVideos = videos.filter(v=>v.completed).length;
  const ytId = activeVideo ? (activeVideo.youtube_id || getYTId(activeVideo.youtube_url)) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-20">
      <div className="flex items-center gap-2 font-sans text-xs text-gray-400 mb-4">
        <Link href="/academy">Academy</Link><span>/</span>
        <Link href="/academy/courses">Courses</Link><span>/</span>
        <span className="text-amber-700 font-bold truncate max-w-[200px]">{course.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Player */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video player */}
          <div className="rounded-2xl overflow-hidden bg-black relative" style={{aspectRatio:"16/9"}}>
            {activeVideo && canWatch(activeVideo) && ytId ? (
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                className="w-full h-full"
                allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
                allowFullScreen/>
            ) : activeVideo && !canWatch(activeVideo) ? (
              /* Locked video */
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 px-6 text-center"
                style={{background:"linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)"}}>
                <div className="text-6xl">🔒</div>
                <div>
                  <p className="font-sans font-black text-white text-xl mb-2">Video Locked</p>
                  <p className="font-sans text-gray-300 text-sm mb-4">
                    {isLoggedIn ? "Enroll in this course to watch all videos" : "Sign in and enroll to watch this video"}
                  </p>
                </div>
                {isLoggedIn ? (
                  <button onClick={enroll} disabled={enrolling}
                    className="px-8 py-3 rounded-full font-sans font-black text-sm text-amber-900 disabled:opacity-60"
                    style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>
                    {enrolling ? "Enrolling..." : "🎓 Enroll Free to Watch"}
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <Link href={`/academy/login?redirect=/academy/courses/${slug}`}
                      className="px-6 py-2.5 rounded-full font-sans font-black text-sm text-amber-900"
                      style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>
                      Sign In
                    </Link>
                    <Link href="/academy/register"
                      className="px-6 py-2.5 rounded-full font-sans font-black text-sm text-white"
                      style={{background:"linear-gradient(135deg,#9C27B0,#7B1FA2)"}}>
                      Register Free
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center"><span className="text-5xl">▶️</span><p className="mt-2 font-sans text-sm">Select a video</p></div>
              </div>
            )}
          </div>

          {activeVideo && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="font-sans font-black text-base text-gray-800 mb-1">{activeVideo.title}</h2>
              <div className="flex items-center gap-3 text-xs text-gray-400 font-sans">
                <span>⏱️ {Math.round(activeVideo.duration_seconds/60)} min</span>
                {activeVideo.completed ? <span className="text-green-600 font-bold">✅ Completed</span>
                  : activeVideo.watch_percent ? <span>{activeVideo.watch_percent}% watched</span> : null}
                {!canWatch(activeVideo) && <span className="text-orange-500 font-bold">🔒 Login to watch</span>}
              </div>
            </div>
          )}

          {/* Course info */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h1 className="font-sans font-black text-xl text-gray-800 mb-1">{course.title}</h1>
            {course.title_hi && <p className="font-display-hi text-base text-amber-700 mb-3">{course.title_hi}</p>}
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="rounded-full px-3 py-1 font-sans text-xs font-bold bg-green-100 text-green-700">{course.difficulty}</span>
              <span className="font-sans text-xs text-gray-500">📹 {course.total_videos} videos</span>
              <span className="font-sans text-xs text-gray-500">⭐ Earn {course.stars_reward} stars</span>
              {course.is_free ? <span className="font-sans text-xs font-bold text-green-700 bg-green-50 rounded-full px-3 py-1">FREE</span> : null}
            </div>
            {course.description && <p className="font-sans text-sm text-gray-600 leading-relaxed">{course.description}</p>}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Enroll / Progress */}
          <div className="bg-white rounded-2xl p-5 shadow-md sticky top-20" style={{border:"2px solid rgba(255,215,0,0.4)"}}>
            {enrollment && (
              <div className="mb-4">
                <div className="flex justify-between text-xs font-sans mb-1">
                  <span className="text-gray-500">Your Progress</span>
                  <span className="font-bold text-amber-700">{enrollment.progress_percent}%</span>
                </div>
                <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full" style={{width:`${enrollment.progress_percent}%`,background:"linear-gradient(90deg,#FFD700,#4CAF50)"}}/>
                </div>
                <p className="font-sans text-xs text-gray-400 mt-1">{completedVideos}/{videos.length} videos completed</p>
              </div>
            )}

            {!isLoggedIn ? (
              <div className="space-y-2.5">
                <p className="font-sans text-sm text-gray-600 text-center mb-3">Sign in to enroll and watch all videos</p>
                <Link href={`/academy/login?redirect=/academy/courses/${slug}`}
                  className="block w-full text-center py-3 rounded-2xl font-sans font-black text-sm text-amber-900"
                  style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>
                  🔑 Sign In to Enroll
                </Link>
                <Link href="/academy/register"
                  className="block w-full text-center py-2.5 rounded-2xl font-sans font-bold text-sm text-purple-700 bg-purple-50 border-2 border-purple-200">
                  ✨ Create Free Account
                </Link>
              </div>
            ) : !enrolled ? (
              <button onClick={enroll} disabled={enrolling}
                className="w-full py-3.5 rounded-2xl font-sans font-black text-sm text-amber-900 disabled:opacity-60"
                style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",boxShadow:"0 4px 16px rgba(255,215,0,0.4)"}}>
                {enrolling ? "Enrolling..." : "🎓 Enroll Free — Watch Now!"}
              </button>
            ) : quiz ? (
              (enrollment?.progress_percent || 0) >= 80 ? (
                <Link href={`/academy/quiz/${quiz.id}?course=${course.id}`}
                  className="block w-full text-center py-3.5 rounded-2xl font-sans font-black text-sm text-white"
                  style={{background:"linear-gradient(135deg,#4CAF50,#66BB6A)"}}>
                  🎯 Take Quiz & Get Certificate
                </Link>
              ) : (
                <p className="text-center font-sans text-xs text-gray-500">
                  Watch {80 - (enrollment?.progress_percent || 0)}% more videos to unlock quiz
                </p>
              )
            ) : null}

            <div className="mt-4 space-y-1.5 text-xs font-sans text-gray-500">
              <p>✅ Enroll once, watch anytime</p>
              <p>⭐ Earn {course.stars_reward} Karma Stars</p>
              <p>🏅 Certificate after passing quiz</p>
              <p>♾️ Lifetime free access</p>
            </div>
          </div>

          {/* Video playlist */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-sans font-black text-sm text-gray-800">📹 Course Videos</h3>
              <p className="font-sans text-[10px] text-gray-400">{videos.length} video{videos.length!==1?"s":""} · Enroll to unlock all</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {videos.map((v,i) => {
                const watchable = canWatch(v);
                const isActive = activeVideo?.id === v.id;
                return (
                  <button key={v.id}
                    onClick={() => watchable ? setActiveVideo(v) : enroll()}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b border-gray-50 transition-colors hover:bg-amber-50 ${isActive?"bg-amber-50":""}`}>
                    <span className="text-sm shrink-0 w-6">
                      {v.completed ? "✅" : isActive ? "▶️" : watchable ? `${i+1}.` : "🔒"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-sans text-xs font-bold truncate ${watchable?"text-gray-800":"text-gray-400"}`}>{v.title}</p>
                      <p className="font-sans text-[10px] text-gray-400">
                        {Math.round(v.duration_seconds/60)} min
                        {v.is_free_preview ? " · Free preview" : !enrolled ? " · Enroll to watch" : ""}
                      </p>
                    </div>
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
