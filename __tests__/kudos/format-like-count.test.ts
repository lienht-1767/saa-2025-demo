import { describe, expect, it } from "vitest";

import { formatLikeCount } from "@/lib/kudos/format-like-count";

describe("formatLikeCount", () => {
  it("renders small counts without a separator", () => {
    expect(formatLikeCount(10)).toBe("10");
    expect(formatLikeCount(0)).toBe("0");
  });

  it("groups thousands with a dot, matching the design's '1.000'", () => {
    expect(formatLikeCount(1000)).toBe("1.000");
  });

  it("rejects a negative count rather than rendering '-5'", () => {
    expect(() => formatLikeCount(-5)).toThrow(RangeError);
  });
});
