import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findAdminByEmail } from "@/lib/repo/admin";
import { verifyPassword, signSession, setSessionCookie } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = schema.parse(body);

    const user = await findAdminByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "अमान्य ईमेल या पासवर्ड" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "अमान्य ईमेल या पासवर्ड" }, { status: 401 });
    }

    const token = signSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "superadmin" | "editor",
    });
    await setSessionCookie(token);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/login] error:", err);
    return NextResponse.json({ error: "लॉगिन विफल" }, { status: 400 });
  }
}
