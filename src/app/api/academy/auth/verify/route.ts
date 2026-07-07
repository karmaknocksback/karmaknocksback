import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/academy/auth";
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    const userId = await verifyEmailToken(token, "verify");
    if (!userId) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    return NextResponse.json({ success: true, message: "Email verified! +20 stars awarded" });
  } catch { return NextResponse.json({ error: "Verification failed" }, { status: 400 }); }
}