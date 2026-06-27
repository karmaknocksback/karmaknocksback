import { NextRequest, NextResponse } from "next/server";
import { listPractices, createPractice } from "@/lib/repo/km-practices";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const practices = listPractices();
  return NextResponse.json({ practices });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json();
    const practice = createPractice(body);
    return NextResponse.json({ success: true, practice });
  } catch (err) {
    console.error("[api/admin/karma-mirror/practices] create error:", err);
    return NextResponse.json({ error: "अभ्यास बनाने में त्रुटि" }, { status: 400 });
  }
}
