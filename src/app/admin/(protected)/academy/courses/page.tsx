import { dbAll } from "@/lib/db";
import { ensureAcademyDb } from "@/lib/academy/schema";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  await ensureAcademyDb();
  const courses = await dbAll<{id:number;title:string;title_hi:string|null;slug:string;difficulty:string;total_videos:number;is_published:number;is_featured:number;stars_reward:number;created_at:string}>(
    "SELECT id,title,title_hi,slug,difficulty,total_videos,is_published,is_featured,stars_reward,created_at FROM academy_courses ORDER BY created_at DESC"
  );
  const [userCount, enrollCount] = await Promise.all([
    dbAll<{cnt:number}>("SELECT COUNT(*) as cnt FROM academy_users"),
    dbAll<{cnt:number}>("SELECT COUNT(*) as cnt FROM academy_enrollments"),
  ]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-sans font-black text-2xl text-gray-800">🎓 Academy Management</h1>
          <p className="font-sans text-sm text-gray-400 mt-1">Manage courses, videos, quizzes</p>
        </div>
        <Link href="/admin/academy/courses/new"
          className="px-5 py-2.5 rounded-xl font-sans font-black text-sm text-white"
          style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",color:"#1a0800"}}>
          + New Course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {l:"Total Users",v:userCount[0]?.cnt||0,e:"👥"},
          {l:"Enrollments",v:enrollCount[0]?.cnt||0,e:"📚"},
          {l:"Courses",v:courses.length,e:"🎓"},
          {l:"Published",v:courses.filter(c=>c.is_published).length,e:"✅"},
        ].map(s=>(
          <div key={s.l} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl mb-1">{s.e}</div>
            <div className="font-display text-2xl font-black text-gray-800">{s.v}</div>
            <div className="font-sans text-xs text-gray-400">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Courses table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-amber-50 border-b border-amber-100">
            <tr>
              {["Title","Difficulty","Videos","Stars","Status","Actions"].map(h=>(
                <th key={h} className="px-4 py-3 text-left font-sans font-black text-xs text-amber-800">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 font-sans text-sm">No courses yet. Create your first course!</td></tr>
            ) : courses.map(c=>(
              <tr key={c.id} className="border-b border-gray-50 hover:bg-amber-50/30">
                <td className="px-4 py-3">
                  <p className="font-sans font-bold text-gray-800 text-xs">{c.title}</p>
                  {c.title_hi && <p className="font-hindi text-[10px] text-amber-600">{c.title_hi}</p>}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full px-2 py-0.5 font-sans text-[10px] font-bold"
                    style={{background:c.difficulty==="beginner"?"#E8F5E9":c.difficulty==="intermediate"?"#FFF3E0":"#FCE4EC",
                      color:c.difficulty==="beginner"?"#1B5E20":c.difficulty==="intermediate"?"#E65100":"#880E4F"}}>
                    {c.difficulty}
                  </span>
                </td>
                <td className="px-4 py-3 font-sans text-xs text-gray-600">{c.total_videos}</td>
                <td className="px-4 py-3 font-sans text-xs text-amber-700 font-bold">⭐{c.stars_reward}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 font-sans text-[10px] font-bold ${c.is_published?"bg-green-100 text-green-700":"bg-gray-100 text-gray-500"}`}>
                    {c.is_published?"Published":"Draft"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/academy/courses/${c.slug}`} className="font-sans text-[10px] text-blue-600 hover:underline mr-3">View</Link>
                  <Link href={`/admin/academy/courses/${c.id}`} className="font-sans text-[10px] text-amber-700 hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
