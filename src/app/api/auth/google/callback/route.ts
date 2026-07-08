import { NextRequest, NextResponse } from "next/server";
import { dbGet, dbRun } from "@/lib/db";
import { ensureAcademyDb } from "@/lib/academy/schema";
import { createJWT, awardStars } from "@/lib/academy/auth";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const code    = req.nextUrl.searchParams.get("code");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/academy/login?error=no_code`);
  }

  try {
    // Exchange code for Google access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id:     process.env.GOOGLE_CLIENT_ID     || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri:  `${siteUrl}/api/auth/google/callback`,
        grant_type:    "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      return NextResponse.redirect(`${siteUrl}/academy/login?error=token_failed`);
    }

    // Get user profile from Google
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const gUser = await profileRes.json();

    if (!gUser.email) {
      return NextResponse.redirect(`${siteUrl}/academy/login?error=no_email`);
    }

    await ensureAcademyDb();

    // Find or create user in DB
    let user = await dbGet<{ id: number; name: string; email: string }>(
      "SELECT id, name, email FROM academy_users WHERE email = ?",
      [gUser.email.toLowerCase()]
    );

    if (!user) {
      const refCode = crypto.randomBytes(4).toString("hex").toUpperCase();
      const { lastInsertRowid } = await dbRun(
        `INSERT INTO academy_users
           (name, email, password_hash, google_id, email_verified, referral_code)
         VALUES (?, ?, 'google_oauth', ?, 1, ?)`,
        [gUser.name, gUser.email.toLowerCase(), gUser.sub, refCode]
      );
      user = await dbGet<{ id: number; name: string; email: string }>(
        "SELECT id, name, email FROM academy_users WHERE id = ?",
        [lastInsertRowid]
      );
      if (user) await awardStars(user.id, 30, "Google sign-up bonus", "google_oauth");
    } else {
      // Ensure google_id & email_verified are set
      await dbRun(
        "UPDATE academy_users SET google_id = ?, email_verified = 1 WHERE id = ?",
        [gUser.sub, user.id]
      );
    }

    if (!user) {
      return NextResponse.redirect(`${siteUrl}/academy/login?error=user_failed`);
    }

    const jwt = await createJWT(user.id);

    const res = NextResponse.redirect(`${siteUrl}/academy/dashboard`);
    res.cookies.set("academy_token", jwt, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   7 * 24 * 3600,
      path:     "/",
    });
    return res;

  } catch (err) {
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(`${siteUrl}/academy/login?error=oauth_failed`);
  }
}
