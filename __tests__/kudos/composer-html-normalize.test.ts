import { describe, expect, it } from "vitest";

import { normalizeComposerHtml } from "@/components/kudos/composer/composer-html-normalize";
import { sanitizeKudosHtml } from "@/lib/kudos/sanitize-kudos-html";

/**
 * The real invariant this normalizer exists for: no browser is installable in this environment
 * (Playwright MCP needs Chrome; `npx playwright install chrome` needs sudo we don't have), so the
 * shape each engine's `execCommand`/paste actually emits was never directly observed. Instead of
 * depending on that observation, every case below asserts the round-trip property —
 * `sanitizeKudosHtml(normalize(input)) === normalize(input)` — against the concrete strings each
 * browser engine family is documented to produce. If that property holds, the server sanitizer
 * can never silently drop anything the editor already normalized, regardless of which of these
 * shapes a given engine happens to choose.
 */
describe("normalizeComposerHtml", () => {
  const engineOutputs = [
    "<strike>x</strike>", // Chromium's historical strikeThrough output
    "<div>x</div>", // several engines' formatBlock/block-level output
    '<span style="font-weight:bold">x</span>', // inline style span some engines emit
    '<font color="red">x</font>', // legacy font tag
    '<a href="javascript:alert(1)">x</a>', // disallowed scheme
    "<u>x</u>", // underline has no toolbar button but paste can bring it in
    "<ul><li>a</li><li>b</li></ul>", // pasted bulleted list
    '<a href="https://example.com" target="_blank" class="tracked">x</a>', // createLink-ish anchor with extra attrs
    "<b>already <i>nested</i> and allowed</b>", // already-allowed markup should pass through untouched
  ];

  it.each(engineOutputs)("round-trips %s through sanitizeKudosHtml unchanged", (input) => {
    const normalized = normalizeComposerHtml(input);
    expect(sanitizeKudosHtml(normalized)).toBe(normalized);
  });

  it("rewrites <strike> to the allowlisted <s>", () => {
    expect(normalizeComposerHtml("<strike>bye</strike>")).toBe("<s>bye</s>");
  });

  it("rewrites block-level <div> to <p>", () => {
    expect(normalizeComposerHtml("<div>block</div>")).toBe("<p>block</p>");
  });

  it("unwraps <u>, <span>, and <font> but keeps their text", () => {
    expect(normalizeComposerHtml("<u>a</u><span>b</span><font>c</font>")).toBe("abc");
  });

  it("unwraps a disallowed inline style/attribute span while keeping nested allowed markup", () => {
    expect(normalizeComposerHtml('<span style="color:red"><b>bold</b></span>')).toBe("<b>bold</b>");
  });

  it("unwraps a pasted bulleted list into one <p> per item, never into <ol>", () => {
    const result = normalizeComposerHtml("<ul><li>first</li><li>second</li></ul>");
    expect(result).toBe("<p>first</p><p>second</p>");
    expect(result).not.toContain("<ol>");
  });

  it("drops an <a> whose href is not http(s), keeping only its text", () => {
    expect(normalizeComposerHtml('<a href="javascript:alert(1)">danger</a>')).toBe("danger");
    expect(normalizeComposerHtml("<a>no href at all</a>")).toBe("no href at all");
  });

  it("rebuilds a valid-href <a> down to the server's exact canonical shape", () => {
    const result = normalizeComposerHtml('<a href="https://example.com" target="_blank" class="tracked" onclick="x()">link</a>');
    expect(result).toBe('<a href="https://example.com" rel="noopener noreferrer nofollow" target="_blank">link</a>');
  });

  it("strips attributes from already-allowed tags", () => {
    expect(normalizeComposerHtml('<p style="color:red" class="x">para</p>')).toBe("<p>para</p>");
  });

  it("leaves already-allowed nested markup untouched", () => {
    expect(normalizeComposerHtml("<b>bold <i>and italic</i></b>")).toBe("<b>bold <i>and italic</i></b>");
  });

  it("is idempotent — normalizing twice matches normalizing once", () => {
    for (const input of engineOutputs) {
      const once = normalizeComposerHtml(input);
      expect(normalizeComposerHtml(once)).toBe(once);
    }
  });
});
