import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { AccountMenu } from "@/components/layout/account-menu";
import { NotificationBell, type NotificationItem } from "@/components/layout/notification-bell";
import { SiteNavLink } from "@/components/layout/site-nav-link";
import { LanguageSelector } from "@/components/i18n/language-selector";
import { HEADER_NAV_LINKS } from "@/lib/home/navigation";

/**
 * Top bar — `mms_A_Header` on login (662:14391) and `mms_A1_Header` on the homepage (2167:9091).
 *
 * Login geometry: 1440x80, padding 12px 144px, background rgba(11,15,18,0.8).
 * Homepage geometry: 1512x80, same 12px 144px padding, background rgba(16,20,23,0.8). The 80%
 * alpha matters on both: the key visual runs behind the header and shows through.
 * Homepage adds a nav group 64px right of the logo (three links, 24px apart) and a right-hand
 * cluster 16px apart — notification bell, language selector, account button.
 * The logo is deliberately not a link (test case b9805e65).
 */
export type SiteHeaderProps = {
  /** `minimal` = logo + language only (login). `full` = homepage chrome. Defaults to minimal. */
  variant?: "minimal" | "full";
  /** `/` is public: the bell and account button render only once a session exists (TC ID-0/1). */
  isAuthenticated?: boolean;
  /** Reveals the Admin Dashboard entry inside the account menu. */
  isAdmin?: boolean;
  unreadNotificationCount?: number;
  notifications?: readonly NotificationItem[];
  /** `href` of the nav link to paint in the selected state. */
  activeHref?: string;
};

export async function SiteHeader({
  variant = "minimal",
  isAuthenticated = false,
  isAdmin = false,
  unreadNotificationCount = 0,
  notifications,
  activeHref,
}: SiteHeaderProps = {}) {
  const t = await getTranslations("common");
  const isFull = variant === "full";

  return (
    /* mm:2167:9091 */
    <header
      className={`sticky top-0 z-40 w-full ${isFull ? "bg-surface-header/80" : "h-20 bg-surface-dark/80"}`}
    >
      <div
        className={`flex w-full items-center justify-between gap-2 px-6 py-3 sm:gap-4 md:px-16 lg:px-36 ${
          isFull ? "mx-auto max-w-[1512px]" : "h-full"
        }`}
      >
        {/* mm:I2167:9091;186:2166 */}
        <div className="flex items-center gap-6 lg:gap-16">
          <Image
            src={isFull ? "/images/home/header-logo.png" : "/images/login/saa-logo.png"}
            alt={t("brandAlt")}
            width={52}
            height={48}
            priority
            className="h-auto w-[52px] shrink-0"
          />

          {isFull && (
            /* mm:I2167:9091;178:653 */
            <nav aria-label={t("primaryNavLabel")} className="hidden items-center gap-6 lg:flex">
              {HEADER_NAV_LINKS.map((link) => (
                <SiteNavLink
                  key={link.labelKey}
                  href={link.href}
                  label={t(`nav.${link.labelKey}`)}
                  selected={link.href === activeHref}
                />
              ))}
            </nav>
          )}
        </div>

        {/* mm:I2167:9091;186:1601 */}
        <div className="flex items-center gap-2 sm:gap-4">
          {isFull && isAuthenticated && (
            <NotificationBell unreadCount={unreadNotificationCount} items={notifications} />
          )}
          <LanguageSelector />
          {isFull && isAuthenticated && <AccountMenu isAdmin={isAdmin} />}
        </div>
      </div>

      {isFull && (
        /* The three links do not fit beside the logo below `lg`; they move to their own row. */
        <nav
          aria-label={t("primaryNavLabel")}
          className="flex items-center gap-2 overflow-x-auto px-6 pb-2 md:px-16 lg:hidden"
        >
          {HEADER_NAV_LINKS.map((link) => (
            <SiteNavLink
              key={link.labelKey}
              href={link.href}
              label={t(`nav.${link.labelKey}`)}
              selected={link.href === activeHref}
            />
          ))}
        </nav>
      )}
    </header>
  );
}
