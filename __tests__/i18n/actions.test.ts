import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = { set: vi.fn() };
const revalidatePath = vi.fn();

vi.mock("next/headers", () => ({
  cookies: async () => cookieStore,
}));

vi.mock("next/cache", () => ({ revalidatePath }));

const { setLocale } = await import("@/lib/i18n/actions");
const { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } = await import("@/lib/i18n/config");

describe("setLocale", () => {
  beforeEach(() => {
    cookieStore.set.mockReset();
    revalidatePath.mockReset();
  });

  it("persists a supported locale and revalidates the root layout", async () => {
    await setLocale("en");

    expect(cookieStore.set).toHaveBeenCalledWith(LOCALE_COOKIE, "en", {
      path: "/",
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: "lax",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("rejects unsupported input before writing or revalidating", async () => {
    await expect(setLocale("fr")).rejects.toThrow("Unsupported locale: fr");

    expect(cookieStore.set).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
