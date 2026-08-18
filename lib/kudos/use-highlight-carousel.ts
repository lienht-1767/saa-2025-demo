"use client";

import { useCallback, useState } from "react";

export type HighlightCarouselState = {
  index: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  /** e.g. "2/5", the page indicator in spec B.* */
  pageLabel: string;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
};

/**
 * Paging state for the HIGHLIGHT KUDOS carousel (spec B.*): a fixed-size, non-wrapping window
 * over `cardCount` cards, with the centre card rendered prominent by the caller.
 *
 * `cardCount === 0` is a valid "empty" state (the caller renders its own empty message and never
 * reads `pageLabel`/`index` in that case) rather than an error — this hook still has to be called
 * unconditionally on every render per the rules of hooks, so it cannot throw for the one input a
 * conditionally-rendered empty state produces. A negative count is a genuine caller bug and still
 * throws.
 */
export function useHighlightCarousel(cardCount: number): HighlightCarouselState {
  if (cardCount < 0) {
    throw new RangeError("useHighlightCarousel: cardCount must not be negative");
  }

  const [index, setIndex] = useState(0);
  const lastIndex = Math.max(cardCount - 1, 0);
  const clamp = useCallback((next: number) => Math.min(Math.max(next, 0), lastIndex), [lastIndex]);

  const next = useCallback(() => setIndex((current) => clamp(current + 1)), [clamp]);
  const prev = useCallback(() => setIndex((current) => clamp(current - 1)), [clamp]);
  const goTo = useCallback((target: number) => setIndex((current) => (target >= 0 && target < cardCount ? target : current)), [cardCount]);

  return {
    index,
    canGoPrev: cardCount > 0 && index > 0,
    canGoNext: cardCount > 0 && index < lastIndex,
    pageLabel: `${cardCount > 0 ? index + 1 : 0}/${cardCount}`,
    next,
    prev,
    goTo,
  };
}
