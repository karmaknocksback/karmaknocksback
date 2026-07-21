import { NextRequest, NextResponse } from "next/server";
import { getJaps } from "@/lib/data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const japs = await getJaps({
    q: searchParams.get("q") || undefined,
    category: searchParams.get("category") || undefined,
    planet: searchParams.get("planet") || undefined,
    duration: searchParams.get("duration") || undefined,
  });
  (()=>{const __r=NextResponse.json({ japs });__r.headers.set("Cache-Control","public, s-maxage=3600, max-age=300, stale-while-revalidate=86400");return __r;})();
}
