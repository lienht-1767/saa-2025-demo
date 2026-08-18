"use client";

import { useTranslations } from "next-intl";

import { KudosAvatar } from "@/components/kudos/kudos-avatar";
import type { KudosRecentGiftEntry } from "@/lib/kudos/types";

/**
 * `D.3_10 SUNNER nhận quà` (node `2940:13510`): `#00070C` fill, 1px `accent-border`, 17px radius,
 * an independently-scrolling list. Each row (node `2940:13518`): 64x64 avatar, bold 22px gold
 * name, right-aligned 16px white gift description, 8px gap — all evidenced from the D.3.4 example
 * "Huỳnh Dương Xuân" / "Nhận được 1 áo phông SAA". Empty state per momorph-test-cases.csv TC
 * `d662780b`: "Chưa có dữ liệu".
 */
export type KudosSidebarRecentGiftsProps = {
  gifts: readonly KudosRecentGiftEntry[];
  onOpenProfile?: (personId: string) => void;
};

export function KudosSidebarRecentGifts({ gifts, onOpenProfile }: KudosSidebarRecentGiftsProps) {
  const t = useTranslations("kudosBoard.sidebar");

  return (
    /* mm:2940:13510 */
    <div className="flex w-full flex-col items-start gap-4 rounded-[17px] border border-accent-border bg-kudos-sidebar-surface p-6">
      <h3 className="text-sm leading-5 font-bold tracking-[0.1px] text-white">{t("recentGiftsTitle")}</h3>
      {gifts.length === 0 ? (
        <p className="w-full py-4 text-center text-sm text-white/70">{t("emptyList")}</p>
      ) : (
        <ul className="flex max-h-80 w-full flex-col gap-4 overflow-y-auto">
          {gifts.map((gift) => (
            <li key={gift.id} className="flex w-full items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenProfile?.(gift.id)}
                className="rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
              >
                <KudosAvatar name={gift.name} avatarUrl={gift.avatarUrl} size={64} />
              </button>
              <div className="flex w-full items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onOpenProfile?.(gift.id)}
                  className="truncate text-left text-[22px] leading-7 font-bold text-brand-yellow hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
                >
                  {gift.name}
                </button>
                <span className="shrink-0 text-right text-base text-white">{gift.giftLabel}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
