import { describe, expect, it } from "vitest";

import { splitVisibleHashtags } from "@/lib/kudos/visible-hashtags";

describe("splitVisibleHashtags", () => {
  it("returns every tag unchanged when there are 5 or fewer", () => {
    const tags = ["a", "b", "c"];
    expect(splitVisibleHashtags(tags)).toEqual({ visible: tags, overflowCount: 0 });
  });

  it("caps at 5 visible tags and reports the rest as overflow", () => {
    const tags = ["a", "b", "c", "d", "e", "f", "g"];
    expect(splitVisibleHashtags(tags)).toEqual({
      visible: ["a", "b", "c", "d", "e"],
      overflowCount: 2,
    });
  });

  it("handles an empty list without error", () => {
    expect(splitVisibleHashtags([])).toEqual({ visible: [], overflowCount: 0 });
  });
});
