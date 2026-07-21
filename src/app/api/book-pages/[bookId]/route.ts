import { NextRequest, NextResponse } from "next/server";
import { listBookPages } from "@/lib/repo/book-pages";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await params;
  try {
    const pages = await listBookPages(bookId);
    const map: Record<number, { imageUrl: string | null; audioUrl: string | null; caption: string | null }> = {};
    pages.forEach(p => { map[p.pageNumber] = { imageUrl: p.imageUrl, audioUrl: p.audioUrl, caption: p.caption }; });
    (()=>{const __r=NextResponse.json({ pages: map });__r.headers.set("Cache-Control","public, s-maxage=3600, max-age=300, stale-while-revalidate=86400");return __r;})();
  } catch {
    return NextResponse.json({ pages: {} });
  }
}
