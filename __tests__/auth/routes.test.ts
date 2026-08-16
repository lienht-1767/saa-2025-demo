import { describe, expect, it } from "vitest";

import {
  AUTH_CALLBACK_ROUTE,
  AWARDS_ROUTE,
  COUNTDOWN_ROUTE,
  HOME_ROUTE,
  KUDOS_ROUTE,
  LOGIN_ROUTE,
  POST_LOGIN_ROUTE,
  PUBLIC_ROUTES,
  isPublicRoute,
} from "@/lib/auth/routes";

describe("route constants", () => {
  it("matches the routes the spec names", () => {
    expect(LOGIN_ROUTE).toBe("/login");
    expect(AUTH_CALLBACK_ROUTE).toBe("/auth/callback");
    expect(HOME_ROUTE).toBe("/");
    expect(AWARDS_ROUTE).toBe("/awards");
    expect(KUDOS_ROUTE).toBe("/kudos");
    expect(COUNTDOWN_ROUTE).toBe("/countdown");
    // AD04: the design says /todo, the project decided on / — see clarifications.md.
    expect(POST_LOGIN_ROUTE).toBe("/");
  });

  // `/awards` was withdrawn from this list when the page stopped being a stub — BR01/TC ID-1.
  it("whitelists the public routes (AD05 opens /, BR01 closes /awards)", () => {
    expect([...PUBLIC_ROUTES]).toEqual(["/login", "/auth/callback", "/", "/kudos", "/countdown"]);
  });
});

describe("isPublicRoute", () => {
  it("accepts the public routes and their sub-paths", () => {
    expect(isPublicRoute("/login")).toBe(true);
    expect(isPublicRoute("/auth/callback")).toBe(true);
    expect(isPublicRoute("/auth/callback/extra")).toBe(true);
    expect(isPublicRoute("/kudos")).toBe(true);
    expect(isPublicRoute("/countdown")).toBe(true);
  });

  // "/" must stay an EXACT match — `"/profile".startsWith("//")` is false, so adding "/" to the
  // whitelist cannot accidentally make every route public. This is the one non-obvious property
  // of the change; assert it explicitly.
  it("treats / as an exact match, not a prefix that swallows every route", () => {
    expect(isPublicRoute("/")).toBe(true);
    expect(isPublicRoute("/profile")).toBe(false);
    expect(isPublicRoute("/admin")).toBe(false);
    expect(isPublicRoute("/dashboard")).toBe(false);
  });

  // A doubled leading slash must not slip past the whitelist: `"//admin".startsWith("//")` is
  // true, so prefix-matching "/" would admit it, and the path can still normalise to the
  // protected `/admin` downstream. The guard must hold here, not rely on that normalisation.
  it("rejects paths with a doubled leading slash", () => {
    expect(isPublicRoute("//")).toBe(false);
    expect(isPublicRoute("//admin")).toBe(false);
    expect(isPublicRoute("//profile")).toBe(false);
    expect(isPublicRoute("//evil.com")).toBe(false);
  });

  // Fail-closed: anything not whitelisted is protected, including look-alike paths.
  it("rejects everything else", () => {
    expect(isPublicRoute("/dashboard")).toBe(false);
    expect(isPublicRoute("/auth")).toBe(false);
    expect(isPublicRoute("/loginsomething")).toBe(false);
    expect(isPublicRoute("/awardsomething")).toBe(false);
    // BR01 / TC ID-1 — the award page and its sub-paths require a session. These two lines
    // asserted `true` while /awards was a public stub; they were flipped, not dropped.
    expect(isPublicRoute("/awards")).toBe(false);
    expect(isPublicRoute("/awards/2025")).toBe(false);
  });
});
