"use client";

import { useCallback, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { IconChevronDown } from "@/components/kudos/kudos-icons";
import { useDismissOnOutside } from "@/lib/hooks/use-dismiss-on-outside";
import { useMenuKeyboardNavigation } from "@/lib/hooks/use-menu-keyboard-navigation";
import type { KudosFilterOption } from "@/lib/kudos/types";

/**
 * `B.1.1_ButtonHashtag` / `B.1.2_Button Phong ban` (nodes `2940:13459` / `2940:13460`) — a
 * single-select dropdown filter, 16px padding, 1px accent-border, 4px radius, chevron-down icon.
 * Selecting an option re-filters both the highlight carousel and the all-kudos feed (spec B.1),
 * which needs a data refetch, so the actual filtering stays an optional no-op callback here.
 */
export type KudosFilterDropdownProps = {
  label: string;
  options: readonly KudosFilterOption[];
  selectedId: string | null;
  triggerClassName?: string;
  onSelect?: (optionId: string | null) => void;
};

export function KudosFilterDropdown({ label, options, selectedId, triggerClassName = "", onSelect }: KudosFilterDropdownProps) {
  const t = useTranslations("kudosBoard.highlight");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const menuId = useId();
  const close = useCallback(() => setOpen(false), []);

  useDismissOnOutside(open, containerRef, close);
  const handleMenuKeyDown = useMenuKeyboardNavigation(open, menuRef, triggerRef, close);

  const selectedOption = options.find((option) => option.id === selectedId) ?? null;

  function choose(optionId: string | null) {
    onSelect?.(optionId);
    close();
  }

  return (
    /* mm:2940:13459 */
    <div ref={containerRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className={`flex items-center gap-2 rounded border border-accent-border bg-brand-yellow/10 p-4 text-base leading-6 font-bold tracking-[0.15px] text-white hover:bg-brand-yellow/20 aria-expanded:bg-brand-yellow/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow ${triggerClassName}`}
      >
        <span className="min-w-0 flex-1 truncate text-left">{selectedOption?.label ?? label}</span>
        <IconChevronDown className="size-6 shrink-0" />
      </button>

      {open && (
        <ul
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 z-50 mt-2 max-h-64 min-w-full max-w-72 overflow-y-auto rounded-lg bg-surface-dark py-1 shadow-lg ring-1 ring-white/15"
        >
          <li role="none">
            <button
              type="button"
              role="menuitemradio"
              aria-checked={selectedId === null}
              onClick={() => choose(null)}
              className="block w-full cursor-pointer px-4 py-2.5 text-left text-sm text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-yellow"
            >
              {t("clearFilter")}
            </button>
          </li>
          {options.map((option) => (
            <li key={option.id} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={option.id === selectedId}
                onClick={() => choose(option.id)}
                className="block w-full cursor-pointer px-4 py-2.5 text-left text-sm text-white hover:bg-white/10 aria-checked:text-brand-yellow focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-yellow"
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
