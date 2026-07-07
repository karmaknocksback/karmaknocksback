import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/academy/auth";
import { getUserDashboard } from "@/lib/academy/repo/dashboard";
export async function GET(req: NextRequest) {
  const token = req.cookies.get("academy_token")?.value;
  const user = token ? await getUserFromToken(token) : null;
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const data = await getUserDashboard(user.id);
  return NextResponse.json(data);
}
