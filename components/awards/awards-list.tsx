import { getTranslations } from "next-intl/server";

import { AwardRow } from "@/components/awards/award-row";
import { AWARD_ROWS, type AwardPrizeEntry, type AwardRowData } from "@/lib/awards/award-rows";

/**
 * `D.Danh sách giải thưởng` (313:8466) — the six award rows, each separated by a `Rectangle 14`
 * divider (`divide-y`, reusing the shared `--divider` token). Resolves every `awards.items.*`
 * and `awards.labels.*` string once here so `AwardRow` stays a plain presentational component.
 */
export async function AwardsList() {
  const t = await getTranslations("awards");

  return (
    /* mm:313:8466 */
    <div className="flex w-full max-w-[854px] flex-col divide-y divide-divider xl:w-[854px] xl:flex-none">
      {AWARD_ROWS.map((row) => (
        <div key={row.slug} className="w-full py-20 first:pt-0 last:pb-0">
          <AwardRow
            row={row}
            title={t(`items.${row.key}.title`)}
            description={t(`items.${row.key}.description`)}
            quantityLabel={t("labels.quantity")}
            quantityCount={t(`items.${row.key}.quantity.count`)}
            quantityUnit={t(`items.${row.key}.quantity.unit`)}
            prizeLabel={t("labels.prize")}
            prizes={resolvePrizes(t, row)}
            orLabel={t("labels.or")}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Builds the 1-or-2-entry prize list `AwardRow` renders from `awards.items.<key>.prize`, which
 * the message catalogue models as `{ primary, secondary? }` (see `lib/awards/award-rows.ts` for
 * why). Only asks next-intl for keys `row.hasPrimaryNote`/`row.hasSecondaryPrize` say exist.
 */
function resolvePrizes(t: Awaited<ReturnType<typeof getTranslations>>, row: AwardRowData): AwardPrizeEntry[] {
  const prizes: AwardPrizeEntry[] = [
    {
      amount: t(`items.${row.key}.prize.primary.amount`),
      note: row.hasPrimaryNote ? t(`items.${row.key}.prize.primary.note`) : undefined,
    },
  ];

  if (row.hasSecondaryPrize) {
    prizes.push({
      amount: t(`items.${row.key}.prize.secondary.amount`),
      note: t(`items.${row.key}.prize.secondary.note`),
    });
  }

  return prizes;
}
