import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken, awardStars } from "@/lib/academy/auth";
import { updateVideoProgress } from "@/lib/academy/repo/courses";
import { dbGet } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{id:string}> }) {
  const token = req.cookies.get("academy_token")?.value;
  const user = token ? await getUserFromToken(token) : null;
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { id } = await params;
  const { watchPercent, lastPosition, courseId } = await req.json();
  await updateVideoProgress(user.id, Number(id), courseId, watchPercent, lastPosition);
  // Award stars on first completion
  if (watchPercent >= 80) {
    const video = await dbGet<{stars_on_complete:number}>( "SELECT stars_on_complete FROM academy_videos WHERE id=?", [id]);
    if (video) await awardStars(user.id, video.stars_on_complete, "Video completed", "video", Number(id), "video");
  }
  return NextResponse.json({ success: true });
}
