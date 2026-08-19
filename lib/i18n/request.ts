import { getRequestConfig } from "next-intl/server";

import enMessages from "../../messages/en.json";
import viMessages from "../../messages/vi.json";
import { isSupportedLocale, type Locale } from "./config";
import { getLocale } from "./locale";

const MESSAGES_BY_LOCALE = {
  vi: viMessages,
  en: enMessages,
} satisfies Record<Locale, typeof viMessages>;

/** Keeps the provider locale and its messages sourced from the same explicit value. */
export function getMessagesForLocale(locale: Locale) {
  return MESSAGES_BY_LOCALE[locale];
}

/**
 * next-intl request config, cookie-driven (no i18n routing).
 *
 * The design has no locale segment in any route, so the locale comes from the cookie
 * rather than the pathname — see AD03 in docs/system/architecture.md.
 */
export default getRequestConfig(async ({ locale: localeOverride }) => {
  const locale = isSupportedLocale(localeOverride) ? localeOverride : await getLocale();

  return {
    locale,
    messages: getMessagesForLocale(locale),
  };
});
