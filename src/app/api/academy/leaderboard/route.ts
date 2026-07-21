import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/academy/repo/dashboard";
export async function GET(req: NextRequest) {
  const period = (req.nextUrl.searchParams.get("period") || "all") as "all"|"monthly"|"weekly";
  const data = await getLeaderboard(period, 50);
  (()=>{const __r=NextResponse.json({ leaderboard: data, period });__r.headers.set("Cache-Control","public, s-maxage=3600, max-age=300, stale-while-revalidate=86400");return __r;})();
}
