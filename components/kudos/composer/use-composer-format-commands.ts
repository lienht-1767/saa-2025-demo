"use client";

import { type RefObject, useState } from "react";

import { normalizeElementTree } from "@/components/kudos/composer/composer-html-normalize";

export type ComposerFormatState = { bold: boolean; italic: boolean; strike: boolean; list: boolean };

/** Escapes the dialog's raw input before it is handed to `insertHTML`. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * `execCommand` wrappers for the six toolbar controls (spec C.1–C.6). `execCommand` is
 * deprecated but remains the only zero-dependency way to apply selection formatting in a
 * `contentEditable` across every browser this app targets (phase 07 Key Insights).
 *
 * Which tag a given engine actually emits (`<strike>` vs `<s>`, `<div>` vs `<p>` from
 * `formatBlock`, an unattributed `<a>` vs one carrying `target`/`class`, …) cannot be observed in
 * this environment — no browser is installable here. Rather than depend on that observation,
 * `normalizeElementTree` (a full pass against the server's allowlist, not just the one known
 * `<strike>` case) runs on the live editor node after every command, so the output is correct
 * regardless of which shape the engine produced. `toggleQuote` passes the wrapped `"<blockquote>"`
 * form to `formatBlock`, the shape that works across engines; normalization catches whatever
 * comes out either way. Same for `createLink`: normalization strips everything but `href` off
 * whatever anchor the command created, or drops it if the href isn't `http(s)`.
 *
 * `insertLink` takes the `{ text, url }` pair the `Add link box` dialog (MoMorph `OyDLDuSGEa`)
 * collects. It inserts a whole anchor through `insertHTML` rather than `createLink`, because the
 * design lets the label differ from the destination — `createLink` can only re-label the current
 * selection. Both halves are HTML-escaped before insertion and the tree is normalized after, so
 * the allowlist invariant still holds.
 */
export function useComposerFormatCommands(editorRef: RefObject<HTMLDivElement | null>) {
  const [state, setState] = useState<ComposerFormatState>({ bold: false, italic: false, strike: false, list: false });

  const normalize = () => {
    if (editorRef.current) normalizeElementTree(editorRef.current);
  };

  const refreshState = () => {
    if (typeof document === "undefined" || !document.queryCommandState) return;
    setState({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      strike: document.queryCommandState("strikeThrough"),
      list: document.queryCommandState("insertOrderedList"),
    });
  };

  const runCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    normalize();
    refreshState();
  };

  return {
    state,
    normalize,
    refreshState,
    toggleBold: () => runCommand("bold"),
    toggleItalic: () => runCommand("italic"),
    toggleStrike: () => runCommand("strikeThrough"),
    toggleList: () => runCommand("insertOrderedList"),
    toggleQuote: () => runCommand("formatBlock", "<blockquote>"),
    insertLink: ({ text, url }: { text: string; url: string }) =>
      runCommand("insertHTML", `<a href="${escapeHtml(url)}">${escapeHtml(text)}</a>`),
  };
}
