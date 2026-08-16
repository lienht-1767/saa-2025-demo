import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";

import { PrelaunchCountdownLive } from "@/components/countdown/countdown-live";
import { computeCountdown, resolveEventStart } from "@/lib/home/countdown";

export const metadata: Metadata = {
  title: "Countdown | Sun* Annual Awards 2025",
};

/** SCR-countdown — Figma 2268:35127, "Countdown - Prelaunch page". */
export default async function CountdownPage() {
  await connection();
  const t = await getTranslations("countdownPage");
  const deadlineMs = resolveEventStart();
  // Request-time seed keeps the server markup and first client render identical.
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now();

  if (deadlineMs !== null && deadlineMs <= nowMs) {
    redirect("/");
  }

  const initial = computeCountdown(deadlineMs, nowMs);

  return (
    /* mm:2268:35127 */
    <main className="relative isolate flex min-h-screen min-h-dvh items-center justify-center overflow-hidden bg-canvas px-4 py-6">
      {/* mm:2268:35129 — the same clean MM_MEDIA artwork export used by the login frame. */}
      <Image
        src="/images/login/hero-background.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-right"
      />

      {/* mm:2268:35130 */}
      <div aria-hidden className="countdown-prelaunch-cover pointer-events-none absolute inset-0 -z-10" />

      {deadlineMs === null ? (
        <section className="text-center text-white" aria-labelledby="countdown-title">
          <h1 id="countdown-title" className="text-xl leading-7 font-bold md:text-4xl md:leading-12">
            {t("title")}
          </h1>
          <p className="mt-6 text-base font-medium md:text-xl">{t("comingSoon")}</p>
        </section>
      ) : (
        <PrelaunchCountdownLive deadlineMs={deadlineMs} initial={initial} />
      )}
    </main>
  );
}
