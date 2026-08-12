"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, isSupportedLocale } from "./config";

/**
 * Persists the user's language choice.
 *
 * The value is validated against the supported list before it is written, so a crafted
 * request cannot push an arbitrary string into the message loader. `revalidatePath` is what
 * makes server-rendered copy re-render in the new language.
 */
export async function setLocale(locale: string): Promise<void> {
  if (!isSupportedLocale(locale)) {
    throw new Error(`Unsupported locale: ${locale}`);
  }

  const cookieStore = await cookies();

  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}
