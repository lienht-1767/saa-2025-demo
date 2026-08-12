import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { GoogleLoginButton } from "@/components/login/google-login-button";

/**
 * Main content region — `mms_B_Bìa` (662:14393).
 *
 * Figma geometry this reproduces at a 1440px viewport:
 *   mms_B_Bìa   padding 96px 144px
 *   Frame 487   1152x653, flex column, gap 80px, justify-content center
 *   Key Visual  ROOT FURTHER image, 451x200, left edge x=144
 *   Frame 550   flex column, gap 24px, padding-left 16px (so copy sits 16px in from the
 *               key visual — the indent is in the design, not an accident)
 *   copy        480x80, Montserrat 700, 20px/40px, letter-spacing 0.5px
 *   button      305x60 at x=160
 */
export async function LoginHero({ authFailed }: { authFailed: boolean }) {
  const t = await getTranslations("login");

  return (
    /* `mt-2` reproduces the 8px band between the header (ends y=80) and mms_B_Bìa
       (starts y=88) in the design — without it the whole stack rides ~4px high. */
    <main className="flex flex-1 justify-center px-6 py-16 md:mt-2 md:px-16 md:py-24 lg:px-36">
      {/* Frame 487 — centres the stack vertically within the content box. The desktop
          content box is 653px tall, leaving an odd 209px of free space around the
          444px stack. Browsers split that into 104.5px per side while Figma snaps the
          stack to the upper pixel, so remove that measured half-pixel at md and above. */}
      <div className="flex w-full max-w-[1152px] flex-col justify-center gap-10 md:translate-y-[-0.5px] md:gap-20">
        <Image
          src="/images/login/root-further.png"
          alt={t("keyVisualAlt")}
          width={451}
          height={200}
          priority
          className="h-auto w-[280px] max-w-full md:w-[380px] lg:w-[451px]"
        />

        {/* Frame 550 — the 16px left indent is `padding: 0 0 0 16px` in the design. */}
        <div className="flex flex-col items-start gap-6 pl-0 md:pl-4">
          <div className="max-w-[480px] text-xl leading-10 font-bold tracking-[0.5px] text-white">
            <p>{t("intro")}</p>
            <p>{t("tagline")}</p>
          </div>

          <GoogleLoginButton initialError={authFailed} />
        </div>
      </div>
    </main>
  );
}
