import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { LanguageSelector } from "@/components/i18n/language-selector";

/**
 * Top bar — `mms_A_Header` (662:14391).
 *
 * Figma: 1440x80, padding 12px 144px, background rgba(11,15,18,0.8). The 80% alpha matters:
 * the key visual runs behind the header and shows through, so this must stay translucent.
 * Logo frame is 52x56 at x=144; the selector frame is 108x56 ending at x=1296.
 * The logo is deliberately not a link (test case b9805e65).
 */
export async function SiteHeader() {
  const t = await getTranslations("common");

  return (
    <header className="sticky top-0 z-40 h-20 w-full bg-surface-dark/80">
      <div className="flex h-full w-full items-center justify-between px-6 py-3 md:px-16 lg:px-36">
        <Image
          src="/images/login/saa-logo.png"
          alt={t("brandAlt")}
          width={52}
          height={48}
          priority
          className="h-auto w-[52px]"
        />
        <LanguageSelector />
      </div>
    </header>
  );
}
