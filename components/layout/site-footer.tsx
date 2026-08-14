import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { SiteNavLink } from "@/components/layout/site-nav-link";
import { FOOTER_NAV_LINKS } from "@/lib/home/navigation";

/**
 * Bottom bar — `mms_D_Footer` on login (662:14447), `mms_7_Footer` on the homepage (5001:14800).
 *
 * Login geometry: 1440x91, padding 40px 90px, border-top 1px #2E3940, copyright centred.
 * Homepage geometry: 1512 wide, same 40px 90px padding and border, `space-between` with the
 * 69x64 logo and a 48px-spaced nav group on the left (80px apart) and the copyright on the right.
 * The copy is Montserrat *Alternates* 700, 16px/24px (I5001:14800;342:1413). Non-interactive per
 * test case 33a1dacf.
 */
export type SiteFooterProps = {
  /** `minimal` = copyright only (login). `full` = logo + nav + copyright. Defaults to minimal. */
  variant?: "minimal" | "full";
  /** `href` of the nav link to paint in the selected state. */
  activeHref?: string;
};

export async function SiteFooter({ variant = "minimal", activeHref }: SiteFooterProps = {}) {
  const t = await getTranslations("common");

  if (variant === "minimal") {
    return (
      <footer className="flex w-full shrink-0 items-center justify-center border-t border-divider bg-canvas px-6 py-6 select-none md:h-[91px] md:px-[90px] md:py-0">
        <p className="text-center text-base leading-6 font-bold text-white font-[family-name:var(--font-alt)]">
          {t("copyright")}
        </p>
      </footer>
    );
  }

  return (
    /* mm:5001:14800 */
    <footer className="w-full shrink-0 border-t border-divider bg-canvas">
      <div className="mx-auto flex w-full max-w-[1512px] flex-col items-center justify-between gap-6 px-6 py-10 md:px-[90px] lg:flex-row lg:gap-0">
        {/* mm:I5001:14800;342:1407 */}
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:gap-20">
          {/* mm:I5001:14800;342:1408 */}
          <Image
            src="/images/home/footer-logo.png"
            alt={t("brandAlt")}
            width={69}
            height={64}
            className="h-16 w-[69px] shrink-0"
          />

          {/* mm:I5001:14800;342:1409 */}
          <nav
            aria-label={t("footerNavLabel")}
            className="flex flex-wrap items-center justify-center gap-2 lg:gap-12"
          >
            {FOOTER_NAV_LINKS.map((link) => (
              <SiteNavLink
                key={link.labelKey}
                href={link.href}
                label={t(`nav.${link.labelKey}`)}
                selected={link.href === activeHref}
                size="md"
              />
            ))}
          </nav>
        </div>

        {/* mm:I5001:14800;342:1413 */}
        <p className="text-center text-base leading-6 font-bold text-white select-none font-[family-name:var(--font-alt)]">
          {t("copyright")}
        </p>
      </div>
    </footer>
  );
}
