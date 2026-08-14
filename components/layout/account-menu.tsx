"use client";

import Link from "next/link";
import { useCallback, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { IconUser } from "@/components/ui/icons";
import { ACCOUNT_LINKS } from "@/lib/home/navigation";
import { useDismissOnOutside } from "@/lib/hooks/use-dismiss-on-outside";
import { useMenuKeyboardNavigation } from "@/lib/hooks/use-menu-keyboard-navigation";

/**
 * `mms_A1.8_Button-IC` (I2167:9091;186:1597).
 *
 * Figma: 40x40, 4px radius, 1px #998C5F border, transparent fill, holding the 24x24 white user
 * glyph. The design shows only the trigger; the menu items come from the confirmed decisions in
 * `clarifications.md` — Profile for everyone, Admin Dashboard for admins only (TC ID-5/6/36–38).
 *
 * Sign-out is intentionally absent: it needs a Server Action the orchestrator owns. Pass
 * `onSignOut` once that exists and the item appears.
 */
export type AccountMenuProps = {
  /** Reveals the Admin Dashboard entry. */
  isAdmin?: boolean;
  /** Optional display name shown above the links. */
  displayName?: string;
  /** Server Action (or client callback) that ends the session. Omit and the item is hidden. */
  onSignOut?: () => void | Promise<void>;
};

const ITEM_CLASS =
  "block w-full cursor-pointer px-4 py-2.5 text-left text-sm text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-yellow motion-reduce:transition-none";

export function AccountMenu({ isAdmin = false, displayName, onSignOut }: AccountMenuProps) {
  const t = useTranslations("common.account");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const menuId = useId();
  const close = useCallback(() => setOpen(false), []);

  useDismissOnOutside(open, containerRef, close);

  const handleMenuKeyDown = useMenuKeyboardNavigation(open, menuRef, triggerRef, close);

  return (
    <div ref={containerRef} className="relative shrink-0">
      {/* mm:I2167:9091;186:1597 */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={t("label")}
        className="relative flex size-10 cursor-pointer items-center justify-center rounded border border-accent-border text-white transition-colors duration-200 after:absolute after:-inset-0.5 after:content-[''] hover:bg-white/10 active:bg-white/15 aria-expanded:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow motion-reduce:transition-none"
      >
        <IconUser className="size-6 shrink-0" />
      </button>

      {open && (
        <ul
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={t("label")}
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 z-50 mt-2 min-w-52 overflow-hidden rounded-lg bg-surface-dark py-1 shadow-lg ring-1 ring-white/15"
        >
          {displayName && (
            <li role="none" className="truncate px-4 py-2 text-xs text-white/60">
              {displayName}
            </li>
          )}
          <li role="none">
            <Link href={ACCOUNT_LINKS.profile} role="menuitem" onClick={close} className={ITEM_CLASS}>
              {t("profile")}
            </Link>
          </li>
          {isAdmin && (
            <li role="none">
              <Link href={ACCOUNT_LINKS.admin} role="menuitem" onClick={close} className={ITEM_CLASS}>
                {t("adminDashboard")}
              </Link>
            </li>
          )}
          {onSignOut && (
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  close();
                  void onSignOut();
                }}
                className={ITEM_CLASS}
              >
                {t("signOut")}
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
