import { NextRequest, NextResponse } from "next/server";
import { getArticles } from "@/lib/data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const articles = await getArticles({
    q: searchParams.get("q") || undefined,
    category: searchParams.get("category") || undefined,
  });
  (()=>{const __r=NextResponse.json({ articles });__r.headers.set("Cache-Control","public, s-maxage=3600, max-age=300, stale-while-revalidate=86400");return __r;})();
}
