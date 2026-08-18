import { describe, expect, it } from "vitest";

import { parseBoardFilters, serialiseBoardFilters } from "@/lib/kudos/read/board-filters";

describe("parseBoardFilters", () => {
  it("reads both filters from a URLSearchParams instance", () => {
    const params = new URLSearchParams({ hashtagId: "h1", departmentId: "d1" });

    expect(parseBoardFilters(params)).toEqual({ hashtagId: "h1", departmentId: "d1" });
  });

  it("defaults missing URLSearchParams keys to null", () => {
    expect(parseBoardFilters(new URLSearchParams())).toEqual({ hashtagId: null, departmentId: null });
  });

  it("reads both filters from a plain Next.js searchParams object", () => {
    expect(parseBoardFilters({ hashtagId: "h1", departmentId: "d1" })).toEqual({
      hashtagId: "h1",
      departmentId: "d1",
    });
  });

  it("takes the first value when a searchParams key repeats as an array", () => {
    expect(parseBoardFilters({ hashtagId: ["h1", "h2"] })).toEqual({
      hashtagId: "h1",
      departmentId: null,
    });
  });

  it("treats undefined and empty-string values as null", () => {
    expect(parseBoardFilters({ hashtagId: undefined, departmentId: "" })).toEqual({
      hashtagId: null,
      departmentId: null,
    });
  });
});

describe("serialiseBoardFilters", () => {
  it("round-trips both filters through URLSearchParams", () => {
    const filters = { hashtagId: "h1", departmentId: "d1" };

    expect(parseBoardFilters(serialiseBoardFilters(filters))).toEqual(filters);
  });

  it("omits a null filter from the serialised params entirely", () => {
    const params = serialiseBoardFilters({ hashtagId: "h1", departmentId: null });

    expect(params.has("departmentId")).toBe(false);
    expect(params.get("hashtagId")).toBe("h1");
  });

  it("serialises an all-null filter set to empty params", () => {
    expect(serialiseBoardFilters({ hashtagId: null, departmentId: null }).toString()).toBe("");
  });
});
