"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { IconBell } from "@/components/ui/icons";
import { useDismissOnOutside } from "@/lib/hooks/use-dismiss-on-outside";

/**
 * `mms_A1.6_Notification` (I2167:9091;186:2101).
 *
 * Figma: a 40x40 transparent button, 4px radius, 10px padding, holding the 24x24 white bell.
 * The unread marker is `Badge/Dot` (I2167:9091;186:2089) — an 8px circle filled #D4271D pinned
 * to the top-right of the button. The dot is present only while something is unread (TC ID-28/29).
 *
 * Presentational only: the panel renders whatever `items` it is handed and falls back to an
 * empty state. The orchestrator supplies real notifications later.
 */
export type NotificationItem = {
  id: string;
  title: string;
  /** Pre-formatted, locale-aware timestamp — this component does no date maths. */
  timestamp?: string;
  read?: boolean;
};

export type NotificationBellProps = {
  /** Drives the unread dot. Zero (the default) hides it. */
  unreadCount?: number;
  items?: readonly NotificationItem[];
};

export function NotificationBell({ unreadCount = 0, items = [] }: NotificationBellProps) {
  const t = useTranslations("common.notifications");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const close = useCallback(() => setOpen(false), []);

  useDismissOnOutside(open, containerRef, close);

  useEffect(() => {
    if (!open) return;

    function restoreFocusOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") triggerRef.current?.focus();
    }

    document.addEventListener("keydown", restoreFocusOnEscape);
    return () => document.removeEventListener("keydown", restoreFocusOnEscape);
  }, [open]);

  const hasUnread = unreadCount > 0;

  return (
    <div ref={containerRef} className="relative shrink-0">
      {/* mm:I2167:9091;186:2101;186:2020 */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={hasUnread ? t("labelWithCount", { count: unreadCount }) : t("label")}
        className="relative flex size-10 cursor-pointer items-center justify-center rounded text-white transition-colors duration-200 after:absolute after:-inset-0.5 after:content-[''] hover:bg-white/10 active:bg-white/15 aria-expanded:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow motion-reduce:transition-none"
      >
        <IconBell className="size-6 shrink-0" />
      </button>

      {hasUnread && (
        /* mm:I2167:9091;186:2101;186:2090 */
        <span
          aria-hidden
          className="pointer-events-none absolute top-[9px] right-[9px] size-2 rounded-full bg-badge-danger"
        />
      )}

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={t("label")}
          className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg bg-surface-dark py-2 shadow-lg ring-1 ring-white/15"
        >
          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-white/70">{t("empty")}</p>
          ) : (
            <ul>
              {items.map((item) => (
                <li key={item.id} role="none">
                  <div
                    role="menuitem"
                    tabIndex={0}
                    className="flex flex-col gap-1 px-4 py-3 text-left text-sm text-white focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-yellow"
                  >
                    <span className={item.read ? "font-normal" : "font-bold"}>{item.title}</span>
                    {item.timestamp && <span className="text-xs text-white/60">{item.timestamp}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
