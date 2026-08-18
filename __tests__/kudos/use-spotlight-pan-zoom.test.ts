import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { useSpotlightPanZoom } from "@/lib/kudos/use-spotlight-pan-zoom";

function pointerEvent(clientX: number, clientY: number, pointerId = 1) {
  return { clientX, clientY, pointerId } as React.PointerEvent<HTMLDivElement>;
}

describe("useSpotlightPanZoom", () => {
  it("starts at scale 1 with no offset", () => {
    const { result } = renderHook(() => useSpotlightPanZoom());
    expect(result.current.scale).toBe(1);
    expect(result.current.translate).toEqual({ x: 0, y: 0 });
  });

  it("zooms in and out within [1, 3], never going below the starting scale", () => {
    const { result } = renderHook(() => useSpotlightPanZoom());

    act(() => result.current.zoomOut());
    expect(result.current.scale).toBe(1);

    act(() => {
      result.current.zoomIn();
      result.current.zoomIn();
      result.current.zoomIn();
      result.current.zoomIn();
      result.current.zoomIn();
      result.current.zoomIn();
      result.current.zoomIn();
      result.current.zoomIn();
    });
    expect(result.current.scale).toBe(3);
  });

  it("accumulates translation across a pointer drag", () => {
    const { result } = renderHook(() => useSpotlightPanZoom());

    act(() => result.current.handlePointerDown(pointerEvent(100, 100)));
    act(() => result.current.handlePointerMove(pointerEvent(130, 90)));

    expect(result.current.translate).toEqual({ x: 30, y: -10 });

    act(() => result.current.handlePointerUp(pointerEvent(130, 90)));
    act(() => result.current.handlePointerMove(pointerEvent(200, 200)));

    // No drag in progress after pointer-up — further moves are ignored.
    expect(result.current.translate).toEqual({ x: 30, y: -10 });
  });

  it("reset returns scale and translation to their initial values", () => {
    const { result } = renderHook(() => useSpotlightPanZoom());

    act(() => {
      result.current.zoomIn();
      result.current.handlePointerDown(pointerEvent(0, 0));
      result.current.handlePointerMove(pointerEvent(50, 50));
    });
    act(() => result.current.reset());

    expect(result.current.scale).toBe(1);
    expect(result.current.translate).toEqual({ x: 0, y: 0 });
  });
});
