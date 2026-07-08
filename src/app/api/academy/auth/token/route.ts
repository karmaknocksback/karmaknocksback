import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/academy/auth";

// Returns the token from cookie so client can save to localStorage
// This bridges the gap between httpOnly cookie and client-side localStorage
export async function GET(req: NextRequest) {
  const token = req.cookies.get("academy_token")?.value;
  if (!token) return NextResponse.json({ token: null });
  try {
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ token: null });
    return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch {
    return NextResponse.json({ token: null });
  }
}
