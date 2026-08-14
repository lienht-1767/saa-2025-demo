import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware-client";
import { LOGIN_ROUTE, POST_LOGIN_ROUTE, isPublicRoute } from "@/lib/auth/routes";
import { hasSupabaseAuthCookie, isSupabaseAuthCookie } from "@/lib/auth/session-cookie";

export const AUTH_VALIDATION_TIMEOUT_MS = 2_000;

/**
 * Route guard — runs before any page renders, so protected content never leaves the server
 * without a session (AD02 in docs/system/architecture.md).
 *
 * Lives in `proxy.ts`: Next.js 16 renamed the `middleware` file convention to `proxy`.
 *
 * | session | route          | result          |
 * |---------|----------------|-----------------|
 * | no      | public         | pass            |
 * | no      | anything else  | 302 /login      |
 * | yes     | /login         | 302 /           |
 * | yes     | anything else  | pass            |
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = isPublicRoute(pathname);
  const fallbackResponse = NextResponse.next({ request });

  // A visitor without a session cookie cannot be authenticated. Avoid a network call on
  // public pages (especially /login) and fail closed immediately on protected routes.
  if (!hasSupabaseAuthCookie(request.cookies.getAll().map(({ name }) => name))) {
    return isPublic
      ? fallbackResponse
      : redirectPreservingCookies(request, LOGIN_ROUTE, fallbackResponse);
  }

  let response = fallbackResponse;
  let client: ReturnType<typeof createSupabaseMiddlewareClient> | undefined;

  try {
    client = createSupabaseMiddlewareClient(request);

    // getUser() revalidates against the auth server; getSession() would trust the cookie as-is.
    const {
      data: { user },
      error,
    } = await withTimeout(
      client.supabase.auth.getUser(),
      AUTH_VALIDATION_TIMEOUT_MS,
      "Supabase session validation timed out",
    );

    // getUser() may refresh the session. Read the factory's latest response after it settles.
    response = client.response;

    if (error) {
      throw error;
    }

    if (!user && !isPublic) {
      return redirectPreservingCookies(request, LOGIN_ROUTE, response);
    }

    if (user && pathname === LOGIN_ROUTE) {
      return redirectPreservingCookies(request, POST_LOGIN_ROUTE, response);
    }

    return response;
  } catch (error) {
    if (client) {
      response = client.response;
    }

    clearSupabaseAuthCookies(request, response);
    console.error("[auth/proxy] session validation failed:", error);

    // Authentication is an external boundary. Keep the login and callback routes usable,
    // but never allow an unverifiable session through to protected content.
    return isPublic
      ? response
      : redirectPreservingCookies(request, LOGIN_ROUTE, response);
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

function clearSupabaseAuthCookies(request: NextRequest, response: NextResponse) {
  for (const { name } of request.cookies.getAll()) {
    if (!isSupabaseAuthCookie(name)) continue;

    request.cookies.delete(name);
    response.cookies.set(name, "", { maxAge: 0, path: "/" });
  }
}

/**
 * Redirects without dropping the refreshed session cookies that the Supabase client just
 * wrote onto `response`.
 */
function redirectPreservingCookies(
  request: NextRequest,
  pathname: string,
  response: NextResponse,
) {
  const redirect = NextResponse.redirect(new URL(pathname, request.url));

  for (const cookie of response.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }

  return redirect;
}

export const config = {
  matcher: [
    /*
     * Everything except Next.js internals and static assets — matching those would 302
     * every image and script on the login page.
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
