import { afterEach, describe, expect, it, vi } from "vitest";

describe("Supabase environment configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("can be imported in the browser bundle before configuration is read", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    const envModule = await import("@/lib/supabase/env");

    expect(envModule.getSupabaseEnv).toBeTypeOf("function");
  });

  it("reports every missing public Supabase variable when a client is created", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    const { getSupabaseEnv } = await import("@/lib/supabase/env");

    expect(() => getSupabaseEnv()).toThrow(
      "Missing environment variables NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  });

  it("returns configured values", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");

    const { getSupabaseEnv } = await import("@/lib/supabase/env");

    expect(getSupabaseEnv()).toEqual({
      supabaseUrl: "http://127.0.0.1:54321",
      supabaseAnonKey: "test-anon-key",
    });
  });
});
