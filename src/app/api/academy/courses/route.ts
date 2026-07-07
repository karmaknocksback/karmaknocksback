import { NextRequest, NextResponse } from "next/server";
import { listCourses, listCategories } from "@/lib/academy/repo/courses";
export async function GET(req: NextRequest) {
  const s = req.nextUrl.searchParams;
  const courses = await listCourses({ categorySlug: s.get("category")||undefined, difficulty: s.get("difficulty")||undefined, featured: s.get("featured")==="1", search: s.get("q")||undefined, limit: Number(s.get("limit")||20), offset: Number(s.get("offset")||0) });
  const categories = await listCategories();
  return NextResponse.json({ courses, categories });
}
