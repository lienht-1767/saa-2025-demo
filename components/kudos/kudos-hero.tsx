"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { IconSearch } from "@/components/kudos/kudos-icons";
import { IconPen } from "@/components/ui/icons";

/**
 * `A_KV Kudos` + `Button chuc nang` (nodes `2940:13437`, `2940:13448`) — the banner title, KUDOS
 * logo, the "ghi nhận" pill (spec A.1: click opens the compose dialog owned elsewhere, per
 * clarifications.md), and the "Tìm kiếm profile Sunner" search field beside it. Both pills share
 * one style: 72px tall, 68px radius, 1px `accent-border`, `brand-yellow/10` fill (node `2940:13449`
 * / `2940:13450`).
 */
export type KudosHeroProps = {
  onOpenKudosComposer?: () => void;
  onSearchProfile?: (
    query: string,
  ) => "not-found" | "error" | void | Promise<"not-found" | "error" | void>;
};

const PILL_CLASS =
  "flex h-[72px] w-full items-center gap-4 rounded-full border border-accent-border bg-brand-yellow/10 px-4 text-base leading-6 font-bold tracking-[0.15px] text-white transition-colors duration-200 hover:bg-brand-yellow/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow motion-reduce:transition-none";

export function KudosHero({ onOpenKudosComposer, onSearchProfile }: KudosHeroProps) {
  const t = useTranslations("kudosBoard.hero");
  const [query, setQuery] = useState("");
  const [searchState, setSearchState] = useState<"idle" | "searching" | "not-found" | "error">("idle");

  async function submitSearch() {
    const trimmed = query.trim();
    if (trimmed.length === 0 || searchState === "searching") return;
    setSearchState("searching");
    const result = await onSearchProfile?.(trimmed);
    setSearchState(result === "not-found" || result === "error" ? result : "idle");
  }

  return (
    /* mm:2940:13437 */
    <section
      aria-labelledby="kudos-hero-heading"
      style={{ backgroundImage: "linear-gradient(90deg, rgba(0,21,30,.72), rgba(0,21,30,.08)), url('/images/home/keyvisual-bg.webp')" }}
      className="-mx-6 -mt-16 flex w-[calc(100%+3rem)] flex-col items-start gap-10 bg-cover bg-center px-6 py-20 md:-mx-16 md:w-[calc(100%+8rem)] md:px-16 lg:py-28"
    >
      <div className="flex w-full flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
        <h1 id="kudos-hero-heading" className="max-w-[559px] text-[28px] leading-tight font-bold text-brand-yellow sm:text-[36px] sm:leading-[44px]">
          {t("title")}
        </h1>
        <Image src="/images/home/kudos-logo.svg" alt={t("logoAlt")} width={594} height={104} className="h-auto w-full max-w-[520px]" />
      </div>

      {/* mm:2940:13448 */}
      <div className="flex w-full flex-col items-stretch gap-4 lg:flex-row">
        <button type="button" onClick={onOpenKudosComposer} className={`${PILL_CLASS} lg:max-w-[738px]`}>
          <IconPen className="size-6 shrink-0" />
          <span className="truncate">{t("composerPlaceholder")}</span>
        </button>

        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            void submitSearch();
          }}
          className="relative w-full lg:max-w-[381px]"
        >
          <label htmlFor="kudos-sunner-search" className="sr-only">
            {t("searchLabel")}
          </label>
          <div className={PILL_CLASS}>
            <button
              type="submit"
              aria-label={t("searchAction")}
              disabled={searchState === "searching"}
              className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow disabled:opacity-60"
            >
              <IconSearch className="size-6" />
            </button>
            <input
              id="kudos-sunner-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchPlaceholder")}
              onInput={() => searchState !== "idle" && setSearchState("idle")}
              className="w-full bg-transparent text-white placeholder:text-white/70 focus:outline-none"
            />
          </div>
          <p aria-live="polite" className="absolute top-full left-0 mt-2 min-h-5 px-4 text-sm text-white/80">
            {searchState === "searching" && t("searching")}
            {searchState === "not-found" && t("searchNotFound")}
            {searchState === "error" && t("searchError")}
          </p>
        </form>
      </div>
    </section>
  );
}
