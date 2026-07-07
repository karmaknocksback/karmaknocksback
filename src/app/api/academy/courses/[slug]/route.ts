import { NextRequest, NextResponse } from "next/server";
import { getCourseBySlug, getCourseVideos, getEnrollment } from "@/lib/academy/repo/courses";
import { getQuizForCourse } from "@/lib/academy/repo/quiz";
import { getUserFromToken } from "@/lib/academy/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{slug:string}> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  const token = req.cookies.get("academy_token")?.value;
  const user = token ? await getUserFromToken(token) : null;
  const [videos, quiz, enrollment] = await Promise.all([
    getCourseVideos(course.id, user?.id),
    getQuizForCourse(course.id),
    user ? getEnrollment(user.id, course.id) : null,
  ]);
  return NextResponse.json({ course, videos, quiz, enrollment });
}
