import { decodeHtmlEntities } from "@/lib/kudos/html-entities";

/**
 * Tag-level tokenizing helpers for `sanitize-kudos-html.ts`, split out to keep both files under
 * the 200-line limit. This module owns everything that recognizes and reserializes one tag —
 * comments/declarations, quote-aware attribute scanning, and opening/closing-tag emission.
 * `sanitize-kudos-html.ts` keeps the top-level scan loop and text-node escaping.
 */

export const ALLOWED_TAGS = new Set([
  "b",
  "strong",
  "i",
  "em",
  "s",
  "ol",
  "li",
  "a",
  "blockquote",
  "p",
  "br",
]);

export type TagResult = { next: number; emit: string };

export function tryParseCommentOrDeclaration(input: string, i: number): TagResult | null {
  if (input.startsWith("<!--", i)) {
    const end = input.indexOf("-->", i + 4);
    return { next: end === -1 ? input.length : end + 3, emit: "" };
  }
  const c1 = input[i + 1];
  if (c1 === "!" || c1 === "?") {
    const end = input.indexOf(">", i + 1);
    return { next: end === -1 ? input.length : end + 1, emit: "" };
  }
  return null;
}

/** Quote-aware scan for one tag's attributes, from just after its name to its closing `>`. Used
 * for both opening and closing tags so a `>` inside a quoted value never ends the tag early. */
function parseAttributes(input: string, pos: number): { attrs: Map<string, string>; end: number } | null {
  const attrs = new Map<string, string>();
  const len = input.length;
  let i = pos;
  while (i < len) {
    const ch = input[i];
    if (ch === ">") return { attrs, end: i };
    if (ch === "/" || /\s/.test(ch)) {
      i += 1;
      continue;
    }
    const nameStart = i;
    while (i < len && /[a-zA-Z0-9\-_:]/.test(input[i])) i += 1;
    if (i === nameStart) {
      i += 1; // stray byte (e.g. a null) inside a tag — skip defensively, keep scanning
      continue;
    }
    const attrName = input.slice(nameStart, i).toLowerCase();
    while (i < len && /\s/.test(input[i])) i += 1;
    let value = "";
    if (input[i] === "=") {
      i += 1;
      while (i < len && /\s/.test(input[i])) i += 1;
      const quote = input[i];
      if (quote === '"' || quote === "'") {
        i += 1;
        const valStart = i;
        while (i < len && input[i] !== quote) i += 1;
        if (i >= len) return null; // unterminated quoted value: whole tag is unterminated
        value = input.slice(valStart, i);
        i += 1;
      } else {
        const valStart = i;
        while (i < len && !/[\s>]/.test(input[i])) i += 1;
        value = input.slice(valStart, i);
      }
    }
    if (!attrs.has(attrName)) attrs.set(attrName, value);
  }
  return null; // reached end of input without a closing '>'
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildAnchorOpenTag(attrs: Map<string, string>): string {
  const href = attrs.get("href");
  if (href === undefined) return "<a>";
  const cleaned = decodeHtmlEntities(href).replace(/[\t\r\n]/g, "").trim();
  if (!/^https?:\/\//i.test(cleaned)) return "<a>";
  return `<a href="${escapeAttr(cleaned)}" rel="noopener noreferrer nofollow" target="_blank">`;
}

export function handleClosingTag(input: string, i: number, stack: string[]): TagResult | null {
  const len = input.length;
  let j = i + 2;
  const nameStart = j;
  while (j < len && /[a-zA-Z0-9-]/.test(input[j])) j += 1;
  if (j === nameStart) return null;
  const name = input.slice(nameStart, j).toLowerCase();
  const parsed = parseAttributes(input, j);
  if (!parsed) return { next: len, emit: "" };
  const next = parsed.end + 1;
  const stackIdx = stack.lastIndexOf(name);
  if (stackIdx === -1) return { next, emit: "" }; // unmatched closing tag — dropped
  const closing = stack.splice(stackIdx).reverse();
  return { next, emit: closing.map((tag) => `</${tag}>`).join("") };
}

export function handleOpeningTag(input: string, i: number, stack: string[]): TagResult | null {
  const len = input.length;
  const first = input[i + 1];
  if (!first || !/[a-zA-Z]/.test(first)) return null;
  let j = i + 1;
  while (j < len && /[a-zA-Z0-9-]/.test(input[j])) j += 1;
  const name = input.slice(i + 1, j).toLowerCase();
  const parsed = parseAttributes(input, j);
  if (!parsed) return { next: len, emit: "" };
  const next = parsed.end + 1;
  if (!ALLOWED_TAGS.has(name)) return { next, emit: "" }; // disallowed tag — skipped, content kept
  if (name === "br") return { next, emit: "<br>" };
  if (name === "a") {
    stack.push("a");
    return { next, emit: buildAnchorOpenTag(parsed.attrs) };
  }
  stack.push(name);
  return { next, emit: `<${name}>` };
}
