import { AwardArtwork } from "@/components/awards/award-artwork";
import { IconDiamond, IconLicense, IconTarget } from "@/components/awards/award-icons";
import type { AwardPrizeEntry, AwardRowData } from "@/lib/awards/award-rows";

/**
 * One award row — D.1 (313:8467) and its five siblings under `D.Danh sách giải thưởng`
 * (313:8466). D.1/D.3/D.5 render artwork-left/content-right; D.2/D.4/D.6 mirror it via
 * `row.layout`. `id={row.slug}` + `scroll-mt-24` is the anchor the left nav (and the homepage
 * award cards) deep-link to with `#<slug>` — the offset clears the 80px sticky header.
 *
 * D.5 is the only row with two prize blocks (`prizes.length === 2`), split by "Hoặc"; D.4/D.6
 * have no trailing note under their amount, which is why `note` is optional per entry.
 */
export type AwardRowProps = {
  row: AwardRowData;
  title: string;
  description: string;
  quantityLabel: string;
  quantityCount: string;
  quantityUnit: string;
  prizeLabel: string;
  prizes: readonly AwardPrizeEntry[];
  orLabel: string;
};

export function AwardRow({
  row,
  title,
  description,
  quantityLabel,
  quantityCount,
  quantityUnit,
  prizeLabel,
  prizes,
  orLabel,
}: AwardRowProps) {
  const headingId = `${row.slug}-heading`;
  const descriptionClass = row.descriptionAlign === "left" ? "text-left" : "text-left lg:text-justify";
  const descriptionParagraphs = description.split("\n\n");

  return (
    /* mm:{row.rowNodeId} */
    <section
      id={row.slug}
      tabIndex={-1}
      aria-labelledby={headingId}
      className={`scroll-mt-[152px] flex flex-col items-start gap-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-yellow lg:scroll-mt-24 lg:flex-row lg:gap-10 ${
        row.layout === "artwork-right" ? "lg:flex-row-reverse" : ""
      }`}
    >
      <AwardArtwork wordmark={row.wordmark} />

      <div className="flex w-full max-w-[478px] flex-col items-start gap-8">
        {/* Frame 442 (I313:8467;214:2528) — icon and title 16px apart, centred on each other. */}
        <h2 id={headingId} className="flex items-center gap-4 text-2xl leading-8 font-bold text-brand-yellow">
          <IconTarget className="shrink-0" />
          {title}
        </h2>
        <div
          className={`flex flex-col gap-6 whitespace-pre-line text-base leading-6 font-bold tracking-[0.5px] text-white ${descriptionClass}`}
        >
          {descriptionParagraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>

        <hr className="h-px w-full border-0 bg-divider" />

        {/* Frame 443 (I313:8467;214:2534) is a single 44px-tall row: icon, label and count all
            16px apart and vertically centred, with the unit 8px after the count (the inner
            `Số lượng` frame, I313:8467;214:3552). It wraps on narrow viewports rather than
            overflowing — the design only specifies the 1512 desktop case. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="flex items-center gap-4 text-2xl leading-8 font-bold text-brand-yellow">
            <IconDiamond className="shrink-0" />
            {quantityLabel}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[36px] leading-[44px] font-bold text-white">{quantityCount}</span>
            <span className="text-sm leading-5 font-bold tracking-[0.1px] text-white">{quantityUnit}</span>
          </div>
        </div>

        <hr className="h-px w-full border-0 bg-divider" />

        {prizes.map((prize, index) => (
          <div key={prize.amount} className="flex w-full flex-col items-start gap-4">
            {index > 0 && (
              <div className="flex w-full items-center gap-3 text-sm leading-5 font-bold text-white">
                <hr className="h-px flex-1 border-0 bg-divider" />
                {orLabel}
                <hr className="h-px flex-1 border-0 bg-divider" />
              </div>
            )}
            {/* Frame 497 (I313:8467;214:2542) — same 16px icon/label gap as the two above. */}
            <p className="flex items-center gap-4 text-2xl leading-8 font-bold text-brand-yellow">
              <IconLicense className="shrink-0" />
              {prizeLabel}
            </p>
            <div className="flex flex-col items-start gap-1">
              <span className="text-[36px] leading-[44px] font-bold text-white">{prize.amount}</span>
              {prize.note && (
                <span className="text-sm leading-5 font-bold tracking-[0.1px] text-white">{prize.note}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
