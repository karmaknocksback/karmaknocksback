import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/academy/auth";
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    const { user, token } = await loginUser(email, password);
    const res = NextResponse.json({ success: true, user, token });
    res.cookies.set("academy_token", token, { httpOnly: true, secure: process.env.NODE_ENV==="production", sameSite: "lax", maxAge: 7*24*3600, path: "/" });
    return res;
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Login failed" }, { status: 401 });
  }
}