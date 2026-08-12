"use client";

import { useEffect, type RefObject } from "react";

/**
 * Closes a disclosure when the pointer lands outside `containerRef` or Escape is pressed.
 *
 * The language selector predates this hook and keeps its own copy of the same effect; every
 * disclosure added for the homepage (notification bell, account menu, widget menu) shares this
 * one so the dismissal behaviour stays identical across them — TC ID-30..35.
 */
export function useDismissOnOutside(
  open: boolean,
  containerRef: RefObject<HTMLElement | null>,
  onDismiss: () => void,
) {
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) onDismiss();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onDismiss();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, containerRef, onDismiss]);
}
