import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnv } from "./env";

/**
 * Supabase client for `middleware.ts`.
 *
 * Returns the response alongside the client because refreshed session cookies are written
 * onto that exact response object — the caller must return this instance (or copy its
 * cookies onto a redirect) or the refreshed session is lost.
 */
export function createSupabaseMiddlewareClient(request: NextRequest) {
  const { supabaseAnonKey, supabaseUrl } = getSupabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        // Recreate the pass-through response after mutating the request so Server Components
        // in this same render receive the refreshed session rather than the stale cookie.
        response = NextResponse.next({ request });

        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  return {
    supabase,
    get response() {
      return response;
    },
  };
}
