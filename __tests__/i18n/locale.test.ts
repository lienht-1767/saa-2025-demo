import { describe, expect, it, vi, beforeEach } from "vitest";

const cookieStore = { get: vi.fn() };

vi.mock("next/headers", () => ({
  cookies: async () => cookieStore,
}));

const { getLocale } = await import("@/lib/i18n/locale");
const { DEFAULT_LOCALE, isSupportedLocale } = await import("@/lib/i18n/config");

describe("getLocale", () => {
  beforeEach(() => {
    cookieStore.get.mockReset();
  });

  it("returns the cookie value when it names a supported locale", async () => {
    cookieStore.get.mockReturnValue({ value: "en" });

    await expect(getLocale()).resolves.toBe("en");
  });

  it("falls back to the default locale when no cookie is set", async () => {
    cookieStore.get.mockReturnValue(undefined);

    await expect(getLocale()).resolves.toBe(DEFAULT_LOCALE);
  });

  // edge-cases.md: a tampered or stale cookie must not become a 500.
  it("falls back to the default locale for an unsupported value", async () => {
    cookieStore.get.mockReturnValue({ value: "fr" });

    await expect(getLocale()).resolves.toBe(DEFAULT_LOCALE);
  });

  it("defaults to Vietnamese — the design language (test case 5f1cbabd)", () => {
    expect(DEFAULT_LOCALE).toBe("vi");
  });
});

describe("isSupportedLocale", () => {
  it("accepts the shipped locales and rejects everything else", () => {
    expect(isSupportedLocale("vi")).toBe(true);
    expect(isSupportedLocale("en")).toBe(true);
    expect(isSupportedLocale("fr")).toBe(false);
    expect(isSupportedLocale(undefined)).toBe(false);
    expect(isSupportedLocale(42)).toBe(false);
  });
});
