import { describe, expect, it } from "vitest";

import { formatPostTime } from "@/lib/kudos/format-post-time";

describe("formatPostTime", () => {
  it("renders as HH:mm - MM/DD/YYYY, matching the design's '10:00 - 10/30/2025'", () => {
    expect(formatPostTime("2025-10-30T10:00:00.000Z")).toBe("10:00 - 10/30/2025");
  });

  it("zero-pads single-digit hours, minutes, months, and days", () => {
    expect(formatPostTime("2025-01-05T03:04:00.000Z")).toBe("03:04 - 01/05/2025");
  });

  it("throws on an unparsable timestamp instead of rendering 'Invalid Date'", () => {
    expect(() => formatPostTime("not-a-date")).toThrow(RangeError);
  });
});
