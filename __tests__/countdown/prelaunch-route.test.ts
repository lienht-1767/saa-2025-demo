import { describe, expect, it } from "vitest";

import { resolvePrelaunchRedirect } from "@/lib/countdown/prelaunch-route";

const NOW = Date.parse("2026-08-16T10:00:00+07:00");

describe("resolvePrelaunchRedirect", () => {
  it("routes the homepage to the standalone countdown before launch", () => {
    expect(resolvePrelaunchRedirect("/", NOW + 60_000, NOW)).toBe("/countdown");
  });

  it("keeps the countdown visible before launch", () => {
    expect(resolvePrelaunchRedirect("/countdown", NOW + 60_000, NOW)).toBeNull();
  });

  it("routes the countdown to the homepage at and after launch", () => {
    expect(resolvePrelaunchRedirect("/countdown", NOW, NOW)).toBe("/");
    expect(resolvePrelaunchRedirect("/countdown", NOW - 1, NOW)).toBe("/");
  });

  it("does not gate unrelated routes or an invalid deadline", () => {
    expect(resolvePrelaunchRedirect("/awards", NOW + 60_000, NOW)).toBeNull();
    expect(resolvePrelaunchRedirect("/", null, NOW)).toBeNull();
  });
});
