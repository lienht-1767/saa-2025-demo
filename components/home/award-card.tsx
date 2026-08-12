import Image from "next/image";
import Link from "next/link";

import { IconArrowUpRight } from "@/components/ui/icons";
import { AWARD_BACKDROP, type AwardCardData } from "@/lib/home/awards";

/**
 * One award card — `mms_C2.1_Top Talent Award` (2167:9075) and its five siblings.
 *
 * Figma: a 336px column, 24px between the artwork and the copy.
 *   Picture (I2167:9075;214:1019) 336x336, the shared `MM_MEDIA_Award BG` backdrop with the
 *     award wordmark centred on it, shadow `0 4px 4px rgba(0,0,0,.25), 0 0 6px #FAE287`,
 *     blend mode `screen`.
 *   Each `Awards-Name` instance carries its OWN box — 221x35 for Top Talent, 232x64 for Top
 *     Project Leader, 116x52 for MVP — so the wordmark width is derived per card from its
 *     intrinsic size, never a shared percentage. A flat width stretched Top Talent and drew MVP
 *     at double size.
 *   Frame 490 (I2167:9075;214:1020) 4px apart: title 24px/32px 400 #FFEA9E, description
 *     16px/24px 400 white letter-spacing 0.5px, then the "Chi tiết" link at 16px/24px 500.
 *
 * The description is clamped to two lines with an ellipsis so uneven copy keeps the grid even.
 */
export type AwardCardProps = {
  award: AwardCardData;
  title: string;
  description: string;
  /** Label of the trailing link — "Chi tiết" in the design. */
  detailLabel: string;
  /** Base path the slug anchors onto. Defaults to the awards stub route. */
  basePath?: string;
};

export function AwardCard({
  award,
  title,
  description,
  detailLabel,
  basePath = "/awards",
}: AwardCardProps) {
  const href = `${basePath}#${award.slug}`;

  return (
    /* mm:2167:9075 */
    <article className="group flex flex-col items-start gap-6">
      {/* mm:I2167:9075;214:1019 */}
      <div className="relative flex aspect-square w-full max-w-[336px] items-center justify-center mix-blend-screen shadow-[0_4px_4px_0_rgba(0,0,0,0.25),0_0_6px_0_#FAE287] transition-transform duration-200 group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
        <Image
          src={AWARD_BACKDROP.src}
          alt=""
          aria-hidden
          width={AWARD_BACKDROP.size}
          height={AWARD_BACKDROP.size}
          className="absolute inset-0 size-full object-cover"
        />
        {/* mm:I2167:9075;214:1019;214:666 */}
        <Image
          src={award.wordmark.src}
          alt={title}
          width={award.wordmark.width}
          height={award.wordmark.height}
          // Percentage of the 336px card the wordmark occupies in Figma, so it scales with the
          // card at every breakpoint while keeping the asset's own aspect ratio.
          style={{ width: `${(award.wordmark.width / AWARD_BACKDROP.size) * 100}%` }}
          className="relative h-auto"
        />
      </div>

      {/* mm:I2167:9075;214:1020 */}
      <div className="flex w-full flex-col items-start gap-1">
        <h3 className="text-2xl leading-8 text-brand-yellow">{title}</h3>
        <p className="line-clamp-2 w-full overflow-hidden text-base leading-6 tracking-[0.5px] text-ellipsis text-white">
          {description}
        </p>

        {/* mm:I2167:9075;214:1023 */}
        <Link
          href={href}
          className="inline-flex items-center gap-1 py-4 text-base leading-6 font-medium tracking-[0.15px] text-white transition-colors duration-200 hover:text-brand-yellow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow motion-reduce:transition-none"
        >
          <span>{detailLabel}</span>
          <span className="sr-only">{` — ${title}`}</span>
          <IconArrowUpRight className="shrink-0" />
        </Link>
      </div>
    </article>
  );
}
