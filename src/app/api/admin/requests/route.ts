import { NextResponse } from "next/server";
import { listCustomJapRequests, listServiceRequests, listContactMessages } from "@/lib/repo/requests";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  return NextResponse.json({
    customJapRequests: listCustomJapRequests(),
    serviceRequests: listServiceRequests(),
    contactMessages: listContactMessages(),
  });
}
