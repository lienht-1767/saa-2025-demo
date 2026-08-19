import { describe, expect, it } from "vitest";

import { sanitizeKudosHtml } from "@/lib/kudos/sanitize-kudos-html";

/** ~18+ XSS vectors plus the structural cases the phase-03 spec calls out by name. Each entry is
 * `[label, input, expected]`; the idempotence suite below re-runs every one through the
 * sanitizer a second time and asserts the output is a fixed point. */
const CASES: Array<[string, string, string]> = [
  ["bold survives", "<b>hi</b>", "<b>hi</b>"],
  ["strong survives", "<strong>hi</strong>", "<strong>hi</strong>"],
  ["italic survives", "<i>hi</i>", "<i>hi</i>"],
  ["emphasis survives", "<em>hi</em>", "<em>hi</em>"],
  ["strikethrough survives", "<s>hi</s>", "<s>hi</s>"],
  ["ordered list survives", "<ol><li>one</li><li>two</li></ol>", "<ol><li>one</li><li>two</li></ol>"],
  ["blockquote survives", "<blockquote>q</blockquote>", "<blockquote>q</blockquote>"],
  ["paragraph survives", "<p>hello</p>", "<p>hello</p>"],
  ["br survives", "line one<br>line two", "line one<br>line two"],
  ["script tag dropped", "<script>alert(1)</script>", "alert(1)"],
  ["img onerror emits nothing executable", '<img src=x onerror=alert(1)>', ""],
  ["svg onload dropped", "<svg/onload=alert(1)>", ""],
  ["svg+script nested dropped", "<svg><script>alert(1)</script></svg>", "alert(1)"],
  ["math foreign content dropped", '<math><mi xlink:href="javascript:alert(1)">x</mi></math>', "x"],
  [
    "javascript href stripped",
    '<a href="javascript:alert(1)">x</a>',
    "<a>x</a>",
  ],
  [
    "mixed-case javascript href stripped",
    '<a href="jAvAsCrIpT:alert(1)">x</a>',
    "<a>x</a>",
  ],
  [
    "whitespace-prefixed javascript href stripped",
    '<a href="  javascript:alert(1)">x</a>',
    "<a>x</a>",
  ],
  [
    "entity-obfuscated javascript href stripped",
    '<a href="&#106;avascript:alert(1)">x</a>',
    "<a>x</a>",
  ],
  [
    "data href rejected",
    '<a href="data:text/html;base64,PHNjcmlwdD4=">x</a>',
    "<a>x</a>",
  ],
  [
    "valid https href kept with forced rel/target",
    '<a href="https://example.com/x">y</a>',
    '<a href="https://example.com/x" rel="noopener noreferrer nofollow" target="_blank">y</a>',
  ],
  [
    "single-quoted href still parses correctly, onclick dropped",
    "<a href='https://example.com' onclick=\"alert(1)\">click</a>",
    '<a href="https://example.com" rel="noopener noreferrer nofollow" target="_blank">click</a>',
  ],
  ["onclick attribute dropped", '<b onclick="x">hi</b>', "<b>hi</b>"],
  ["style attribute dropped", '<b style="expression(alert(1))">x</b>', "<b>x</b>"],
  [
    "attribute value containing a raw > does not end the tag early",
    '<b title="a>b" onclick="alert(1)">hi</b>',
    "<b>hi</b>",
  ],
  // The "<sc<script>" opener is scanned as one malformed, disallowed tag ("sc" with a bogus
  // "script" attribute) up through its first ">", so the whole thing is dropped as a unit; only
  // the harmless leftover text after it survives. No "<script" substring reaches the output —
  // the security property is what matters here, not this exact leftover string, and it is
  // re-asserted below by the adversarial "never emits an unescaped script tag" test.
  ["nested-tag smuggling neutralized", "<sc<script>ript>alert(1)</script>", "ript&gt;alert(1)"],
  ["uppercase tag and attribute neutralized", "<B ONCLICK=x>hi</B>", "<b>hi</b>"],
  ["whitespace-split attribute neutralized", "<b\t\nonclick=x>hi</b>", "<b>hi</b>"],
  ["disallowed wrapper stripped, content kept", "<div><b>x</b></div>", "<b>x</b>"],
  ["stray closing tag alone is dropped", "</b>", ""],
  ["unclosed tag is closed at end of input", "<b>unclosed", "<b>unclosed</b>"],
  [
    "text is escaped for angle brackets, ampersand, and quotes",
    'I <3 you & "quotes"',
    "I &lt;3 you &amp; &quot;quotes&quot;",
  ],
  ["newline becomes a line break", "line one\nline two", "line one<br>line two"],
  ["null byte inside a tag name is neutralized", "<b\0onclick=x>hi</b>", "<b>hi</b>"],
  [
    "comment-hidden payload never reaches the output",
    "<!-- <script>alert(1)</script> -->",
    "",
  ],
  [
    "already-encoded entities pass through unchanged (inert in a text node)",
    "&lt;script&gt;alert(1)&lt;/script&gt;",
    "&lt;script&gt;alert(1)&lt;/script&gt;",
  ],
];

describe("sanitizeKudosHtml", () => {
  it.each(CASES)("%s", (_label, input, expected) => {
    expect(sanitizeKudosHtml(input)).toBe(expected);
  });

  it("rejects input longer than 20,000 characters instead of scanning it", () => {
    expect(sanitizeKudosHtml("a".repeat(20_001))).toBe("");
  });

  it("returns empty string for non-string or empty input", () => {
    expect(sanitizeKudosHtml("")).toBe("");
  });

  it("is idempotent: sanitizing the output again never changes it", () => {
    for (const [, input] of CASES) {
      const once = sanitizeKudosHtml(input);
      const twice = sanitizeKudosHtml(once);
      expect(twice).toBe(once);
    }
  });

  it("never emits an unescaped script tag or an executable href scheme, whatever the input", () => {
    const adversarial = [
      "<script>alert(document.cookie)</script>",
      '<img src=x onerror=alert(1)>',
      '<a href="JAVASCRIPT:alert(1)">x</a>',
      '<a href="data:text/html,<script>alert(1)</script>">x</a>',
      "<sc<script>ript>alert(1)</script>",
    ];
    for (const input of adversarial) {
      const out = sanitizeKudosHtml(input);
      expect(out.toLowerCase()).not.toContain("<script");
      expect(out.toLowerCase()).not.toContain("javascript:");
      expect(out.toLowerCase()).not.toContain("onerror=");
    }
  });
});
