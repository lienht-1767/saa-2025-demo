import { describe, expect, it } from "vitest";

import { computeHoaThiTier } from "@/lib/kudos/hoa-thi-tier";

describe("computeHoaThiTier", () => {
  it("returns New Hero, 0 stars, below the first threshold", () => {
    expect(computeHoaThiTier(0)).toEqual({ tier: 0, title: "New Hero" });
    expect(computeHoaThiTier(9)).toEqual({ tier: 0, title: "New Hero" });
  });

  it("returns Rising Hero, 1 star, from 10 up to 19 kudos", () => {
    expect(computeHoaThiTier(10)).toEqual({ tier: 1, title: "Rising Hero" });
    expect(computeHoaThiTier(19)).toEqual({ tier: 1, title: "Rising Hero" });
  });

  it("returns Super Hero, 2 stars, from 20 up to 49 kudos", () => {
    expect(computeHoaThiTier(20)).toEqual({ tier: 2, title: "Super Hero" });
    expect(computeHoaThiTier(49)).toEqual({ tier: 2, title: "Super Hero" });
  });

  it("returns Legend Hero, 3 stars, at 50 kudos and above", () => {
    expect(computeHoaThiTier(50)).toEqual({ tier: 3, title: "Legend Hero" });
    expect(computeHoaThiTier(1000)).toEqual({ tier: 3, title: "Legend Hero" });
  });

  it("holds the boundary exactly at each threshold — one kudos below still the lower band", () => {
    expect(computeHoaThiTier(9)).toEqual({ tier: 0, title: "New Hero" });
    expect(computeHoaThiTier(10)).toEqual({ tier: 1, title: "Rising Hero" });
    expect(computeHoaThiTier(19)).toEqual({ tier: 1, title: "Rising Hero" });
    expect(computeHoaThiTier(20)).toEqual({ tier: 2, title: "Super Hero" });
    expect(computeHoaThiTier(49)).toEqual({ tier: 2, title: "Super Hero" });
    expect(computeHoaThiTier(50)).toEqual({ tier: 3, title: "Legend Hero" });
  });

  it("rejects a negative count rather than guessing a tier", () => {
    expect(() => computeHoaThiTier(-1)).toThrow(RangeError);
  });
});
