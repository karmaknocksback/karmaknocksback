import { NextRequest, NextResponse } from "next/server";
import { getProductById, incrementClicks } from "@/lib/repo/affiliate";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Track the click asynchronously (don't block redirect)
  incrementClicks(id).catch(() => {});

  // Redirect to affiliate URL
  return NextResponse.redirect(product.affiliateUrl, { status: 302 });
}
