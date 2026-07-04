import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { sendKarmaReport } from "@/lib/email";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { sessionId, email, name, archetypeHi } = await req.json();
  if (!email || !sessionId) return NextResponse.json({ error: "missing fields" }, { status: 400 });

  await sendKarmaReport(email, name || "साधक", archetypeHi || "Karma Mirror", sessionId);
  return NextResponse.json({ success: true });
}
