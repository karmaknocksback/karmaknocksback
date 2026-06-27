import { NextRequest, NextResponse } from "next/server";
import { listJaps, createJap } from "@/lib/repo/japs";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const japs = await listJaps();
  return NextResponse.json({ japs });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json();
    const jap = createJap(body);
    return NextResponse.json({ success: true, jap });
  } catch (err) {
    console.error("[api/admin/japs] create error:", err);
    return NextResponse.json({ error: "जाप बनाने में त्रुटि" }, { status: 400 });
  }
}
