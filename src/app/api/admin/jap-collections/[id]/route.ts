import { NextRequest, NextResponse } from "next/server";
import { getCollectionById, deleteCollection, listItemsByCollection } from "@/lib/repo/jap-collections";
import { requireAdmin } from "@/lib/require-admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const collection = await getCollectionById(id);
  if (!collection) return NextResponse.json({ error: "नहीं मिला" }, { status: 404 });
  return NextResponse.json({ collection, items: listItemsByCollection(id) });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const collection = await getCollectionById(id);
  if (!collection) return NextResponse.json({ error: "नहीं मिला" }, { status: 404 });

  const deleted = await deleteCollection(id);
  return NextResponse.json({ success: deleted });
}
