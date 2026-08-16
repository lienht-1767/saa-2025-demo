"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PrelaunchCountdownDisplay } from "@/components/countdown/countdown-display";
import { computeCountdown, type CountdownValue } from "@/lib/home/countdown";

const TICK_INTERVAL_MS = 1_000;

export type PrelaunchCountdownLiveProps = {
  deadlineMs: number;
  initial: CountdownValue;
};

/**
 * The digits only expose whole minutes, but the clock checks once a second so the hand-off to
 * the live homepage happens promptly instead of up to a minute after the event starts.
 */
export function PrelaunchCountdownLive({ deadlineMs, initial }: PrelaunchCountdownLiveProps) {
  const router = useRouter();
  const [value, setValue] = useState<CountdownValue>(initial);

  useEffect(() => {
    const applyTick = (): boolean => {
      const next = computeCountdown(deadlineMs, Date.now());
      setValue(next);

      if (!next.showComingSoon) {
        router.replace("/");
        return false;
      }

      return true;
    };

    if (!applyTick()) return;

    const intervalId = window.setInterval(() => {
      if (!applyTick()) window.clearInterval(intervalId);
    }, TICK_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [deadlineMs, router]);

  return <PrelaunchCountdownDisplay days={value.days} hours={value.hours} minutes={value.minutes} />;
}
