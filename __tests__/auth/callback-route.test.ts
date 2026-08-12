import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const exchangeCodeForSession = vi.fn();
const createSupabaseServerClient = vi.fn(async () => ({
  auth: { exchangeCodeForSession },
}));

vi.mock("@/lib/supabase/server-client", () => ({
  createSupabaseServerClient,
}));

const { GET } = await import("@/app/auth/callback/route");

function callbackRequest(query: string) {
  return new NextRequest(new URL(`/auth/callback${query}`, "http://localhost:3000"));
}

describe("GET /auth/callback", () => {
  beforeEach(() => {
    exchangeCodeForSession.mockReset();
    createSupabaseServerClient.mockReset();
    createSupabaseServerClient.mockResolvedValue({ auth: { exchangeCodeForSession } });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("redirects home after a successful exchange (test case e76aa170)", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });

    const response = await GET(callbackRequest("?code=valid-code"));

    expect(exchangeCodeForSession).toHaveBeenCalledWith("valid-code");
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  // edge-cases.md: the user cancelled at Google, so no code was ever issued.
  it("redirects to /login?error=auth when the code is missing", async () => {
    const response = await GET(callbackRequest(""));

    expect(exchangeCodeForSession).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?error=auth",
    );
  });

  it("redirects to /login?error=auth when the exchange fails", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: { message: "invalid grant" } });

    const response = await GET(callbackRequest("?code=stale-code"));

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?error=auth",
    );
  });

  it("logs the provider error server-side instead of leaking it to the client", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: { message: "invalid grant" } });

    const response = await GET(callbackRequest("?code=stale-code"));

    expect(console.error).toHaveBeenCalled();
    expect(response.headers.get("location")).not.toContain("invalid grant");
  });

  it("redirects to the friendly failure state when client creation throws", async () => {
    createSupabaseServerClient.mockRejectedValueOnce(new Error("Supabase unavailable"));

    const response = await GET(callbackRequest("?code=valid-code"));

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?error=auth",
    );
  });
});
