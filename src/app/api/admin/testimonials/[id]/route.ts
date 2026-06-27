import { NextRequest, NextResponse } from "next/server";
import { updateTestimonialApproval, deleteTestimonial } from "@/lib/repo/testimonials";
import { requireAdmin } from "@/lib/require-admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  try {
    const body = await req.json();
    updateTestimonialApproval(id, !!body.approved);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/testimonials/:id] update error:", err);
    return NextResponse.json({ error: "अपडेट में त्रुटि" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  deleteTestimonial(id);
  return NextResponse.json({ success: true });
}
