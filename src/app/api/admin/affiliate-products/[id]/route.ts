import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { updateProduct, deleteProduct } from "@/lib/repo/affiliate";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const body = await req.json();
  const product = await updateProduct(id, body);
  return NextResponse.json({ success: true, product });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const deleted = await deleteProduct(id);
  return NextResponse.json({ success: deleted });
}
