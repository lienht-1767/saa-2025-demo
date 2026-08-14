"use client";

import { useCallback, useEffect, type KeyboardEvent, type RefObject } from "react";

const MENU_ITEM_SELECTOR = '[role="menuitem"], [role="menuitemradio"]';

/** Implements the WAI-ARIA menu focus loop shared by the three header popovers. */
export function useMenuKeyboardNavigation(
  open: boolean,
  menuRef: RefObject<HTMLElement | null>,
  triggerRef: RefObject<HTMLButtonElement | null>,
  close: () => void,
) {
  const focusItem = useCallback(
    (position: "first" | "last" | "next" | "previous") => {
      const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR) ?? []);
      if (items.length === 0) return;

      const currentIndex = items.indexOf(document.activeElement as HTMLElement);
      const index =
        position === "first"
          ? 0
          : position === "last"
            ? items.length - 1
            : position === "next"
              ? (currentIndex + 1 + items.length) % items.length
              : (currentIndex - 1 + items.length) % items.length;
      items[index]?.focus();
    },
    [menuRef],
  );

  useEffect(() => {
    if (!open) return;
    focusItem("first");

    function handleDocumentKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close();
      triggerRef.current?.focus();
    }

    document.addEventListener("keydown", handleDocumentKeyDown);
    return () => document.removeEventListener("keydown", handleDocumentKeyDown);
  }, [close, focusItem, open, triggerRef]);

  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const action = {
        ArrowDown: "next",
        ArrowUp: "previous",
        Home: "first",
        End: "last",
      }[event.key] as "first" | "last" | "next" | "previous" | undefined;

      if (action) {
        event.preventDefault();
        focusItem(action);
      } else if (event.key === "Tab") {
        close();
      }
    },
    [close, focusItem],
  );
}
