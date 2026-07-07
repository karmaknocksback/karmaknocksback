import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/academy/auth";
import { enrollUser, getCourseBySlug } from "@/lib/academy/repo/courses";

export async function POST(req: NextRequest, { params }: { params: Promise<{slug:string}> }) {
  const token = req.cookies.get("academy_token")?.value || req.headers.get("authorization")?.replace("Bearer ","");
  const user = token ? await getUserFromToken(token) : null;
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  await enrollUser(user.id, course.id);
  return NextResponse.json({ success: true });
}
