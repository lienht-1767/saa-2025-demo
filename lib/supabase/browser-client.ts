import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv } from "./env";

/**
 * Supabase client for Client Components.
 *
 * OAuth sign-in must start here rather than on the server: Supabase stores the PKCE
 * code verifier in the browser, and `/auth/callback` needs it to complete the exchange.
 */
export function createSupabaseBrowserClient() {
  const { supabaseAnonKey, supabaseUrl } = getSupabaseEnv();

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
