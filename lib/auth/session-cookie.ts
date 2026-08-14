/**
 * Shared predicate for detecting a Supabase auth-session cookie by name.
 *
 * Supabase stores the session in `sb-<project-ref>-auth-token`, chunked into
 * `sb-<project-ref>-auth-token.0`, `.1`, ... when the value exceeds a single cookie's size
 * limit. Used by `proxy.ts` (request cookies) and, from phase 04, server components reading
 * `next/headers` `cookies()` — one predicate, every caller.
 */
export const SUPABASE_AUTH_COOKIE_PATTERN = /^sb-.+-auth-token(?:\.\d+)?$/;

export function isSupabaseAuthCookie(name: string): boolean {
  return SUPABASE_AUTH_COOKIE_PATTERN.test(name);
}

export function hasSupabaseAuthCookie(names: Iterable<string>): boolean {
  for (const name of names) {
    if (isSupabaseAuthCookie(name)) return true;
  }

  return false;
}
