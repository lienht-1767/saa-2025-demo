"use client";

import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const ZOOM_STEP = 0.25;

export type SpotlightPanZoomState = {
  scale: number;
  translate: { x: number; y: number };
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  handlePointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handlePointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handlePointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
};

/**
 * Pan/zoom state for the SPOTLIGHT BOARD (spec B.7.2/B.7.*): "Pan/Zoom" button plus mouse drag,
 * as an SVG/CSS transform per the implementation decision recorded in clarifications.md. Scale is
 * clamped to [1, 3] — 1 is both the resting and the minimum zoom, so the board never shrinks past
 * its natural size.
 */
export function useSpotlightPanZoom(): SpotlightPanZoomState {
  const [scale, setScale] = useState(MIN_SCALE);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const dragOrigin = useRef<{ x: number; y: number } | null>(null);

  const zoomIn = useCallback(() => setScale((current) => Math.min(MAX_SCALE, current + ZOOM_STEP)), []);
  const zoomOut = useCallback(() => setScale((current) => Math.max(MIN_SCALE, current - ZOOM_STEP)), []);
  const reset = useCallback(() => {
    setScale(MIN_SCALE);
    setTranslate({ x: 0, y: 0 });
    dragOrigin.current = null;
  }, []);

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    dragOrigin.current = { x: event.clientX, y: event.clientY };
  }, []);

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const origin = dragOrigin.current;
    if (!origin) return;

    const deltaX = event.clientX - origin.x;
    const deltaY = event.clientY - origin.y;
    dragOrigin.current = { x: event.clientX, y: event.clientY };
    setTranslate((current) => ({ x: current.x + deltaX, y: current.y + deltaY }));
  }, []);

  const handlePointerUp = useCallback(() => {
    dragOrigin.current = null;
  }, []);

  return { scale, translate, zoomIn, zoomOut, reset, handlePointerDown, handlePointerMove, handlePointerUp };
}
