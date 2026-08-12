"use client";

import { useEffect, useState } from "react";

import { CountdownDisplay } from "@/components/home/countdown-display";
import { computeCountdown, type CountdownValue } from "@/lib/home/countdown";

const TICK_INTERVAL_MS = 60_000;

export type CountdownLiveProps = {
  /** `null` when the configured event start could not be resolved — the tick loop never starts. */
  deadlineMs: number | null;
  /** Server-computed value. Seeds `useState` so the first client render matches the server HTML
   * byte for byte — recomputing happens only inside `useEffect`, after hydration (AD08). */
  initial: CountdownValue;
};

/**
 * Ticks `CountdownDisplay` once a minute. The server supplies `initial`; this component never
 * calls `Date.now()` during render, only inside `useEffect`, so hydration never mismatches.
 */
export function CountdownLive({ deadlineMs, initial }: CountdownLiveProps) {
  const [value, setValue] = useState<CountdownValue>(initial);

  useEffect(() => {
    if (deadlineMs === null) {
      return;
    }

    const applyTick = (): boolean => {
      const next = computeCountdown(deadlineMs, Date.now());
      setValue(next);
      return next.showComingSoon;
    };

    const stillCounting = applyTick();
    if (!stillCounting) {
      return;
    }

    const intervalId = setInterval(() => {
      if (!applyTick()) {
        clearInterval(intervalId);
      }
    }, TICK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [deadlineMs]);

  return <CountdownDisplay {...value} />;
}
