import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { LOGIN_ROUTE, POST_LOGIN_ROUTE } from "@/lib/auth/routes";

/**
 * OAuth return leg: exchanges the authorization code for a session cookie.
 *
 * Every failure path lands on the login screen with `?error=auth`, which the page turns
 * into the design's error copy. Provider details stay in the server log — the client only
 * ever sees the generic message.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  const failureUrl = new URL(LOGIN_ROUTE, origin);
  failureUrl.searchParams.set("error", "auth");

  // The user cancelled at Google, or Google refused — no code was issued.
  if (!code) {
    return NextResponse.redirect(failureUrl);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[auth/callback] code exchange failed:", error.message);
      return NextResponse.redirect(failureUrl);
    }
  } catch (error) {
    console.error("[auth/callback] code exchange failed:", error);
    return NextResponse.redirect(failureUrl);
  }

  return NextResponse.redirect(new URL(POST_LOGIN_ROUTE, origin));
}
