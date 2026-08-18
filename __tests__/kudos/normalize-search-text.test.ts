import { describe, expect, it } from "vitest";

import { normalizeSearchText } from "@/lib/kudos/normalize-search-text";

describe("normalizeSearchText", () => {
  it("matches Vietnamese names when the query omits diacritics", () => {
    expect(normalizeSearchText("  Nguyễn Hoàng Linh ")).toBe("nguyen hoang linh");
    expect(normalizeSearchText("Đỗ Hoàng Hiệp")).toBe("do hoang hiep");
  });

  it("collapses whitespace and remains case-insensitive", () => {
    expect(normalizeSearchText("MAI   Phương THÚY")).toBe("mai phuong thuy");
  });
});
