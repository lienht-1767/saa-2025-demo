import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseEnv } from "./env";

/**
 * Supabase client for Server Components and Route Handlers.
 *
 * Reads the session from request cookies so server-rendered pages see the same session
 * the browser has.
 */
export async function createSupabaseServerClient() {
  const { supabaseAnonKey, supabaseUrl } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot write cookies — Next.js throws here by design.
          // Safe to ignore: middleware refreshes the session on every request, so the
          // refreshed cookies are persisted there instead.
        }
      },
    },
  });
}
