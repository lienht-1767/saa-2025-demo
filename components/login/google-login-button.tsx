"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { AUTH_CALLBACK_ROUTE } from "@/lib/auth/routes";

/** How long to wait for the auth server before declaring it unreachable. */
export const AUTH_REACHABILITY_TIMEOUT_MS = 2_000;

/**
 * Confirms the Supabase auth server answers before the browser is handed over to it.
 *
 * `signInWithOAuth` only builds a URL — it never touches the network — so a stopped Supabase
 * would otherwise dump the user on a raw browser connection-error page. edge-cases.md requires
 * a friendly message instead.
 */
async function isAuthServerReachable(): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AUTH_REACHABILITY_TIMEOUT_MS);

  try {
    const { supabaseUrl } = getSupabaseEnv();
    // Any HTTP answer proves the server is up; only a transport failure means it is not.
    await fetch(`${supabaseUrl}/auth/v1/health`, {
      signal: controller.signal,
      cache: "no-store",
    });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The only action on the login screen.
 *
 * Design: `mms_B.3_Login` (662:14426) — 305x60, #FFEA9E, radius 8px, padding 16px 24px,
 * gap 8px. Sign-in starts from the browser client on purpose: Supabase stores the PKCE
 * verifier client-side, and the callback route needs it to finish the exchange.
 */
export function GoogleLoginButton({ initialError }: { initialError?: boolean }) {
  const t = useTranslations("login");
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(Boolean(initialError));
  // A ref, not the `pending` state: state updates are not flushed synchronously, so two
  // clicks in the same tick would both read `pending === false` and open two OAuth flows.
  const inFlight = useRef(false);

  async function handleSignIn() {
    if (inFlight.current) return;
    inFlight.current = true;

    setPending(true);
    setFailed(false);

    try {
      const supabase = createSupabaseBrowserClient();

      // `skipBrowserRedirect` hands us the URL instead of navigating immediately, so the
      // reachability check below can run before the page is given away. The PKCE verifier is
      // still stored when the URL is generated, so the callback exchange is unaffected.
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${AUTH_CALLBACK_ROUTE}`,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data?.url) {
        failWith(error?.message ?? "signInWithOAuth returned no URL");
        return;
      }

      if (!(await isAuthServerReachable())) {
        failWith("Supabase auth server is unreachable — is `supabase start` running?");
        return;
      }

      window.location.assign(data.url);
    } catch (cause) {
      // Missing configuration, or the browser client could not be constructed.
      failWith(cause instanceof Error ? cause.message : String(cause));
    }

    function failWith(reason: string) {
      // The user-facing copy is fixed by the design; the reason goes to the console so a
      // developer can tell a stopped Supabase apart from bad credentials.
      console.error("[login] Google sign-in could not start:", reason);
      inFlight.current = false;
      setFailed(true);
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleSignIn}
        disabled={pending}
        className="flex h-15 w-[305px] max-w-full cursor-pointer items-center gap-2 rounded-lg bg-brand-yellow px-6 py-4 text-[22px] leading-7 font-bold text-canvas transition-shadow hover:shadow-lg hover:shadow-black/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? (
          <>
            <span
              role="status"
              aria-label={t("signingIn")}
              className="size-6 shrink-0 animate-spin rounded-full border-2 border-canvas/30 border-t-canvas"
            />
            <span>{t("signingIn")}</span>
          </>
        ) : (
          <>
            {/* 225px label + 8px gap + 24px icon fills the 257px content box exactly —
                without nowrap the label breaks onto a second line. */}
            <span className="whitespace-nowrap">{t("googleButton")}</span>
            <Image
              src="/images/login/google.svg"
              alt=""
              width={24}
              height={24}
              aria-hidden
              className="shrink-0"
            />
          </>
        )}
      </button>

      {failed && (
        <p role="alert" className="max-w-[420px] text-sm font-medium text-red-400">
          {t("error")}
        </p>
      )}
    </div>
  );
}
