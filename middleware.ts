import { NextResponse, type NextRequest } from "next/server";

/* ══════════════════════════════════════════════════════════════
   UNIFIED MIDDLEWARE — Admin + User Auth Protection
══════════════════════════════════════════════════════════════ */

const ADMIN_COOKIE = "kkb_admin_session";

// Routes requiring academy login (cookie: academy_token)
const USER_PROTECTED_EXACT = ["/sanyam/profile", "/dashboard"];
const USER_PROTECTED_PREFIX = [
  "/games/",                     // /games/word-builder etc (not /games hub)
  "/karma-mirror/assessment/",
  "/karma-mirror/kundli/",
  "/karma-mirror/narrative/",
  "/karma-mirror/results/",
  "/karma-mirror/timeline/",
  "/academy/dashboard",
  "/academy/quiz/",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Admin route protection ─────────────────────────────
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminToken = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!adminToken) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── 2. User route protection (academy_token cookie) ───────
  const needsUserAuth =
    USER_PROTECTED_EXACT.includes(pathname) ||
    USER_PROTECTED_PREFIX.some(p => pathname.startsWith(p));

  if (needsUserAuth) {
    const token = request.cookies.get("academy_token")?.value;
    if (!token) {
      const loginUrl = new URL("/academy/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("reason", "signin_required");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/games/:gameId+",
    "/karma-mirror/assessment/:path*",
    "/karma-mirror/kundli/:path*",
    "/karma-mirror/narrative/:path*",
    "/karma-mirror/results/:path*",
    "/karma-mirror/timeline/:path*",
    "/sanyam/profile",
    "/dashboard",
    "/academy/dashboard",
    "/academy/quiz/:path*",
  ],
};
