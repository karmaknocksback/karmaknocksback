import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/academy/auth";
export async function GET(req: NextRequest) {
  const token = req.cookies.get("academy_token")?.value || req.headers.get("authorization")?.replace("Bearer ","");
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = await getUserFromToken(token);
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  return NextResponse.json({ user });
}