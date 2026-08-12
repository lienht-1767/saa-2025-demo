import { useTranslations } from "next-intl";

import { AwardCard } from "@/components/home/award-card";
import { AWARD_CARDS } from "@/lib/home/awards";

/**
 * `Hệ thống giải thưởng` (2167:9068) — the C1 header 80px above the C2 grid.
 *
 * C1 (2167:9069), 16px apart: the "Sun* annual awards 2025" caption at 24px/32px 700 white,
 * a 1px #2E3940 rule across the full 1224px gutter, then the 57px/64px 700 #FFEA9E title with
 * -0.25px letter-spacing.
 *
 * C2 (5005:14974): two rows of three 336px cards. The design uses `space-between` across 1224px,
 * which resolves to a 108px column gap; rows are 80px apart. Tablet and mobile drop to two
 * columns per the spec.
 */
export function AwardsSection() {
  const t = useTranslations("home.awards");

  return (
    /* mm:2167:9068 */
    <section id="awards" aria-labelledby="awards-heading" className="flex w-full flex-col gap-12 lg:gap-20">
      {/* mm:2167:9069 */}
      <div className="flex flex-col gap-4">
        <p className="text-2xl leading-8 font-bold text-white">{t("caption")}</p>
        {/* mm:2167:9071 */}
        <hr className="h-px w-full border-0 bg-divider" />
        <h2
          id="awards-heading"
          className="text-3xl leading-tight font-bold tracking-[-0.25px] text-brand-yellow sm:text-4xl lg:text-[57px] lg:leading-16"
        >
          {t("title")}
        </h2>
      </div>

      {/* mm:5005:14974 */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:gap-x-10 lg:grid-cols-3 lg:gap-x-[108px] lg:gap-y-20">
        {AWARD_CARDS.map((award) => (
          <AwardCard
            key={award.slug}
            award={award}
            title={t(`items.${award.key}.title`)}
            description={t(`items.${award.key}.description`)}
            detailLabel={t("detail")}
          />
        ))}
      </div>
    </section>
  );
}
