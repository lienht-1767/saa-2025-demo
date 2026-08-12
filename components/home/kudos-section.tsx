import Image from "next/image";
import { useTranslations } from "next-intl";

import { CtaLink } from "@/components/ui/cta-link";
import { HEADER_NAV_LINKS } from "@/lib/home/navigation";

/**
 * `mms_D1_Sunkudos` (3390:10349).
 *
 * Figma: a 1120x500 card centred in the 1224px gutter, 16px radius, base colour #0F0F0F under
 * `MM_MEDIA_Kudos Background`. The copy column (`mms_D2_Content`, I3390:10349;313:8419) is 457px
 * wide, inset 64px from the card's left edge, its parts 32px apart:
 *   label  "Phong trào ghi nhận" 24px/32px 700 white
 *   title  "Sun* Kudos" 57px/64px 700 #FFEA9E, -0.25px letter-spacing
 *   body   16px/24px 700 white, justified, letter-spacing 0.5px
 *   D2.1   the "Chi tiết" button, 126x56, 4px radius, #FFEA9E fill
 * `MM_MEDIA_Logo/Kudos` (I3390:10349;329:2948) is the 364x72 KUDOS wordmark on the right.
 */
export function KudosSection() {
  const t = useTranslations("home.kudos");
  // One Figma TEXT node, newline-separated — mirrored in the catalogue and split here.
  const body = t("body").split("\n");
  const kudosLink = HEADER_NAV_LINKS[2];

  return (
    /* mm:3390:10349 */
    <section id="kudos" aria-labelledby="kudos-heading" className="flex w-full justify-center">
      {/* mm:I3390:10349;313:8415 */}
      <div className="relative w-full max-w-[1120px] overflow-hidden rounded-2xl bg-kudos-surface">
        <Image
          src="/images/home/kudos-background.webp"
          alt=""
          aria-hidden
          width={1120}
          height={500}
          className="absolute inset-0 size-full object-cover"
        />

        <div className="relative flex flex-col gap-10 p-8 sm:p-12 lg:flex-row lg:items-center lg:gap-8 lg:p-16">
          {/* mm:I3390:10349;313:8419 */}
          <div className="flex max-w-[457px] flex-col items-start gap-8">
            {/* mm:I3390:10349;313:8420 */}
            <div className="flex flex-col items-start gap-4">
              <p className="text-2xl leading-8 font-bold text-white">{t("label")}</p>
              <h2
                id="kudos-heading"
                className="text-3xl leading-tight font-bold tracking-[-0.25px] text-brand-yellow sm:text-4xl lg:text-[57px] lg:leading-16"
              >
                {t("title")}
              </h2>
              <div className="flex flex-col gap-1 text-justify text-base leading-6 font-bold tracking-[0.5px] text-white">
                {body.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* mm:I3390:10349;313:8426 */}
            <CtaLink href={kudosLink.href} label={t("detail")} variant="filled" size="md" />
          </div>

          {/* mm:I3390:10349;329:2948 */}
          <Image
            src="/images/home/kudos-logo.svg"
            alt={t("logoAlt")}
            width={364}
            height={72}
            className="h-auto w-full max-w-[364px] self-center lg:ml-auto"
          />
        </div>
      </div>
    </section>
  );
}
