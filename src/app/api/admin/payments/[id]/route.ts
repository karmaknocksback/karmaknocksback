import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPaymentById, markPaymentPaid, markPaymentCancelled, deletePayment } from "@/lib/repo/payments";
import { requireAdmin } from "@/lib/require-admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const payment = await getPaymentById(id);
  if (!payment) return NextResponse.json({ error: "नहीं मिला" }, { status: 404 });
  return NextResponse.json({ payment });
}

const updateSchema = z.object({
  action: z.enum(["mark_paid", "mark_cancelled"]),
  utrReference: z.string().optional(),
  adminNotes: z.string().optional(),
});

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const existing = await getPaymentById(id);
  if (!existing) return NextResponse.json({ error: "नहीं मिला" }, { status: 404 });

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const payment =
      data.action === "mark_paid"
        ? markPaymentPaid(id, data.utrReference, data.adminNotes)
        : markPaymentCancelled(id, data.adminNotes);

    return NextResponse.json({ success: true, payment });
  } catch (err) {
    console.error("[api/admin/payments/:id] update error:", err);
    return NextResponse.json({ error: "अपडेट में त्रुटि" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const existing = await getPaymentById(id);
  if (!existing) return NextResponse.json({ error: "नहीं मिला" }, { status: 404 });

  const deleted = await deletePayment(id);
  return NextResponse.json({ success: deleted });
}
