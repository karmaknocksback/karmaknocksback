import { NextRequest, NextResponse } from "next/server";
import { getJapById, updateJap, deleteJap } from "@/lib/repo/japs";
import { requireAdmin } from "@/lib/require-admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const jap = await getJapById(id);
  if (!jap) return NextResponse.json({ error: "नहीं मिला" }, { status: 404 });
  return NextResponse.json({ jap });
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  try {
    const body = await req.json();
    const jap = updateJap(id, body);
    if (!jap) return NextResponse.json({ error: "नहीं मिला" }, { status: 404 });
    return NextResponse.json({ success: true, jap });
  } catch (err) {
    console.error("[api/admin/japs/:id] update error:", err);
    return NextResponse.json({ error: "अपडेट में त्रुटि" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  await deleteJap(id);
  return NextResponse.json({ success: true });
}
