import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { LoginHero } from "./login-hero";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("login");

  return { title: t("title"), description: t("description") };
}

/**
 * SCR-login — MoMorph screen GzbNeVGJHz (Figma 662:14387).
 *
 * The key visual (`mms_C_Keyvisual`, 662:14388) spans the header AND the main content in
 * the design, with the header painted over it at 80% opacity — hence the shared
 * `.login-artwork` wrapper. The footer sits on the flat base colour instead.
 *
 * `?error=auth` is set by the callback route on any failed exchange; it renders the
 * design's error copy under the login button.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <div className="login-artwork flex flex-1 flex-col">
        <SiteHeader />
        <LoginHero authFailed={error === "auth"} />
      </div>
      <SiteFooter />
    </div>
  );
}
