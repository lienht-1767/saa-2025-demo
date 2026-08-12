import Image from "next/image";
import { useTranslations } from "next-intl";

import { CountdownLive } from "@/components/home/countdown-live";
import { EventInfo } from "@/components/home/event-info";
import { CtaLink } from "@/components/ui/cta-link";
import type { CountdownValue } from "@/lib/home/countdown";
import { HEADER_NAV_LINKS } from "@/lib/home/navigation";

/**
 * Hero — `Frame 487` (2167:9031) inside `Bìa` (2167:9030).
 *
 * Figma geometry at 1512px: a 1224px column starting 40px below the header's 96px top padding,
 * stacked 40px apart —
 *   Frame 482  the ROOT FURTHER key visual, 451x200 (`MM_MEDIA_Root Further Logo`, 2788:12911)
 *   Frame 523  countdown and event info, 16px apart
 *   mms_B3     the two calls to action, 40px apart
 * The decorative key visual behind all of it is `.home-artwork` on the page wrapper.
 */
export type HomeHeroProps = {
  /** Forwarded verbatim to `CountdownLive` (AD08): `deadlineMs` for the tick loop, `initial` as
   * the server-computed value the client's first render must match. */
  countdown: { deadlineMs: number | null; initial: CountdownValue };
};

export function HomeHero({ countdown }: HomeHeroProps) {
  const t = useTranslations("home.hero");
  const [, awardsLink, kudosLink] = HEADER_NAV_LINKS;

  return (
    /* mm:2167:9031 */
    <div className="flex w-full flex-col items-start gap-10">
      {/* mm:2167:9032 — the ROOT FURTHER lockup is the page's only top-level heading, and it
          is set as artwork in the design, so the `h1` carries it through the image alt text. */}
      <h1>
        <Image
          src="/images/home/root-further.png"
          alt={t("keyVisualAlt")}
          width={451}
          height={200}
          priority
          className="h-auto w-[260px] max-w-full sm:w-[340px] lg:w-[451px]"
        />
      </h1>

      {/* mm:2167:9034 */}
      <div className="flex flex-col items-start gap-4">
        <CountdownLive {...countdown} />
        <EventInfo />
      </div>

      {/* mm:2167:9062 */}
      <div className="flex flex-wrap items-start gap-4 sm:gap-10">
        <CtaLink href={awardsLink.href} label={t("aboutAwards")} variant="filled" />
        <CtaLink href={kudosLink.href} label={t("aboutKudos")} variant="outlined" />
      </div>
    </div>
  );
}
