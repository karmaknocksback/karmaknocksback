import { NextRequest, NextResponse } from "next/server";
import { getJapBySlug } from "@/lib/data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const jap = await getJapBySlug(slug);
  if (!jap) {
    return NextResponse.json({ error: "Jap not found" }, { status: 404 });
  }
  return NextResponse.json({ jap });
}
