import { NextRequest, NextResponse } from "next/server";
import { getPracticeById, updatePractice, deletePractice } from "@/lib/repo/km-practices";
import { getJapById } from "@/lib/repo/japs";
import { requireAdmin } from "@/lib/require-admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const practice = await getPracticeById(id);
  if (!practice) return NextResponse.json({ error: "नहीं मिला" }, { status: 404 });

  const linkedJap = practice.linkedJapId ? await getJapById(practice.linkedJapId) : null;
  const linkedJapTitleHi = linkedJap?.titleHi;
  return NextResponse.json({ practice: { ...practice, linkedJapTitleHi } });
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  try {
    const body = await req.json();
    const practice = updatePractice(id, body);
    if (!practice) return NextResponse.json({ error: "नहीं मिला" }, { status: 404 });
    return NextResponse.json({ success: true, practice });
  } catch (err) {
    console.error("[api/admin/karma-mirror/practices/:id] update error:", err);
    return NextResponse.json({ error: "अपडेट में त्रुटि" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  deletePractice(id);
  return NextResponse.json({ success: true });
}
