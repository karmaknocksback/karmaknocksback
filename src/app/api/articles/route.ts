import { NextRequest, NextResponse } from "next/server";
import { getArticles } from "@/lib/data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const articles = await getArticles({
    q: searchParams.get("q") || undefined,
    category: searchParams.get("category") || undefined,
  });
  return NextResponse.json({ articles });
}
