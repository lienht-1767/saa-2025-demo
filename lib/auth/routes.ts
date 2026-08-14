/**
 * Route boundaries for the auth guard.
 *
 * The public list is a WHITELIST — anything not named here requires a session. A new route
 * is therefore protected by default (fail-closed); see docs/system/permissions.md.
 *
 * `/` is on the list by deliberate decision (AD05), not a relaxation of that principle: the
 * homepage renders for guests, with header chrome that adapts to session state elsewhere.
 *
 * `/awards` was on the list while it was a stub and has been withdrawn on purpose (BR01,
 * TC ID-1): the award quantities and prize amounts it now carries are internal. The six award
 * cards on the public homepage deep-link to `/awards#<slug>`, so a guest clicking one reaches
 * `/login` — that is the intended boundary, not a broken link. See docs/system/permissions.md.
 */

export const LOGIN_ROUTE = "/login";
export const AUTH_CALLBACK_ROUTE = "/auth/callback";
export const HOME_ROUTE = "/";
export const AWARDS_ROUTE = "/awards";
export const KUDOS_ROUTE = "/kudos";

/** Where a signed-in user lands. A module constant, never a query parameter — that would
 *  turn the callback into an open redirect. */
export const POST_LOGIN_ROUTE = "/";

export const PUBLIC_ROUTES = [
  LOGIN_ROUTE,
  AUTH_CALLBACK_ROUTE,
  HOME_ROUTE,
  KUDOS_ROUTE,
] as const;

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) =>
      pathname === route ||
      // `/` is exact-match ONLY. Prefix-matching it would test `startsWith("//")`, which admits
      // any path with a doubled leading slash — and `//admin` may normalise to the protected
      // `/admin` further down the stack. Fail-closed means not relying on that normalisation.
      (route !== HOME_ROUTE && pathname.startsWith(`${route}/`)),
  );
}
