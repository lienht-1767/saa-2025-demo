"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TOAST_DURATION_MS = 3000;

export type CopyLinkStatus = "idle" | "copied" | "error";

export type CopyLinkState = {
  status: CopyLinkStatus;
  copy: (url: string) => void;
};

/**
 * Backs the "Copy Link" action on both the HIGHLIGHT carousel card and the ALL KUDOS feed card.
 * Writes to the clipboard and reports success/failure as `status`, auto-resetting to "idle" after
 * a few seconds so the caller can render a transient toast ("Link copied — ready to share!").
 * The clipboard write is the only async operation here, and its rejection is surfaced as `"error"`
 * rather than swallowed, since the user otherwise has no way to tell the copy failed.
 */
export function useCopyLink(): CopyLinkState {
  const [status, setStatus] = useState<CopyLinkStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const copy = useCallback((url: string) => {
    clearTimeout(timeoutRef.current);
    const shareUrl = new URL(url, window.location.origin).toString();

    navigator.clipboard
      .writeText(shareUrl)
      .then(() => setStatus("copied"))
      .catch(() => setStatus("error"));

    timeoutRef.current = setTimeout(() => setStatus("idle"), TOAST_DURATION_MS);
  }, []);

  return { status, copy };
}
