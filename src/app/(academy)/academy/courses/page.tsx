import type { Metadata } from "next";
import Link from "next/link";
import { listCourses, listCategories } from "@/lib/academy/repo/courses";
import { ensureAcademyDb } from "@/lib/academy/schema";

export const metadata: Metadata = { title: "Courses | Jain Learning Academy", description: "Browse all Jain education courses" };
export const dynamic = "force-dynamic";

const DIFFICULTY_COLORS: Record<string,string> = { beginner:"#4CAF50", intermediate:"#FF9800", advanced:"#E91E63" };

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{category?:string;difficulty?:string;q?:string}> }) {
  await ensureAcademyDb();
  const sp = await searchParams;
  const [courses, categories] = await Promise.all([
    listCourses({ categorySlug: sp.category, difficulty: sp.difficulty, search: sp.q, limit: 24 }),
    listCategories(),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-20">
      <div className="mb-8">
        <h1 className="font-display-hi text-3xl font-black text-amber-900 mb-1">सभी पाठ्यक्रम</h1>
        <p className="font-sans text-sm text-gray-500">All Courses · {courses.length} available</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-8">
        <Link href="/academy/courses" className={`rounded-full px-4 py-1.5 font-sans text-xs font-black transition-all ${!sp.category?"text-amber-900 shadow-md":"bg-white text-gray-600"}`}
          style={!sp.category?{background:"linear-gradient(135deg,#FFD700,#FF9800)"}:{border:"1px solid #E0E0E0"}}>
          All
        </Link>
        {categories.map(c=>(
          <Link key={c.id} href={`/academy/courses?category=${c.slug}`}
            className={`rounded-full px-4 py-1.5 font-sans text-xs font-bold transition-all ${sp.category===c.slug?"text-amber-900":"bg-white text-gray-600"}`}
            style={sp.category===c.slug?{background:"linear-gradient(135deg,#FFD700,#FF9800)"}:{border:"1px solid #E0E0E0"}}>
            {c.icon} {c.name}
          </Link>
        ))}
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="font-display-hi text-xl font-black text-amber-900 mb-2">कोई पाठ्यक्रम नहीं</h2>
          <p className="font-sans text-sm text-gray-500">No courses found. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map(course=>(
            <Link key={course.id} href={`/academy/courses/${course.slug}`}
              className="rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group">
              <div className="relative h-44 flex items-center justify-center" style={{background:"linear-gradient(135deg,#FFF9C4,#FFF3E0)"}}>
                {course.thumbnail_url
                  ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover"/>
                  : <span className="text-7xl">📚</span>
                }
                <div className="absolute top-3 right-3 rounded-full px-2.5 py-1 font-sans text-[10px] font-black text-white"
                  style={{background:DIFFICULTY_COLORS[course.difficulty]||"#4CAF50"}}>{course.difficulty}</div>
                {course.is_free ? <div className="absolute top-3 left-3 rounded-full px-2.5 py-1 font-sans text-[10px] font-black bg-green-100 text-green-800">FREE</div> : null}
              </div>
              <div className="p-4">
                {course.category_name && <p className="font-hindi text-[10px] text-amber-500 mb-1">{course.category_name_hi||course.category_name}</p>}
                <h3 className="font-sans font-black text-sm text-gray-800 leading-tight mb-1 group-hover:text-amber-700">{course.title}</h3>
                {course.title_hi && <p className="font-display-hi text-xs text-amber-600 mb-2">{course.title_hi}</p>}
                {course.description && <p className="font-sans text-xs text-gray-400 mb-3 line-clamp-2">{course.description}</p>}
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-sans">
                  <span>📹 {course.total_videos} videos</span>
                  <span>⭐ {course.stars_reward} stars</span>
                  <span className="font-black text-amber-700">Learn →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}