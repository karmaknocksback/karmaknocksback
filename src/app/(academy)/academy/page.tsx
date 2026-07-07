import type { Metadata } from "next";
import Link from "next/link";
import { listCourses, listCategories } from "@/lib/academy/repo/courses";
import { ensureAcademyDb } from "@/lib/academy/schema";
import { dbGet } from "@/lib/db";

export const metadata: Metadata = {
  title: "Jain Learning Academy | KarmaKnocksBack",
  description: "Learn Jain philosophy through videos, quizzes, and earn certificates. Free courses on Navkar Mantra, Tirthankaras, Karma, and more.",
};

export const dynamic = "force-dynamic";

const DIFFICULTY_COLORS: Record<string,string> = {
  beginner: "#4CAF50", intermediate: "#FF9800", advanced: "#E91E63"
};

export default async function AcademyLandingPage() {
  await ensureAcademyDb();

  const [featured, categories, stats] = await Promise.all([
    listCourses({ featured: true, limit: 6 }),
    listCategories(),
    Promise.all([
      dbGet<{cnt:number}>("SELECT COUNT(*) as cnt FROM academy_users"),
      dbGet<{cnt:number}>("SELECT COUNT(*) as cnt FROM academy_courses WHERE is_published=1"),
      dbGet<{cnt:number}>("SELECT COUNT(*) as cnt FROM academy_certificates"),
    ])
  ]);

  const [userCount, courseCount, certCount] = stats;

  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="text-center py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {["🪷","📿","⭐","🙏","📖","✨"].map((e,i)=>(
            <div key={i} className="absolute text-3xl opacity-10"
              style={{left:`${10+i*15}%`,top:`${15+i*10}%`,animation:`float ${3+i}s ease-in-out infinite`,animationDelay:`${i*0.5}s`}}>
              {e}
            </div>
          ))}
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 font-sans text-xs font-black"
            style={{background:"#FFD700",color:"#1a0800"}}>
            🎓 Free Jain Education Platform
          </div>
          <h1 className="font-display-hi mb-4" style={{fontSize:"clamp(2rem,5vw,3.5rem)",color:"#4E342E",textShadow:"2px 2px 0 rgba(255,215,0,0.3)"}}>
            जैन शिक्षा केन्द्र
          </h1>
          <p className="font-sans text-xl font-black text-amber-800 mb-3">Jain Learning Academy</p>
          <p className="font-hindi text-base text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed">
            Watch videos · Take quizzes · Earn stars · Get certified<br/>
            Learn Navkar Mantra, 24 Tirthankaras, Karma Siddhant, and more
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/academy/courses"
              className="px-8 py-3 rounded-2xl font-sans font-black text-sm"
              style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",color:"#1a0800",boxShadow:"0 6px 20px rgba(255,215,0,0.5)"}}>
              📚 Browse Courses
            </Link>
            <Link href="/academy/register"
              className="px-8 py-3 rounded-2xl font-sans font-black text-sm bg-white border-2 border-amber-400 text-amber-800">
              🆓 Join Free
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-4 mb-12">
        <div className="grid grid-cols-3 gap-4">
          {[
            {emoji:"👥",val:userCount?.cnt||0,label:"Learners",hi:"अध्येता"},
            {emoji:"📚",val:courseCount?.cnt||0,label:"Courses",hi:"पाठ्यक्रम"},
            {emoji:"🏅",val:certCount?.cnt||0,label:"Certificates",hi:"प्रमाणपत्र"},
          ].map(s=>(
            <div key={s.label} className="rounded-2xl p-4 text-center bg-white shadow-sm" style={{border:"2px solid rgba(255,215,0,0.3)"}}>
              <div className="text-3xl mb-1">{s.emoji}</div>
              <div className="font-display text-2xl font-black text-amber-800">{s.val}+</div>
              <div className="font-sans text-xs text-gray-500">{s.label}</div>
              <div className="font-hindi text-[10px] text-amber-600">{s.hi}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 mb-14">
        <h2 className="font-display-hi text-2xl font-black text-center text-amber-900 mb-8">कैसे काम करता है?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {step:"1",emoji:"📹",title:"Watch Videos",hi:"वीडियो देखें",desc:"Curated Jain education videos"},
            {step:"2",emoji:"🧠",title:"Take Quiz",hi:"क्विज़ दें",desc:"Test your knowledge"},
            {step:"3",emoji:"⭐",title:"Earn Stars",hi:"तारे कमाएं",desc:"Gamified learning rewards"},
            {step:"4",emoji:"🏅",title:"Get Certificate",hi:"प्रमाणपत्र पाएं",desc:"Official achievement proof"},
          ].map(s=>(
            <div key={s.step} className="rounded-2xl p-4 text-center bg-white shadow-sm" style={{border:"2px solid rgba(255,152,0,0.2)"}}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-sans font-black text-sm mx-auto mb-2"
                style={{background:"#FFD700",color:"#1a0800"}}>{s.step}</div>
              <div className="text-3xl mb-2">{s.emoji}</div>
              <p className="font-sans text-xs font-black text-gray-800">{s.title}</p>
              <p className="font-hindi text-[10px] text-amber-600">{s.hi}</p>
              <p className="font-sans text-[10px] text-gray-400 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 mb-14">
          <h2 className="font-display-hi text-2xl font-black text-amber-900 mb-6">पाठ्यक्रम श्रेणियाँ</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map(cat=>(
              <Link key={cat.id} href={`/academy/courses?category=${cat.slug}`}
                className="rounded-2xl p-4 text-center bg-white hover:shadow-md transition-all hover:scale-[1.02]"
                style={{border:`2px solid ${cat.color||"#FFD700"}30`}}>
                <div className="text-3xl mb-2">{cat.icon||"📚"}</div>
                <p className="font-sans text-xs font-black text-gray-800">{cat.name}</p>
                {cat.name_hi&&<p className="font-hindi text-[10px] text-amber-600">{cat.name_hi}</p>}
                <p className="font-sans text-[10px] text-gray-400 mt-1">{cat.course_count} courses</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured courses */}
      {featured.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display-hi text-2xl font-black text-amber-900">🌟 Featured Courses</h2>
            <Link href="/academy/courses" className="font-sans text-xs font-bold text-amber-700 hover:text-amber-900">View All →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map(course=>(
              <Link key={course.id} href={`/academy/courses/${course.slug}`}
                className="rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group">
                <div className="relative h-40 bg-gradient-to-br from-amber-100 to-yellow-50 flex items-center justify-center">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover"/>
                  ) : (
                    <div className="text-6xl">📚</div>
                  )}
                  <div className="absolute top-2 right-2 rounded-full px-2 py-0.5 font-sans text-[10px] font-black text-white"
                    style={{background:DIFFICULTY_COLORS[course.difficulty]||"#4CAF50"}}>
                    {course.difficulty}
                  </div>
                  {course.is_free ? (
                    <div className="absolute top-2 left-2 rounded-full px-2 py-0.5 font-sans text-[10px] font-black"
                      style={{background:"#E8F5E9",color:"#1B5E20"}}>FREE</div>
                  ) : null}
                </div>
                <div className="p-4">
                  <p className="font-hindi text-[10px] text-amber-500 mb-0.5">{course.category_name_hi||course.category_name||""}</p>
                  <h3 className="font-sans font-black text-sm text-gray-800 leading-tight mb-2 group-hover:text-amber-800">
                    {course.title}
                  </h3>
                  {course.title_hi&&<p className="font-display-hi text-xs text-amber-700 mb-2">{course.title_hi}</p>}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-sans text-[10px] text-gray-400">
                      <span>📹 {course.total_videos} videos</span>
                      <span>⭐ {course.stars_reward} stars</span>
                    </div>
                    <span className="font-sans text-xs font-bold text-amber-700">Learn →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 text-center">
        <div className="rounded-3xl p-10" style={{background:"linear-gradient(135deg,#FFFDE7,#FFF9C4)",border:"3px solid #FFD700",boxShadow:"0 16px 48px rgba(255,215,0,0.25)"}}>
          <div className="text-5xl mb-4">🙏</div>
          <h2 className="font-display-hi text-2xl font-black text-amber-900 mb-2">आज ही शुरू करें!</h2>
          <p className="font-sans text-sm text-amber-700 mb-6">Free registration · No credit card · Learn at your own pace</p>
          <Link href="/academy/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-sans font-black text-sm"
            style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",color:"#1a0800",boxShadow:"0 8px 24px rgba(255,215,0,0.5)"}}>
            🎓 Start Learning Free
          </Link>
        </div>
      </section>

      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
    </div>
  );
}
