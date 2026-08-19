"use client";

import Link from "next/link";
import { useCallback, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { IconChevronRight } from "@/components/kudos/kudos-icons";
import { IconGrid, IconUser } from "@/components/ui/icons";
import { ACCOUNT_LINKS } from "@/lib/home/navigation";
import { useDismissOnOutside } from "@/lib/hooks/use-dismiss-on-outside";
import { useMenuKeyboardNavigation } from "@/lib/hooks/use-menu-keyboard-navigation";

/**
 * Trigger `mms_A1.8_Button-IC` (I2167:9091;186:1597); menu `mms_A_Dropdown-List` on MoMorph
 * `z4sCl3_Qtk` (Figma `666:9601`) and its admin variant `54rekaCHG1` (`666:9728`).
 *
 * Trigger: 40x40, 4px radius, 1px `--accent-border`, transparent fill, 24x24 white user glyph.
 * Menu: 6px padding, 8px radius, `--kudos-sidebar-surface` (#00070C) fill, 1px `--accent-border`.
 * Each row is 56px tall with 16px padding, 4px gap, 4px radius, a 16/24 700 label, and its glyph
 * on the right — Profile a user mark, Dashboard a grid, Logout a right chevron. The active row
 * (Profile while the viewer is on their own profile) takes the 10% brand-yellow fill and the
 * `0 4px 4px rgba(0,0,0,.25), 0 0 6px #FAE287` glow from the design. Dashboard is admin-only
 * (TC ID-36..38); Logout is always present (`666:9278` — no confirmation step).
 */
export type AccountMenuProps = {
  /** Reveals the Dashboard entry. */
  isAdmin?: boolean;
  /** Optional display name shown above the links. */
  displayName?: string;
  /** `/profile/{id}` for the signed-in viewer. Falls back to the static `/profile` entry. */
  profileHref?: string;
  /** Paints the Profile row in its active state. */
  profileActive?: boolean;
  /** Server Action (or client callback) that ends the session. */
  onSignOut?: () => void | Promise<void>;
};

const ITEM_CLASS =
  "flex h-14 w-full cursor-pointer items-center justify-between gap-1 rounded p-4 text-left text-base leading-6 font-bold tracking-[0.15px] whitespace-nowrap text-white transition-colors duration-200 hover:bg-brand-yellow/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-yellow motion-reduce:transition-none";

const ITEM_ACTIVE_CLASS =
  "bg-brand-yellow/10 [text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287]";

export function AccountMenu({
  isAdmin = false,
  displayName,
  profileHref,
  profileActive = false,
  onSignOut,
}: AccountMenuProps) {
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
        /* mm:666:9601 */
        <ul
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={t("label")}
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 z-50 mt-2 flex min-w-52 flex-col rounded-lg border border-accent-border bg-kudos-sidebar-surface p-1.5 shadow-lg"
        >
          {displayName && (
            <li role="none" className="truncate px-4 py-2 text-xs text-white/60">
              {displayName}
            </li>
          )}
          {/* mm:I666:9601;563:7844 */}
          <li role="none">
            <Link
              href={profileHref ?? ACCOUNT_LINKS.profile}
              role="menuitem"
              aria-current={profileActive ? "page" : undefined}
              onClick={close}
              className={`${ITEM_CLASS} ${profileActive ? ITEM_ACTIVE_CLASS : ""}`}
            >
              {t("profile")}
              <IconUser className="size-6 shrink-0" />
            </Link>
          </li>
          {isAdmin && (
            /* mm:I666:9728;666:9452 */
            <li role="none">
              <Link href={ACCOUNT_LINKS.admin} role="menuitem" onClick={close} className={ITEM_CLASS}>
                {t("adminDashboard")}
                <IconGrid className="size-6 shrink-0" />
              </Link>
            </li>
          )}
          {/* mm:I666:9601;563:7868 */}
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
                <IconChevronRight className="size-6 shrink-0" />
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
