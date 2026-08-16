import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { AwardsList } from "@/components/awards/awards-list";
import { AwardsNav } from "@/components/awards/awards-nav";
import { AwardsTitleBlock } from "@/components/awards/awards-title-block";
import { KudosSection } from "@/components/home/kudos-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AWARD_ROWS } from "@/lib/awards/award-rows";
import { signOutAction } from "@/lib/auth/sign-out-action";
import { getHeaderSession } from "@/lib/layout/header-session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.awards");

  return { title: t("title"), description: t("description") };
}

/**
 * SCR-awards — MoMorph screen zFYDgyj_pD (Figma 313:8436, "Hệ thống giải thưởng").
 *
 * `Cover` (313:8439) + `mms_3_Keyvisual` (313:8437) paint the same dark-fading keyvisual
 * language as the homepage, but only behind the header and title block — `.awards-artwork` in
 * `globals.css` is a shorter variant of `.home-artwork` sized for that smaller decorative area.
 *
 * `/awards` requires a session per `clarifications.md`; the header derives its chrome from that
 * validated request session instead of exposing preview notification/admin state.
 */
export default async function AwardsPage() {
  const headerSession = await getHeaderSession();

  return (
    /* mm:313:8436 */
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-canvas">
      {/* mm:313:8439 + mm:313:8437 */}
      <div
        aria-hidden
        className="awards-artwork pointer-events-none absolute inset-x-0 top-0 h-[360px] w-full sm:h-[420px] md:h-[460px] xl:aspect-1440/627 xl:h-auto"
      />

      <SiteHeader
        variant="full"
        surface="solid"
        activeHref="/awards"
        onSignOut={signOutAction}
        {...headerSession}
      />

      {/* mm:313:8449 */}
      <main className="relative mx-auto flex w-full max-w-[1512px] flex-1 flex-col items-center px-6 pt-16 pb-20 md:px-16 xl:px-0 xl:pt-[104px] xl:pb-[110px]">
        <span id="tieu-chuan-chung" aria-hidden className="absolute top-0 scroll-mt-24" />

        <div className="mx-auto flex w-full max-w-[1152px] flex-col items-center gap-16 xl:gap-[120px]">
            {/* mm:313:8450 — MM_MEDIA_Root Further Logo (2789:12915), the same wordmark asset as
                the homepage hero (2788:12911), measured at 338x150 in this frame. */}
            <Image
              src="/images/home/root-further.png"
              alt="Root Further"
              width={451}
              height={200}
              className="h-auto w-[180px] self-start sm:w-[220px] lg:w-[338px]"
            />
            <AwardsTitleBlock />
        </div>

        {/* mm:313:8458 */}
        <div className="mx-auto mt-16 grid w-full max-w-[1152px] grid-cols-1 items-start gap-10 xl:mt-[120px] xl:grid-cols-[178px_854px] xl:gap-[120px]">
          <AwardsNav rows={AWARD_ROWS} />
          <AwardsList />
        </div>

        <div className="mt-24 w-full xl:mt-[110px]">
          <KudosSection variant="awards" />
        </div>
      </main>

      <SiteFooter variant="full" activeHref="/awards" />
    </div>
  );
}
