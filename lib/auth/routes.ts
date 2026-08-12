/**
 * Route boundaries for the auth guard.
 *
 * The public list is a WHITELIST — anything not named here requires a session. A new route
 * is therefore protected by default (fail-closed); see docs/system/permissions.md.
 */

export const LOGIN_ROUTE = "/login";
export const AUTH_CALLBACK_ROUTE = "/auth/callback";

/** Where a signed-in user lands. A module constant, never a query parameter — that would
 *  turn the callback into an open redirect. */
export const POST_LOGIN_ROUTE = "/";

export const PUBLIC_ROUTES = [LOGIN_ROUTE, AUTH_CALLBACK_ROUTE] as const;

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
