import { getRequestConfig } from "next-intl/server";

import { getLocale } from "./locale";

/**
 * next-intl request config, cookie-driven (no i18n routing).
 *
 * The design has no locale segment in any route, so the locale comes from the cookie
 * rather than the pathname — see AD03 in docs/system/architecture.md.
 */
export default getRequestConfig(async () => {
  const locale = await getLocale();

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
