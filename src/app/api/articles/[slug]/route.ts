import { NextRequest, NextResponse } from "next/server";
import { getArticleBySlug } from "@/lib/data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) {
    (()=>{const __r=NextResponse.json({ error: "Article not found" }, { status: 404 });__r.headers.set("Cache-Control","public, s-maxage=3600, max-age=300, stale-while-revalidate=86400");return __r;})();
  }
  return NextResponse.json({ article });
}
