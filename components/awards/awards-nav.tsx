"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";

import { IconTarget } from "@/components/awards/award-icons";
import type { AwardRowData } from "@/lib/awards/award-rows";
import { useAwardScrollSpy } from "@/lib/awards/use-award-scroll-spy";

/**
 * `mms_C_Menu list` (313:8459) — six links to the award sections. Real `<a href="#slug">`
 * anchors (via `Link`), so navigation works even before JS hydrates; the click handler only
 * upgrades that jump to a smooth scroll (respecting `prefers-reduced-motion`) and is a no-op if
 * the target section isn't in the DOM (TC ID-13) rather than throwing. Sticky beside the list on
 * `lg`+; a horizontal scroller below it, mirroring the header's mobile nav collapse.
 */
export type AwardsNavProps = {
  rows: readonly AwardRowData[];
};

export function AwardsNav({ rows }: AwardsNavProps) {
  const t = useTranslations("awards.nav");
  const navRef = useRef<HTMLElement>(null);
  const slugs = useMemo(() => rows.map((row) => row.slug), [rows]);
  const { activeSlug, activate } = useAwardScrollSpy(slugs);

  useEffect(() => {
    if (window.matchMedia("(min-width: 1280px)").matches) return;
    const nav = navRef.current;
    const activeLink = nav?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!nav || !activeLink) return;

    // Keep the active chip in the horizontal scroller without moving the document viewport.
    nav.scrollTo({
      left: Math.max(0, activeLink.offsetLeft - (nav.clientWidth - activeLink.clientWidth) / 2),
      behavior: "auto",
    });
  }, [activeSlug]);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>, slug: string) {
    const target = document.getElementById(slug);
    if (!target) return; // Unknown/removed section id — stay put rather than throw (TC ID-13).

    event.preventDefault();
    activate(slug);
    window.history.pushState(null, "", `#${slug}`);
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    target.focus({ preventScroll: true });
  }

  return (
    /* mm:313:8459 */
    <nav
      ref={navRef}
      aria-label={t("navLabel")}
      // `mms_C_Menu list` (313:8459): a 178px column, items 16px apart, `align-items: flex-start`.
      className="flex snap-x gap-2 overflow-x-auto xl:sticky xl:top-24 xl:w-[178px] xl:shrink-0 xl:flex-col xl:items-start xl:gap-4 xl:overflow-visible"
    >
      {rows.map((row) => {
        const isActive = row.slug === activeSlug;
        return (
          <Link
            key={row.slug}
            href={`#${row.slug}`}
            aria-current={isActive ? "location" : undefined}
            onClick={(event) => handleClick(event, row.slug)}
            /* `mms_C.1_Top talent` (313:8460): 16px padding, icon and label 4px apart. */
            className={`inline-flex min-h-11 shrink-0 snap-start items-center gap-1 rounded p-4 text-sm leading-5 font-bold whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow motion-reduce:transition-none ${
              isActive
                ? "border-b border-brand-yellow tracking-[0.25px] text-brand-yellow [text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287]"
                : "tracking-[0.1px] text-white hover:bg-brand-yellow/10 hover:[text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287]"
            }`}
          >
            <IconTarget className="shrink-0" />
            {t(row.key)}
          </Link>
        );
      })}
    </nav>
  );
}
