"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import type { KudosFilterOption } from "@/lib/kudos/types";

/**
 * Catalog dropdown opened by "+ Hashtag" (spec E.1). Lists `hashtags` the board already passed
 * down (`boardData.highlight.hashtagFilters`) minus whatever is already chosen — no new query,
 * no tag creation (clarifications decision 7).
 */
export function KudosComposerHashtagMenu({
  options,
  onSelect,
  onClose,
  triggerRef,
}: {
  options: readonly KudosFilterOption[];
  onSelect: (id: string) => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const t = useTranslations("kudosBoard.composer");
  const menuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current?.contains(event.target as Node) || triggerRef.current?.contains(event.target as Node)) return;
      onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, triggerRef]);

  return (
    <ul
      ref={menuRef}
      role="listbox"
      className="absolute top-full left-0 z-30 mt-2 max-h-56 w-56 overflow-y-auto rounded-lg border border-accent-border bg-white p-2 shadow-xl"
    >
      {options.length === 0 && <li className="px-3 py-2 text-sm text-kudos-muted">{t("hashtagMenuEmpty")}</li>}
      {options.map((option) => (
        <li key={option.id} role="option" aria-selected={false}>
          <button
            type="button"
            onClick={() => {
              onSelect(option.id);
              onClose();
              triggerRef.current?.focus();
            }}
            className="w-full rounded-md px-3 py-2 text-left font-bold text-ink hover:bg-kudos-card"
          >
            {option.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
