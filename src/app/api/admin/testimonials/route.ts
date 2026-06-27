import { NextRequest, NextResponse } from "next/server";
import { listAllTestimonials, createTestimonial } from "@/lib/repo/testimonials";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const testimonials = await listAllTestimonials();
  return NextResponse.json({ testimonials });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json();
    const testimonial = await createTestimonial(body);
    return NextResponse.json({ success: true, testimonial });
  } catch (err) {
    console.error("[api/admin/testimonials] create error:", err);
    return NextResponse.json({ error: "बनाने में त्रुटि" }, { status: 400 });
  }
}
