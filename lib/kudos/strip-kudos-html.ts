import { decodeHtmlEntities } from "@/lib/kudos/html-entities";

/**
 * Reduces kudos rich-text HTML (or legacy plain text) to plain text, for `alt` attributes and
 * feed/card previews (plan 260819-0351-viet-kudo-composer, phase 03). Unlike
 * `sanitizeKudosHtml`, the result is never re-inserted as HTML — it is always rendered as React
 * text — so entities are fully decoded here rather than re-escaped.
 *
 * Reuses `decodeHtmlEntities` from `sanitize-kudos-html.ts` (DRY) rather than duplicating an
 * entity table; both modules stay dependency-free of any external package either way.
 */

const MAX_INPUT_LENGTH = 20_000;

/** Matches the *word* of a tag right after `<` — a leading `/` plus letters — ignoring any
 * attributes, so `<br class="x">` and `</p title="y">` are still recognized correctly. */
function tagWord(input: string, openIndex: number): string {
  const match = /^\/?[a-zA-Z]+/.exec(input.slice(openIndex + 1));
  return match ? match[0].toLowerCase() : "";
}

/** `<br>`, `</p>`, and `</li>` are the only tags the spec calls out to become a collapsible
 * space; every other tag is simply removed with no space inserted in its place. */
function isSpacingTag(word: string): boolean {
  return word === "br" || word === "/p" || word === "/li";
}

export function stripKudosHtml(input: string): string {
  if (typeof input !== "string" || input.length === 0) return "";
  if (input.length > MAX_INPUT_LENGTH) return "";

  let buffer = "";
  let i = 0;
  const len = input.length;

  while (i < len) {
    if (input[i] !== "<") {
      buffer += input[i];
      i += 1;
      continue;
    }
    const word = tagWord(input, i);
    if (isSpacingTag(word)) buffer += " ";
    let j = i + 1;
    let quote: string | null = null;
    while (j < len) {
      const ch = input[j];
      if (quote) {
        if (ch === quote) quote = null;
      } else if (ch === '"' || ch === "'") {
        quote = ch;
      } else if (ch === ">") {
        j += 1;
        break;
      }
      j += 1;
    }
    i = j;
  }

  return decodeHtmlEntities(buffer).replace(/\s+/g, " ").trim();
}
