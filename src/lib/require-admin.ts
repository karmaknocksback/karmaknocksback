import { NextResponse } from "next/server";
import { getCurrentAdmin, type AdminSessionPayload } from "@/lib/auth";

export async function requireAdmin(): Promise<
  { admin: AdminSessionPayload } | { error: NextResponse }
> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { admin };
}
