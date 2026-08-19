/**
 * Generalizes the phase-07 `<strike>` fix into a full normalization pass over whatever markup
 * `execCommand`/paste produced, so the editor's output no longer depends on knowing which tag a
 * given browser engine happens to emit (which cannot be observed in this environment — see
 * clarifications.md follow-up). Mirrors the server allowlist in `lib/kudos/sanitize-kudos-html.ts`
 * (`b, strong, i, em, s, ol, li, a, blockquote, p, br`) so the invariant
 * `sanitizeKudosHtml(normalize(x)) === normalize(x)` holds for any input, not just the one case
 * that was previously known.
 *
 * Rules, applied bottom-up so an already-fixed child is never re-broken by its parent's fix:
 * - `<strike>` → `<s>`
 * - `<div>` → `<p>` (several engines emit block-level `div` from `formatBlock`)
 * - `<u>`, `<span>`, `<font>` → unwrap (drop the element and its attributes, keep the text/children)
 * - `<ul>` → each `<li>` becomes its own `<p>`, the `<ul>` wrapper is dropped (never silently
 *   turned into `<ol>` — that would misrepresent an unordered list as numbered)
 * - `<a>` → rebuilt down to `href` plus the fixed `rel="noopener noreferrer nofollow"
 *   target="_blank"` pair the server always injects for a valid link (see `normalizeAnchor`);
 *   drops the tag entirely (keeping its text) when `href` is not `^https?://`, mirroring the
 *   server's scheme check exactly
 * - any other allowed tag → attributes stripped (the server never preserves them either)
 * - anything else → unwrap (matches the server: an unrecognized tag is skipped, its content kept)
 *
 * This is a UX/data-integrity measure, not a security control — `sanitizeKudosHtml` remains the
 * only trust boundary (phase 07 Security Considerations).
 */

const ALLOWED_TAGS = new Set(["b", "strong", "i", "em", "s", "ol", "li", "a", "blockquote", "p", "br"]);
const HTTP_HREF = /^https?:\/\//i;

function stripAttributesExcept(el: Element, keep: readonly string[]): void {
  Array.from(el.attributes).forEach((attr) => {
    if (!keep.includes(attr.name)) el.removeAttribute(attr.name);
  });
}

function unwrapElement(el: Element): void {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) parent.insertBefore(el.firstChild, el);
  parent.removeChild(el);
}

function renameTag(el: Element, tagName: string): void {
  const replacement = el.ownerDocument.createElement(tagName);
  while (el.firstChild) replacement.appendChild(el.firstChild);
  el.replaceWith(replacement);
}

function unwrapUnorderedList(el: Element): void {
  const parent = el.parentNode;
  if (!parent) return;
  Array.from(el.children).forEach((item) => {
    if (item.tagName.toLowerCase() !== "li") {
      unwrapElement(item);
      return;
    }
    const paragraph = el.ownerDocument.createElement("p");
    while (item.firstChild) paragraph.appendChild(item.firstChild);
    parent.insertBefore(paragraph, el);
  });
  parent.removeChild(el);
}

/**
 * Rebuilds the anchor into the server's exact canonical shape (`href` + the fixed
 * `rel`/`target` pair `sanitizeKudosHtml` always injects for a valid link — see
 * `buildAnchorOpenTag` in `sanitize-kudos-html-tag-parser.ts`), not just "strip other
 * attributes": that fixed pair is unconditional server-side, so anything short of it would fail
 * the `sanitizeKudosHtml(normalize(x)) === normalize(x)` round-trip on a fresh `createLink` anchor
 * (which never carries `rel`/`target` on its own). Drops the tag entirely when the href isn't
 * `http(s)`, mirroring the server's scheme check.
 */
function normalizeAnchor(el: Element): void {
  const raw = el.getAttribute("href") ?? "";
  const cleaned = raw.replace(/[\t\r\n]/g, "").trim();
  if (!HTTP_HREF.test(cleaned)) {
    unwrapElement(el);
    return;
  }
  const replacement = el.ownerDocument.createElement("a");
  replacement.setAttribute("href", cleaned);
  replacement.setAttribute("rel", "noopener noreferrer nofollow");
  replacement.setAttribute("target", "_blank");
  while (el.firstChild) replacement.appendChild(el.firstChild);
  el.replaceWith(replacement);
}

function transformElement(el: Element): void {
  const name = el.tagName.toLowerCase();
  if (name === "strike") return renameTag(el, "s");
  if (name === "div") return renameTag(el, "p");
  if (name === "u" || name === "span" || name === "font") return unwrapElement(el);
  if (name === "ul") return unwrapUnorderedList(el);
  if (name === "a") return normalizeAnchor(el);
  if (ALLOWED_TAGS.has(name)) return stripAttributesExcept(el, []);
  unwrapElement(el);
}

function normalizeElement(el: Element): void {
  // Post-order: fix every descendant first, so `transformElement(el)` (e.g. unwrapping a `<ul>`
  // into `<p>`s) only ever moves already-normalized nodes around, never re-introduces a raw tag.
  Array.from(el.children).forEach((child) => normalizeElement(child));
  transformElement(el);
}

/** Mutates `root`'s descendants in place — used directly on the live editor node so an unrelated
 * keystroke's caret position is disturbed as little as possible (only nodes that actually need
 * fixing are touched; most input produces no disallowed shape and this is a no-op walk). */
export function normalizeElementTree(root: Element): void {
  Array.from(root.children).forEach((child) => normalizeElement(child));
}

/** Pure string-in/string-out form for the read-at-submit safety net and for unit testing. */
export function normalizeComposerHtml(html: string): string {
  if (typeof document === "undefined") return html;
  const container = document.createElement("div");
  container.innerHTML = html;
  normalizeElementTree(container);
  return container.innerHTML;
}
