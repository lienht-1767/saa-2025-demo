import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { AwardCard } from "@/components/home/award-card";
import { AWARD_BACKDROP, AWARD_CARDS } from "@/lib/home/awards";

/**
 * The wordmark used to be sized with a flat `w-[69%]`, which is only correct for the five
 * 232px-wide `Awards-Name` instances. It stretched Top Talent (222px) and drew MVP (116px) at
 * double width. Each card must scale from its own intrinsic size instead.
 */
describe("AwardCard wordmark sizing", () => {
  it.each(AWARD_CARDS.map((award) => [award.key, award] as const))(
    "sizes the %s wordmark from its own Figma box, not a shared percentage",
    (_key, award) => {
      render(<AwardCard award={award} title={_key} description="mô tả" detailLabel="Chi tiết" />);

      const wordmark = screen.getByAltText(_key);
      const expected = `${(award.wordmark.width / AWARD_BACKDROP.size) * 100}%`;

      expect(wordmark.style.width).toBe(expected);
      // `h-auto` keeps the asset's aspect ratio, so no explicit height may be pinned.
      expect(wordmark.style.height).toBe("");
    },
  );

  it("gives MVP roughly half the width of the full-bleed wordmarks (was 2x too large)", () => {
    const mvp = AWARD_CARDS.find((award) => award.key === "mvp");
    const leader = AWARD_CARDS.find((award) => award.key === "topProjectLeader");

    expect(mvp?.wordmark.width).toBe(116);
    expect(leader?.wordmark.width).toBe(232);
  });
});
