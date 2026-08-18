"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { LOGIN_ROUTE } from "@/lib/auth/routes";

/**
 * Shown in place of `KudosSidebarStats` (`D.1_Thống kê tổng quat`) for a guest — same surface,
 * border and radius so the layout doesn't shift when a viewer signs in. Renders exactly when
 * `KudosFeedData.stats` is `null` (see the comment on that field in `lib/kudos/types.ts`).
 */
export function KudosSidebarGuestCta() {
  const t = useTranslations("kudosBoard.sidebar");

  return (
    <div className="flex w-full flex-col items-start gap-4 rounded-[17px] border border-accent-border bg-kudos-sidebar-surface p-6">
      <h3 className="text-lg leading-7 font-bold text-white">{t("guestTitle")}</h3>
      <p className="text-sm leading-6 text-white/75">{t("guestBody")}</p>
      <Link
        href={LOGIN_ROUTE}
        className="flex h-[60px] w-full items-center justify-center rounded-lg bg-brand-yellow text-base leading-7 font-bold text-ink hover:bg-[#fff2c2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
      >
        {t("guestCta")}
      </Link>
    </div>
  );
}
