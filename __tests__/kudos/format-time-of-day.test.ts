import { describe, expect, it } from "vitest";

import { formatTimeOfDay } from "@/lib/kudos/format-time-of-day";

describe("formatTimeOfDay", () => {
  it("renders as HH:mm, matching the spotlight ticker's '08:30' style", () => {
    expect(formatTimeOfDay("2025-10-30T08:30:00.000Z")).toBe("08:30");
  });

  it("zero-pads single-digit hours and minutes", () => {
    expect(formatTimeOfDay("2025-10-30T03:04:00.000Z")).toBe("03:04");
  });

  it("throws on an unparsable timestamp", () => {
    expect(() => formatTimeOfDay("not-a-date")).toThrow(RangeError);
  });
});
