import { NextRequest, NextResponse } from "next/server";
import { listAllArticles, createArticle, listDistinctCategories } from "@/lib/repo/articles";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const articles = listAllArticles();
  const categories = await listDistinctCategories();
  return NextResponse.json({ articles, categories });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json();
    const article = createArticle(body);
    return NextResponse.json({ success: true, article });
  } catch (err) {
    console.error("[api/admin/articles] create error:", err);
    return NextResponse.json({ error: "लेख बनाने में त्रुटि" }, { status: 400 });
  }
}
