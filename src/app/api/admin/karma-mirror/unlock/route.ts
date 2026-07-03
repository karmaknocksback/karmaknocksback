import { NextRequest, NextResponse } from "next/server";
import { unlockReport } from "@/lib/repo/km-assessment";
import { requireAdmin } from "@/lib/require-admin";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { sessionId } = await req.json();
  if (!sessionId) return NextResponse.json({ error: "missing sessionId" }, { status: 400 });

  await unlockReport(sessionId);
  return NextResponse.json({ success: true });
}
