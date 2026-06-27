import { NextResponse } from "next/server";
import { getSession } from "@/lib/repo/km-assessment";

export async function GET(_req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const session = await getSession(sessionId);
  if (!session) {
    return NextResponse.json({ exists: false }, { status: 404 });
  }
  return NextResponse.json({ exists: true, status: session.status, id: session.id });
}
