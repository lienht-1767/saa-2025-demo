/** Locales the UI ships in. Adding one means adding a message file and an entry here. */
export const SUPPORTED_LOCALES = ["vi", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

/** Vietnamese is the design language — the Figma copy is written in it. */
export const DEFAULT_LOCALE: Locale = "vi";

/** Cookie the locale choice is persisted in. No locale segment appears in any URL. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Short code shown in the header selector, e.g. `VN`. */
export const LOCALE_LABELS: Record<Locale, { code: string; name: string; flag: string }> = {
  vi: { code: "VN", name: "Tiếng Việt", flag: "/images/login/flag-vn.svg" },
  en: { code: "EN", name: "English", flag: "/images/login/flag-en.svg" },
};

export function isSupportedLocale(value: unknown): value is Locale {
  return typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale);
}
