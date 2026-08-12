import { cookies } from "next/headers";

import { DEFAULT_LOCALE, LOCALE_COOKIE, isSupportedLocale, type Locale } from "./config";

/**
 * Resolves the active locale from the request cookie.
 *
 * An unrecognised value (tampered cookie, a locale we dropped) falls back to the default
 * rather than throwing — a bad cookie must never turn into a 500.
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;

  return isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}
