import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_EVENT_START_AT,
  ZERO_COUNTDOWN,
  computeCountdown,
  resolveEventStart,
} from "@/lib/home/countdown";

describe("resolveEventStart", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("falls back to the built-in default when called with no argument and no env var (edge case row 2)", () => {
    vi.stubEnv("NEXT_PUBLIC_EVENT_START_AT", "");

    expect(resolveEventStart(undefined)).toBe(Date.parse(DEFAULT_EVENT_START_AT));
  });

  it("falls back to the built-in default for an empty string", () => {
    expect(resolveEventStart("")).toBe(Date.parse(DEFAULT_EVENT_START_AT));
  });

  it("returns null and warns exactly once for an unparseable value (edge case row 1)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(resolveEventStart("invalid-format")).toBeNull();

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain("[home/countdown]");
  });

  it("never throws for a malformed calendar date and still returns null", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(() => resolveEventStart("2025-13-45")).not.toThrow();
    expect(resolveEventStart("2025-13-45")).toBeNull();
  });

  it("parses a valid future ISO-8601 string to epoch ms", () => {
    expect(resolveEventStart("2030-01-01T00:00:00+07:00")).toBe(
      Date.parse("2030-01-01T00:00:00+07:00"),
    );
  });

  it("reads NEXT_PUBLIC_EVENT_START_AT literally when called with no argument at all", () => {
    vi.stubEnv("NEXT_PUBLIC_EVENT_START_AT", "2031-05-01T00:00:00+07:00");

    expect(resolveEventStart()).toBe(Date.parse("2031-05-01T00:00:00+07:00"));
  });
});

describe("computeCountdown", () => {
  const NOW = Date.parse("2026-01-01T00:00:00+07:00");

  it("returns the zero shape when the deadline is null (BR13)", () => {
    expect(computeCountdown(null, NOW)).toEqual(ZERO_COUNTDOWN);
  });

  it("returns the zero shape, never negative, once the deadline has passed (edge case row 3)", () => {
    expect(computeCountdown(NOW - 1, NOW)).toEqual(ZERO_COUNTDOWN);
    expect(computeCountdown(NOW - 999_999_999, NOW)).toEqual(ZERO_COUNTDOWN);
  });

  it("returns the zero shape exactly at the deadline", () => {
    expect(computeCountdown(NOW, NOW)).toEqual(ZERO_COUNTDOWN);
  });

  it("computes whole days/hours/minutes remaining for a future target (ID-12)", () => {
    const remaining = 2 * 86_400_000 + 3 * 3_600_000 + 4 * 60_000 + 30_000; // +30s truncated away
    const deadline = NOW + remaining;

    expect(computeCountdown(deadline, NOW)).toEqual({
      days: 2,
      hours: 3,
      minutes: 4,
      showComingSoon: true,
    });
  });

  it("flips to the terminal state once time crosses the deadline and never counts backward (ID-39/40/41)", () => {
    const deadline = NOW + 60_000;

    expect(computeCountdown(deadline, NOW)).toEqual({
      days: 0,
      hours: 0,
      minutes: 1,
      showComingSoon: true,
    });
    expect(computeCountdown(deadline, deadline + 1)).toEqual(ZERO_COUNTDOWN);
    expect(computeCountdown(deadline, deadline + 86_400_000)).toEqual(ZERO_COUNTDOWN);
  });
});
