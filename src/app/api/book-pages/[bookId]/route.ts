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
    return NextResponse.json({ pages: map });
  } catch {
    return NextResponse.json({ pages: {} });
  }
}
