import { NextRequest, NextResponse } from "next/server";
import { getItemById, updateItem, deleteItem } from "@/lib/repo/jap-collections";
import { requireAdmin } from "@/lib/require-admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const item = await getItemById(id);
  if (!item) return NextResponse.json({ error: "नहीं मिला" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const item = await getItemById(id);
  if (!item) return NextResponse.json({ error: "नहीं मिला" }, { status: 404 });

  const deleted = await deleteItem(id);
  return NextResponse.json({ success: deleted });
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  try {
    const body = await req.json();
    const item = await updateItem(id, body);
    if (!item) return NextResponse.json({ error: "नहीं मिला" }, { status: 404 });
    return NextResponse.json({ success: true, item });
  } catch (err) {
    console.error("[api/admin/jap-collection-items/:id] update error:", err);
    return NextResponse.json({ error: "अपडेट में त्रुटि" }, { status: 400 });
  }
}
