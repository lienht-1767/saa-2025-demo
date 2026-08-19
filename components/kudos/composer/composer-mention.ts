/**
 * `@`-mention detection/insertion against the caret (spec D/D.1, test cases ID-12/13/33). Both
 * functions read/write the caret's own text node only — never `innerHTML` — so the surrounding
 * rich-text markup the toolbar produced is never disturbed.
 */

const MENTION_PATTERN = /@([^\s@]*)$/;

/** Returns the in-progress mention query (text after the nearest preceding unbroken `@`), or `null`. */
export function detectMentionQuery(): string | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  const node = range.startContainer;
  if (node.nodeType !== Node.TEXT_NODE) return null;
  const upToCaret = (node.textContent ?? "").slice(0, range.startOffset);
  const match = upToCaret.match(MENTION_PATTERN);
  return match ? match[1] : null;
}

/** Replaces the `@query` token immediately before the caret with `@Full Name ` and re-collapses the caret after it. */
export function insertMentionAtCaret(name: string): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  const node = range.startContainer;
  if (node.nodeType !== Node.TEXT_NODE) return;
  const text = node.textContent ?? "";
  const offset = range.startOffset;
  const upToCaret = text.slice(0, offset);
  const match = upToCaret.match(MENTION_PATTERN);
  if (!match) return;

  const tokenStart = offset - match[0].length;
  const insertion = `@${name} `;
  node.textContent = text.slice(0, tokenStart) + insertion + text.slice(offset);

  const newOffset = tokenStart + insertion.length;
  const newRange = document.createRange();
  newRange.setStart(node, newOffset);
  newRange.collapse(true);
  selection.removeAllRanges();
  selection.addRange(newRange);
}
