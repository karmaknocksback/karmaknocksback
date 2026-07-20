import { NextResponse } from "next/server";

import { NextRequest } from "next/server";

export function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL || "";
  const redirectUri = `${siteUrl}/api/auth/google/callback`;
  
  // Preserve the redirect URL through the OAuth flow via state param
  const returnTo = req.nextUrl.searchParams.get("redirect") || "/";

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: "code",
    scope:         "openid email profile",
    access_type:   "offline",
    prompt:        "select_account",
    state:         encodeURIComponent(returnTo),   // <-- preserve redirect
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
