import { describe, expect, it } from "vitest";

import { stripKudosHtml } from "@/lib/kudos/strip-kudos-html";

describe("stripKudosHtml", () => {
  it("returns plain text with tags removed", () => {
    expect(stripKudosHtml("<p>Hello <b>world</b></p>")).toBe("Hello world");
  });

  it("turns <br>, </p>, and </li> into a single collapsible space", () => {
    expect(stripKudosHtml("line one<br>line two")).toBe("line one line two");
    expect(stripKudosHtml("<ol><li>one</li><li>two</li></ol>")).toBe("one two");
  });

  it("decodes entities", () => {
    expect(stripKudosHtml("A &amp; B &lt;3")).toBe("A & B <3");
  });

  it("collapses runs of whitespace and trims the result", () => {
    expect(stripKudosHtml("<p>one</p>\n\n   <p>two</p>")).toBe("one two");
  });

  it("does not let a quoted attribute's > end the tag early", () => {
    expect(stripKudosHtml('<a href="https://x.com/a>b">click</a>')).toBe("click");
  });

  it("returns an empty string for empty or non-string input", () => {
    expect(stripKudosHtml("")).toBe("");
  });

  it("rejects input longer than 20,000 characters instead of scanning it", () => {
    expect(stripKudosHtml("a".repeat(20_001))).toBe("");
  });

  it("handles legacy plain text (no tags) unchanged apart from trimming", () => {
    expect(stripKudosHtml("  just plain text  ")).toBe("just plain text");
  });
});
