import { NextResponse } from "next/server";
import { getReportRow } from "@/lib/repo/km-assessment";
import type { KMReport } from "@/types";

export async function GET(_req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const row = await getReportRow(sessionId);
  if (!row) {
    return NextResponse.json({ success: false, error: "रिपोर्ट नहीं मिली" }, { status: 404 });
  }
  const report = JSON.parse(row.sections_json) as KMReport;
  return NextResponse.json({ success: true, report });
}
