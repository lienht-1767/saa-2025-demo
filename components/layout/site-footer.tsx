import { getTranslations } from "next-intl/server";

/**
 * Copyright bar — `mms_D_Footer` (662:14447).
 *
 * Figma: 1440x91, padding 40px 90px, border-top 1px #2E3940, sitting on the key visual's
 * base colour. The copy is Montserrat *Alternates* 700, 16px/24px, centred
 * (I662:14447;342:1413). Non-interactive per test case 33a1dacf.
 */
export async function SiteFooter() {
  const t = await getTranslations("common");

  return (
    <footer className="flex w-full shrink-0 items-center justify-center border-t border-divider bg-canvas px-6 py-6 select-none md:h-[91px] md:px-[90px] md:py-0">
      <p className="text-center text-base leading-6 font-bold text-white font-[family-name:var(--font-alt)]">
        {t("copyright")}
      </p>
    </footer>
  );
}
