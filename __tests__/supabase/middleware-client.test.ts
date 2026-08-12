import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const createServerClient = vi.fn();

vi.mock("@supabase/ssr", () => ({ createServerClient }));

const { createSupabaseMiddlewareClient } = await import(
  "@/lib/supabase/middleware-client"
);

describe("createSupabaseMiddlewareClient", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
    createServerClient.mockReset();
    createServerClient.mockReturnValue({ auth: {} });
  });

  it("forwards refreshed cookies to both the current request and browser response", () => {
    const request = new NextRequest("http://localhost:3000/private");
    const client = createSupabaseMiddlewareClient(request);
    const cookieAdapter = createServerClient.mock.calls[0][2].cookies;

    cookieAdapter.setAll([
      {
        name: "sb-local-auth-token",
        value: "refreshed-token",
        options: { path: "/", httpOnly: true },
      },
    ]);

    expect(request.cookies.get("sb-local-auth-token")?.value).toBe("refreshed-token");
    expect(client.response.headers.get("x-middleware-request-cookie")).toContain(
      "sb-local-auth-token=refreshed-token",
    );
    expect(client.response.headers.get("set-cookie")).toContain(
      "sb-local-auth-token=refreshed-token",
    );
  });
});
