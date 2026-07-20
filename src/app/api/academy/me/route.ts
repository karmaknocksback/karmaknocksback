import { NextRequest, NextResponse } from "next/server";
import { dbGet } from "@/lib/db";
import { verifyJWT } from "@/lib/academy/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("academy_token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  
  try {
    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    const userId = (payload as {userId?: number; id?: number}).userId || (payload as {userId?: number; id?: number}).id;
    if (!userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    
    const user = await dbGet<{ id: number; name: string; email: string }>(
      "SELECT id, name, email FROM academy_users WHERE id = ?",
      [userId]
    );
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    
    return NextResponse.json({ id: user.id, name: user.name, email: user.email, avatar: "🧑" });
  } catch {
    return NextResponse.json({ error: "Token error" }, { status: 401 });
  }
}
