import { afterEach, describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const getUser = vi.fn();
const createSupabaseMiddlewareClient = vi.fn((request: NextRequest) => ({
  supabase: { auth: { getUser } },
  response: NextResponse.next({ request }),
}));

vi.mock("@/lib/supabase/middleware-client", () => ({
  createSupabaseMiddlewareClient,
}));

const { AUTH_VALIDATION_TIMEOUT_MS, proxy } = await import("@/proxy");

function requestFor(pathname: string, withAuthCookie = false) {
  const request = new NextRequest(new URL(pathname, "http://localhost:3000"));

  if (withAuthCookie) {
    request.cookies.set("sb-local-auth-token", "session-token");
  }

  return request;
}

function signedIn() {
  getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
}

function signedOut() {
  getUser.mockResolvedValue({ data: { user: null }, error: null });
}

/** Covers the four quadrants of the decision table in docs/system/permissions.md. */
describe("proxy route guard", () => {
  beforeEach(() => {
    getUser.mockReset();
    createSupabaseMiddlewareClient.mockClear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("lets a signed-out visitor reach /login (test case 45278c06)", async () => {
    signedOut();

    const response = await proxy(requestFor("/login"));

    expect(response.status).not.toBe(307);
    expect(response.headers.get("location")).toBeNull();
    expect(createSupabaseMiddlewareClient).not.toHaveBeenCalled();
  });

  it("lets a signed-out visitor reach /auth/callback", async () => {
    signedOut();

    const response = await proxy(requestFor("/auth/callback?code=abc"));

    expect(response.headers.get("location")).toBeNull();
    expect(createSupabaseMiddlewareClient).not.toHaveBeenCalled();
  });

  it("redirects a signed-out visitor off a protected route to /login", async () => {
    signedOut();

    const response = await proxy(requestFor("/profile"));

    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
    expect(createSupabaseMiddlewareClient).not.toHaveBeenCalled();
  });

  it("lets a signed-out visitor reach the public homepage without calling Supabase (AD05, TC ID-0)", async () => {
    const response = await proxy(requestFor("/"));

    expect(response.status).not.toBe(307);
    expect(response.headers.get("location")).toBeNull();
    expect(createSupabaseMiddlewareClient).not.toHaveBeenCalled();
    expect(getUser).not.toHaveBeenCalled();
  });

  // BR01 / TC ID-1. The award page carries prize amounts, so it is protected: a guest is turned
  // away on the cookie check alone, before any Supabase round trip.
  it("redirects a signed-out visitor off /awards to /login without calling Supabase (TC ID-1)", async () => {
    signedOut();

    const response = await proxy(requestFor("/awards"));

    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
    expect(createSupabaseMiddlewareClient).not.toHaveBeenCalled();
  });

  it("lets a signed-in user reach /awards (TC ID-0, ID-2)", async () => {
    signedIn();

    const response = await proxy(requestFor("/awards", true));

    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects a signed-in user away from /login (test case f62b0c97)", async () => {
    signedIn();

    const response = await proxy(requestFor("/login", true));

    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("lets a signed-in user through to a protected route", async () => {
    signedIn();

    const response = await proxy(requestFor("/profile", true));

    expect(response.headers.get("location")).toBeNull();
  });

  it("validates the session with getUser, not the raw cookie", async () => {
    signedOut();

    await proxy(requestFor("/", true));

    expect(getUser).toHaveBeenCalledTimes(1);
  });

  it("fails closed when Supabase configuration is unavailable on a protected route", async () => {
    createSupabaseMiddlewareClient.mockImplementationOnce(() => {
      throw new Error("Missing environment variables NEXT_PUBLIC_SUPABASE_URL");
    });

    const response = await proxy(requestFor("/private", true));

    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("does not leave /login hanging when a stale auth cookie cannot be validated", async () => {
    vi.useFakeTimers();
    getUser.mockReturnValue(new Promise(() => {}));

    const responsePromise = proxy(requestFor("/login", true));
    await vi.advanceTimersByTimeAsync(AUTH_VALIDATION_TIMEOUT_MS);
    const response = await responsePromise;

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("set-cookie")).toContain("sb-local-auth-token=");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("clears an invalid auth cookie and fails closed on protected routes", async () => {
    getUser.mockRejectedValue(new Error("fetch failed"));

    const response = await proxy(requestFor("/private", true));

    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
    expect(response.headers.get("set-cookie")).toContain("sb-local-auth-token=");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});
