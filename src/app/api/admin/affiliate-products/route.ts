import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { listAllProducts, createProduct } from "@/lib/repo/affiliate";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const products = await listAllProducts();
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  try {
    const body = await req.json();
    const product = await createProduct(body);
    return NextResponse.json({ success: true, product });
  } catch (err) {
    console.error("[api/admin/affiliate-products] create error:", err);
    return NextResponse.json({ error: "त्रुटि हुई" }, { status: 400 });
  }
}
