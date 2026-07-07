import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/academy/auth";
import { sendEmail } from "@/lib/email";
export async function POST(req: NextRequest) {
  try {
    const { name, email, password, confirmPassword, language, country, state, city } = await req.json();
    if (!name?.trim() || !email?.trim() || !password) return NextResponse.json({ error: "Name, email and password required" }, { status: 400 });
    if (password !== confirmPassword) return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    const { user, token, verifyToken } = await registerUser({ name: name.trim(), email: email.trim(), password, language, country, state, city });
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    const verifyUrl = `${siteUrl}/academy/verify?token=${verifyToken}`;
    sendEmail({ to: user.email, subject: "Verify your Academy email",
      html: `<div style="font-family:sans-serif;padding:24px"><h2 style="color:#B8860B">Welcome to Jain Learning Academy!</h2><p>Hello ${user.name}, please verify your email.</p><a href="${verifyUrl}" style="padding:12px 24px;background:#FFD700;color:#1a0800;font-weight:bold;border-radius:8px;text-decoration:none">Verify Email</a></div>`
    }).catch(() => {});
    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Registration failed" }, { status: 400 });
  }
}