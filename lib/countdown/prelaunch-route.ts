import { COUNTDOWN_ROUTE, HOME_ROUTE } from "@/lib/auth/routes";

/**
 * Resolves the prelaunch/live boundary without depending on Next.js request objects, keeping the
 * decision deterministic and easy to exercise at the exact deadline.
 */
export function resolvePrelaunchRedirect(
  pathname: string,
  deadlineMs: number | null,
  nowMs: number,
): string | null {
  if (deadlineMs === null) return null;

  if (pathname === HOME_ROUTE && nowMs < deadlineMs) {
    return COUNTDOWN_ROUTE;
  }

  if (pathname === COUNTDOWN_ROUTE && nowMs >= deadlineMs) {
    return HOME_ROUTE;
  }

  return null;
}
