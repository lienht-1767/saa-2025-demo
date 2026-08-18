"use client";

import { useTranslations } from "next-intl";

export function KudosRealtimeStatus({ reconnecting }: { reconnecting: boolean }) {
  const t = useTranslations("kudosBoard.realtime");
  if (!reconnecting) return null;
  return <p role="status" aria-live="polite" className="fixed inset-x-0 top-24 z-50 mx-auto w-fit rounded-full border border-accent-border bg-surface-dark px-5 py-3 text-sm font-bold text-brand-yellow shadow-xl">{t("reconnecting")}</p>;
}
