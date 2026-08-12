import { describe, expect, it } from "vitest";

import {
  AUTH_CALLBACK_ROUTE,
  LOGIN_ROUTE,
  POST_LOGIN_ROUTE,
  PUBLIC_ROUTES,
  isPublicRoute,
} from "@/lib/auth/routes";

describe("route constants", () => {
  it("matches the routes the spec names", () => {
    expect(LOGIN_ROUTE).toBe("/login");
    expect(AUTH_CALLBACK_ROUTE).toBe("/auth/callback");
    // AD04: the design says /todo, the project decided on / — see clarifications.md.
    expect(POST_LOGIN_ROUTE).toBe("/");
  });

  it("whitelists exactly the two public routes", () => {
    expect([...PUBLIC_ROUTES]).toEqual(["/login", "/auth/callback"]);
  });
});

describe("isPublicRoute", () => {
  it("accepts the public routes and their sub-paths", () => {
    expect(isPublicRoute("/login")).toBe(true);
    expect(isPublicRoute("/auth/callback")).toBe(true);
    expect(isPublicRoute("/auth/callback/extra")).toBe(true);
  });

  // Fail-closed: anything not whitelisted is protected, including look-alike paths.
  it("rejects everything else", () => {
    expect(isPublicRoute("/")).toBe(false);
    expect(isPublicRoute("/dashboard")).toBe(false);
    expect(isPublicRoute("/auth")).toBe(false);
    expect(isPublicRoute("/loginsomething")).toBe(false);
  });
});
