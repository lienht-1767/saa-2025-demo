/** Supabase public configuration used by browser and server clients. */
export type SupabaseEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export class SupabaseConfigurationError extends Error {
  constructor(missingNames: string[]) {
    super(
      `Missing environment variables ${missingNames.join(", ")}. ` +
        "Copy .env.example to .env (or .env.local for Next.js only) and fill in the local Supabase values.",
    );
    this.name = "SupabaseConfigurationError";
  }
}

/**
 * Reads lazily so importing a Client Component never crashes the login page.
 *
 * Keep these as literal `process.env.NEXT_PUBLIC_*` accesses. Next.js replaces literal
 * public-variable references in the browser bundle; a dynamic `process.env[name]` lookup
 * survives into the browser and reads as undefined even when `.env.local` is configured.
 */
export function getSupabaseEnv(): SupabaseEnv {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const missingNames: string[] = [];

  if (!supabaseUrl) missingNames.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) missingNames.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new SupabaseConfigurationError(missingNames);
  }

  return { supabaseUrl, supabaseAnonKey };
}
