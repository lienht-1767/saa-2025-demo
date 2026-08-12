import { connection } from "next/server";

import { AwardsSection } from "@/components/home/awards-section";
import { HomeHero } from "@/components/home/home-hero";
import { KudosSection } from "@/components/home/kudos-section";
import { QuickActionWidget } from "@/components/home/quick-action-widget";
import { RootFurtherSection } from "@/components/home/root-further-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { computeCountdown, resolveEventStart } from "@/lib/home/countdown";

/**
 * SCR-home — MoMorph screen i87tDx10uM (Figma 2167:9026, "Homepage SAA").
 *
 * The frame is 1512 wide on a #00101A base, with `Bìa` (2167:9030) holding the four content
 * sections 120px apart inside 96px/144px padding. `mms_3.5_Keyvisual` (2167:9027) and the
 * `Cover` scrim (2167:9029) cover the top 1480px only, so they are painted as one decorative
 * layer behind the header and hero rather than as a wrapper — `main` has to span every section.
 *
 * `/` is a public route. Until the session read layer lands, the authenticated design state is
 * rendered here so the notification and account controls from Figma remain visible and usable.
 * Replace this preview state with real session data without changing the header component.
 */
const FIGMA_HEADER_PREVIEW = {
  isAuthenticated: true,
  isAdmin: false,
  unreadNotificationCount: 1,
} as const;

export default async function HomePage() {
  await connection();
  const deadlineMs = resolveEventStart();
  // Request-time snapshot for the hydration-safe countdown seed. `connection()` above keeps this
  // non-deterministic read out of prerendering, per the Next.js 16 runtime guidance.
  // eslint-disable-next-line react-hooks/purity
  const initial = computeCountdown(deadlineMs, Date.now());

  return (
    /* mm:2167:9026 */
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-canvas">
      {/* mm:2167:9027 + mm:2167:9029 — key visual and its scrim, top 1480px of the 1512 frame. */}
      <div
        aria-hidden
        className="home-artwork pointer-events-none absolute inset-x-0 top-0 aspect-1512/1480 w-full"
      />

      <SiteHeader variant="full" activeHref="/" {...FIGMA_HEADER_PREVIEW} />

      {/* mm:2167:9030 */}
      <main className="relative mx-auto flex w-full max-w-[1512px] flex-1 flex-col items-center gap-20 px-6 py-16 md:px-16 lg:gap-30 lg:px-36 lg:py-24">
        <HomeHero countdown={{ deadlineMs, initial }} />
        <RootFurtherSection />
        <AwardsSection />
        <KudosSection />
      </main>

      {/* No `activeHref`: the design's yellow-tinted footer link is the component's hover
          state (I5001:14800;342:1411), not a persistent selection. */}
      <SiteFooter variant="full" />

      {/* mm:5022:15169 */}
      <QuickActionWidget />
    </div>
  );
}
