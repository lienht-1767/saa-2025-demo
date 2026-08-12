import type { CountdownDisplayProps } from "@/components/home/countdown-display";

/**
 * Pure, framework-free countdown maths for the homepage hero (AD08). No React, no
 * `next/headers` — this file must run unchanged in a Server Component and in the browser so the
 * server-computed initial value and the client's first render always agree (no hydration drift).
 */

/**
 * Built-in fallback event start used when `NEXT_PUBLIC_EVENT_START_AT` is unset. A documented
 * default must actually render a countdown on a fresh clone, not degrade to the zero state —
 * see clarifications.md session 4 for why the year is kept in the future.
 */
export const DEFAULT_EVENT_START_AT = "2026-12-26T18:30:00+07:00";

/** `CountdownDisplayProps` with every field required — the shape both server and client agree on. */
export type CountdownValue = Required<CountdownDisplayProps>;

export const ZERO_COUNTDOWN: CountdownValue = {
  days: 0,
  hours: 0,
  minutes: 0,
  showComingSoon: false,
};

const ONE_DAY_MS = 86_400_000;
const ONE_HOUR_MS = 3_600_000;
const ONE_MINUTE_MS = 60_000;

/**
 * Resolves the event deadline to epoch ms. Never throws.
 *
 * - Omitted or empty `raw` → the built-in default.
 * - Unparseable `raw` → `null` (drives the zero state in `computeCountdown`) plus one
 *   server-side warning.
 *
 * `raw` defaults to the literal `process.env.NEXT_PUBLIC_EVENT_START_AT` access so Next.js can
 * inline it at build time — see `lib/supabase/env.ts` for the identical rule about literal
 * `NEXT_PUBLIC_*` reads. Pass an explicit argument in tests to bypass the env var entirely.
 */
export function resolveEventStart(
  raw: string | undefined = process.env.NEXT_PUBLIC_EVENT_START_AT,
): number | null {
  const value = raw && raw.length > 0 ? raw : DEFAULT_EVENT_START_AT;
  const parsed = Date.parse(value);

  if (Number.isNaN(parsed)) {
    console.warn(`[home/countdown] invalid NEXT_PUBLIC_EVENT_START_AT: "${value}"`);
    return null;
  }

  return parsed;
}

/**
 * Whole days/hours/minutes remaining until `deadlineMs`, clamped at zero. Never returns a
 * negative field, never throws, and never counts past the deadline back down again.
 */
export function computeCountdown(deadlineMs: number | null, nowMs: number): CountdownValue {
  if (deadlineMs === null || deadlineMs <= nowMs) {
    return ZERO_COUNTDOWN;
  }

  const delta = deadlineMs - nowMs;

  return {
    days: Math.floor(delta / ONE_DAY_MS),
    hours: Math.floor(delta / ONE_HOUR_MS) % 24,
    minutes: Math.floor(delta / ONE_MINUTE_MS) % 60,
    showComingSoon: true,
  };
}
