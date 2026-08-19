import {
  handleClosingTag,
  handleOpeningTag,
  tryParseCommentOrDeclaration,
} from "@/lib/kudos/sanitize-kudos-html-tag-parser";

/**
 * Hand-rolled allowlist HTML sanitizer for kudos rich-text content (plan
 * 260819-0351-viet-kudo-composer, phase 03). No DOM API and no dependency: this runs inside a
 * Next.js server action, and adding a parser package was ruled out (clarifications.md).
 *
 * This is the trust boundary for everything the board later renders via
 * `dangerouslySetInnerHTML` (phase 05) — a defect here is stored XSS for every viewer. The
 * safety property that makes a hand-written tokenizer defensible: the output is **re-serialized
 * from parsed tokens**, assembled only from the fixed literal tag strings (in
 * `sanitize-kudos-html-tag-parser.ts`) plus escaped text. The one deliberate exception is a
 * validated `<a href>` value, which is decoded, scheme-checked against an allowlist, then
 * re-escaped before being written back out — never copied through unexamined. Anything the
 * tokenizer does not positively recognize is escaped to text (fail-closed): novel markup
 * degrades to visible text, never to executed markup.
 *
 * Legacy rows hold plain text with `\n` line breaks, not HTML — running this same function over
 * them turns those newlines into `<br>`, so one sanitizer covers both eras with no "is this
 * legacy?" branch.
 */

const MAX_INPUT_LENGTH = 20_000;

/** Recognizes only the four entities this module itself ever emits in text, so re-sanitizing an
 * already-sanitized string never double-escapes its own output (the idempotence contract). */
const OWN_TEXT_ENTITY = /^&(amp|lt|gt|quot);/i;

function nextTextToken(input: string, i: number): { text: string; length: number } {
  const ch = input[i];
  if (ch === "&") {
    const m = OWN_TEXT_ENTITY.exec(input.slice(i, i + 6));
    if (m) return { text: m[0], length: m[0].length };
    return { text: "&amp;", length: 1 };
  }
  if (ch === "<") return { text: "&lt;", length: 1 };
  if (ch === ">") return { text: "&gt;", length: 1 };
  if (ch === '"') return { text: "&quot;", length: 1 };
  if (ch === "\n") return { text: "<br>", length: 1 };
  if (ch === "\0") return { text: "", length: 1 };
  return { text: ch, length: 1 };
}

/** Sanitizes rich-text kudos HTML down to the fixed allowlist, re-serializing from parsed
 * tokens. Called on both the write path (before storing `kudos.message`) and the read path
 * (before rendering any stored message, legacy or new) — see the plan's phase-03 architecture. */
export function sanitizeKudosHtml(input: string): string {
  if (typeof input !== "string" || input.length === 0) return "";
  if (input.length > MAX_INPUT_LENGTH) return "";

  const stack: string[] = [];
  let out = "";
  let i = 0;
  const len = input.length;

  while (i < len) {
    if (input[i] === "<") {
      const skip = tryParseCommentOrDeclaration(input, i);
      const tag = skip ?? (input[i + 1] === "/" ? handleClosingTag(input, i, stack) : handleOpeningTag(input, i, stack));
      if (tag) {
        out += tag.emit;
        i = tag.next;
        continue;
      }
      out += "&lt;";
      i += 1;
      continue;
    }
    const token = nextTextToken(input, i);
    out += token.text;
    i += token.length;
  }

  while (stack.length > 0) out += `</${stack.pop()}>`;
  return out;
}
