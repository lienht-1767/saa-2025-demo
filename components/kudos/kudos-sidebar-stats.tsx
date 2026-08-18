"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { IconGift, IconHeart } from "@/components/kudos/kudos-icons";
import type { KudosSidebarStats } from "@/lib/kudos/types";

/**
 * `D.1_Thống kê tổng quat` (node `2940:13489`): `#00070C` fill, 1px `accent-border`, 17px radius,
 * five "label … value" rows (32px/40px bold gold value, right-aligned) with a divider before the
 * Secret Box pair, then the "Mở Secret Box" button (60px tall, 8px radius, `brand-yellow` fill,
 * `ink` text, per node `2940:13497` — its text node carries only the shared component's generic
 * layer name in the fetched styles export, so the label itself is read from
 * `evidence/momorph-screen-MaZUn5xHXZ.png` rather than `momorph-frame-styles.json`).
 */
export type KudosSidebarStatsProps = {
  stats: KudosSidebarStats;
  onOpenSecretBox?: () => void;
};

function StatRow({ label, value, icon }: { label: string; value: number; icon?: ReactNode }) {
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <span className="text-base leading-6 font-bold text-white">{label}</span>
      <span className="flex items-center gap-2 text-[32px] leading-10 font-bold text-brand-yellow">
        {icon}
        {value}
      </span>
    </div>
  );
}

export function KudosSidebarStats({ stats, onOpenSecretBox }: KudosSidebarStatsProps) {
  const t = useTranslations("kudosBoard.sidebar");

  return (
    /* mm:2940:13489 */
    <div className="flex w-full flex-col items-start gap-4 rounded-[17px] border border-accent-border bg-kudos-sidebar-surface p-6">
      <StatRow label={t("received")} value={stats.received} />
      <StatRow label={t("sent")} value={stats.sent} />
      <StatRow label={t("hearts")} value={stats.heartsReceived} icon={<IconHeart className="size-6 text-badge-danger" />} />
      <hr className="h-px w-full border-0 bg-divider" />
      <StatRow label={t("secretBoxesOpened")} value={stats.secretBoxesOpened} />
      <StatRow label={t("secretBoxesUnopened")} value={stats.secretBoxesUnopened} />
      <button
        type="button"
        onClick={onOpenSecretBox}
        className="flex h-[60px] w-full items-center justify-center gap-1 rounded-lg bg-brand-yellow text-base leading-7 font-bold text-ink hover:bg-[#fff2c2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
      >
        {t("openSecretBox")}
        <IconGift className="size-6" />
      </button>
    </div>
  );
}
