import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { listAllBookPages, upsertBookPage, deleteBookPage } from "@/lib/repo/book-pages";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const pages = await listAllBookPages();
  return NextResponse.json({ pages });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const body = await req.json();
  const page = await upsertBookPage(body);
  return NextResponse.json({ success: true, page });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { bookId, pageNumber } = await req.json();
  await deleteBookPage(bookId, pageNumber);
  return NextResponse.json({ success: true });
}
