"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type VisibleAward = { slug: string; top: number };

export function resolveAwardHash(hash: string, slugs: readonly string[]): string {
  if (hash === "" || hash === "#") return slugs[0] ?? "";

  try {
    const slug = decodeURIComponent(hash.slice(1));
    return slugs.includes(slug) ? slug : "";
  } catch {
    return "";
  }
}

export function pickClosestVisibleSlug(entries: readonly VisibleAward[], activationTop = 96): string {
  return [...entries].sort(
    (left, right) => Math.abs(left.top - activationTop) - Math.abs(right.top - activationTop),
  )[0]?.slug ?? "";
}

/**
 * Tracks which award section is nearest the top of the viewport, for the sticky nav's
 * active-state indicator (TC ID-9/ID-11). Starts on the first slug so the initial paint has an
 * active item before any scrolling happens, and never throws if a slug isn't in the DOM yet —
 * that section is simply skipped rather than crashing the observer setup (TC ID-13).
 */
export function useAwardScrollSpy(slugs: readonly string[]) {
  // Render no speculative selection on the server. The first client effect resolves either the
  // current deep link, no-hash default, or an invalid hash without flashing the wrong award.
  const [activeSlug, setActiveSlug] = useState("");
  const visibleSections = useRef(new Map<string, number>());
  const activate = useCallback((slug: string) => setActiveSlug(slug), []);

  useEffect(() => {
    const visible = visibleSections.current;
    let animationFrame = 0;
    const syncFromUrl = () => setActiveSlug(resolveAwardHash(window.location.hash, slugs));
    syncFromUrl();
    window.addEventListener("hashchange", syncFromUrl);
    window.addEventListener("popstate", syncFromUrl);

    const sections = slugs
      .map((slug) => document.getElementById(slug))
      .filter((element): element is HTMLElement => element !== null);

    if (sections.length === 0) {
      return () => {
        window.removeEventListener("hashchange", syncFromUrl);
        window.removeEventListener("popstate", syncFromUrl);
      };
    }

    const updateActiveFromLivePositions = () => {
      const closest = pickClosestVisibleSlug(
        Array.from(visible.keys(), (slug) => ({
          slug,
          top: document.getElementById(slug)?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY,
        })),
      );
      if (closest) setActiveSlug(closest);
    };

    const schedulePositionUpdate = () => {
      if (animationFrame !== 0) return;
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        updateActiveFromLivePositions();
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect.top);
          else visible.delete(entry.target.id);
        }

        updateActiveFromLivePositions();
      },
      // Biases the "active" window to a band just below the 80px sticky header, so a section
      // counts as active once its heading clears the header rather than only once fully visible.
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    window.addEventListener("scroll", schedulePositionUpdate, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedulePositionUpdate);
      if (animationFrame !== 0) window.cancelAnimationFrame(animationFrame);
      visible.clear();
      window.removeEventListener("hashchange", syncFromUrl);
      window.removeEventListener("popstate", syncFromUrl);
    };
  }, [slugs]);

  return { activeSlug, activate };
}
