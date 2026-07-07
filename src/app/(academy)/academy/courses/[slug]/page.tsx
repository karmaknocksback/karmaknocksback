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
  const token = typeof window !== "undefined" ? localStorage.getItem("academy_token") : null;

  useEffect(() => {
    fetch(`/api/academy/courses/${slug}`, { headers: token?{Authorization:`Bearer ${token}`}:{} })
      .then(r=>r.json())
      .then(d => { setData(d); setEnrolled(!!d.enrollment); if(d.videos?.[0]) setActiveVideo(d.videos[0]); })
      .finally(() => setLoading(false));
  }, [slug, token]);

  const enroll = useCallback(async () => {
    if (!token) { router.push("/academy/login"); return; }
    setEnrolling(true);
    await fetch(`/api/academy/courses/${slug}/enroll`, { method:"POST", headers:{Authorization:`Bearer ${token}`} });
    setEnrolled(true); setEnrolling(false);
  }, [slug, token, router]);

  function getYTId(url: string): string {
    const m = url.match(/(?:v=|youtu\.be\/)([^&?]+)/);
    return m?.[1] || "";
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-5xl animate-bounce">📚</div></div>;
  if (!data?.course) return <div className="text-center py-20"><p className="font-sans text-gray-500">Course not found</p></div>;

  const { course, videos, quiz, enrollment } = data;
  const completedVideos = videos.filter(v=>v.completed).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-sans text-xs text-gray-400 mb-4">
        <Link href="/academy">Academy</Link><span>/</span>
        <Link href="/academy/courses">Courses</Link><span>/</span>
        <span className="text-amber-700 font-bold">{course.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video player area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Player */}
          <div className="rounded-2xl overflow-hidden bg-black" style={{aspectRatio:"16/9"}}>
            {activeVideo ? (
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.youtube_id||getYTId(activeVideo.youtube_url)}?rel=0&modestbranding=1`}
                className="w-full h-full" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen/>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white"><div className="text-5xl mb-2">▶️</div><p className="font-sans text-sm">Select a video to watch</p></div>
              </div>
            )}
          </div>

          {activeVideo && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="font-sans font-black text-base text-gray-800 mb-1">{activeVideo.title}</h2>
              <div className="flex items-center gap-3 text-xs text-gray-400 font-sans">
                <span>⏱️ {Math.round(activeVideo.duration_seconds/60)} min</span>
                {activeVideo.completed ? <span className="text-green-600 font-bold">✅ Completed</span> : activeVideo.watch_percent ? <span>{activeVideo.watch_percent}% watched</span> : null}
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
          {/* Enroll card */}
          <div className="bg-white rounded-2xl p-5 shadow-md sticky top-20" style={{border:"2px solid rgba(255,215,0,0.4)"}}>
            {enrollment ? (
              <div className="mb-4">
                <div className="flex justify-between text-xs font-sans mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-bold text-amber-700">{enrollment.progress_percent}%</span>
                </div>
                <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full" style={{width:`${enrollment.progress_percent}%`,background:"linear-gradient(90deg,#FFD700,#4CAF50)"}}/>
                </div>
                <p className="font-sans text-xs text-gray-400 mt-1">{completedVideos}/{videos.length} videos completed</p>
              </div>
            ) : null}

            {!enrolled ? (
              <button onClick={enroll} disabled={enrolling}
                className="w-full py-3.5 rounded-2xl font-sans font-black text-sm text-amber-900 disabled:opacity-60"
                style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",boxShadow:"0 4px 16px rgba(255,215,0,0.4)"}}>
                {enrolling ? "Enrolling..." : "🎓 Enroll Free"}
              </button>
            ) : quiz && enrollment ? (
              enrollment.progress_percent >= 80 ? (
                <Link href={`/academy/quiz/${quiz.id}?course=${course.id}`}
                  className="block w-full text-center py-3.5 rounded-2xl font-sans font-black text-sm text-white"
                  style={{background:"linear-gradient(135deg,#4CAF50,#66BB6A)"}}>
                  🎯 Take Quiz & Get Certificate
                </Link>
              ) : (
                <p className="text-center font-sans text-xs text-gray-500">Watch {80 - enrollment.progress_percent}% more to unlock quiz</p>
              )
            ) : null}

            <div className="mt-4 space-y-2 text-xs font-sans text-gray-500">
              <p>✅ Self-paced learning</p>
              <p>⭐ Earn {course.stars_reward} stars on completion</p>
              <p>🏅 Certificate on passing quiz</p>
              <p>♾️ Lifetime access</p>
            </div>
          </div>

          {/* Video playlist */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-sans font-black text-sm text-gray-800">📹 Course Content</h3>
              <p className="font-sans text-[10px] text-gray-400">{videos.length} videos</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {videos.map((v,i)=>(
                <button key={v.id} onClick={()=>enrolled||v.is_free_preview?setActiveVideo(v):enroll()}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b border-gray-50 transition-colors hover:bg-amber-50 ${activeVideo?.id===v.id?"bg-amber-50":""}`}>
                  <span className="text-sm shrink-0 w-6">
                    {v.completed ? "✅" : activeVideo?.id===v.id ? "▶️" : `${i+1}.`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-sans text-xs font-bold truncate ${enrolled||v.is_free_preview?"text-gray-800":"text-gray-400"}`}>{v.title}</p>
                    <p className="font-sans text-[10px] text-gray-400">{Math.round(v.duration_seconds/60)} min {v.is_free_preview&&!enrolled?"· Free preview":""}</p>
                  </div>
                  {!enrolled && !v.is_free_preview && <span className="text-gray-300 text-xs">🔒</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
