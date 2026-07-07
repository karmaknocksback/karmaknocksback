import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/academy/repo/dashboard";
export async function GET(req: NextRequest) {
  const period = (req.nextUrl.searchParams.get("period") || "all") as "all"|"monthly"|"weekly";
  const data = await getLeaderboard(period, 50);
  return NextResponse.json({ leaderboard: data, period });
}
