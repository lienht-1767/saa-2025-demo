import { describe, expect, it } from "vitest";

import {
  pickClosestVisibleSlug,
  resolveAwardHash,
} from "@/lib/awards/use-award-scroll-spy";

const slugs = ["top-talent", "top-project", "mvp"] as const;

describe("award navigation state", () => {
  it("uses the first award only when the URL has no hash", () => {
    expect(resolveAwardHash("", slugs)).toBe("top-talent");
    expect(resolveAwardHash("#", slugs)).toBe("top-talent");
  });

  it("honours valid deep links and rejects invalid or malformed hashes", () => {
    expect(resolveAwardHash("#top-project", slugs)).toBe("top-project");
    expect(resolveAwardHash("#missing", slugs)).toBe("");
    expect(resolveAwardHash("#%E0%A4%A", slugs)).toBe("");
  });

  it("chooses the visible section nearest the sticky-header activation line", () => {
    expect(
      pickClosestVisibleSlug(
        [
          { slug: "top-talent", top: -260 },
          { slug: "top-project", top: 118 },
          { slug: "mvp", top: 620 },
        ],
        96,
      ),
    ).toBe("top-project");
  });
});
