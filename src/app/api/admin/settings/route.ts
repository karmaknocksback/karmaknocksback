import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/repo/settings";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  return NextResponse.json({ settings: getSettings() });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json();
    const settings = await updateSettings(body);
    return NextResponse.json({ success: true, settings });
  } catch (err) {
    console.error("[api/admin/settings] update error:", err);
    return NextResponse.json({ error: "अपडेट में त्रुटि" }, { status: 400 });
  }
}
