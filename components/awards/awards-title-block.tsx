import { getTranslations } from "next-intl/server";

/**
 * `mms_A_Title hệ thống giải thưởng` (313:8453) — the caption over a 1px `Rectangle 26` rule
 * over the gold heading. Same type scale as `components/home/awards-section.tsx`'s C1 header,
 * but centred as a standalone block rather than left-aligned inside a full-width column, per
 * the render (this screen has no wider section for it to sit flush against).
 */
export async function AwardsTitleBlock() {
  const t = await getTranslations("awards.page");

  return (
    /* mm:313:8453 */
    <div className="mx-auto flex w-full max-w-[1152px] flex-col items-center gap-4 text-center">
      <p className="text-2xl leading-8 font-bold text-white">{t("caption")}</p>
      {/* mm:313:8455 */}
      <hr className="h-px w-full border-0 bg-divider" />
      <h1 className="text-3xl leading-tight font-bold tracking-[-0.25px] text-brand-yellow sm:text-4xl lg:text-[57px] lg:leading-16">
        {t("title")}
      </h1>
    </div>
  );
}
