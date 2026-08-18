import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { useHighlightCarousel } from "@/lib/kudos/use-highlight-carousel";

describe("useHighlightCarousel", () => {
  it("starts on the first card with prev disabled and next enabled", () => {
    const { result } = renderHook(() => useHighlightCarousel(5));

    expect(result.current.index).toBe(0);
    expect(result.current.canGoPrev).toBe(false);
    expect(result.current.canGoNext).toBe(true);
    expect(result.current.pageLabel).toBe("1/5");
  });

  it("advances on next() and reports the new page label", () => {
    const { result } = renderHook(() => useHighlightCarousel(5));

    act(() => result.current.next());

    expect(result.current.index).toBe(1);
    expect(result.current.pageLabel).toBe("2/5");
  });

  it("does not advance past the last card", () => {
    const { result } = renderHook(() => useHighlightCarousel(2));

    act(() => result.current.next());
    act(() => result.current.next());

    expect(result.current.index).toBe(1);
    expect(result.current.canGoNext).toBe(false);
  });

  it("does not retreat before the first card", () => {
    const { result } = renderHook(() => useHighlightCarousel(5));

    act(() => result.current.prev());

    expect(result.current.index).toBe(0);
    expect(result.current.canGoPrev).toBe(false);
  });

  it("goTo jumps directly to a valid index and ignores an out-of-range one", () => {
    const { result } = renderHook(() => useHighlightCarousel(5));

    act(() => result.current.goTo(3));
    expect(result.current.index).toBe(3);

    act(() => result.current.goTo(99));
    expect(result.current.index).toBe(3);
  });

  it("reports a safe 0/0 empty state for zero cards instead of throwing (hooks must run unconditionally)", () => {
    const { result } = renderHook(() => useHighlightCarousel(0));

    expect(result.current.pageLabel).toBe("0/0");
    expect(result.current.canGoPrev).toBe(false);
    expect(result.current.canGoNext).toBe(false);
  });

  it("throws for a negative card count, a genuine caller bug", () => {
    expect(() => renderHook(() => useHighlightCarousel(-1))).toThrow(RangeError);
  });
});
