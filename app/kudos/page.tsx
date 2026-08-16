import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { signOutAction } from "@/lib/auth/sign-out-action";
import { getHeaderSession } from "@/lib/layout/header-session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.kudos");

  return { title: t("title"), description: t("description") };
}

export default async function KudosPage() {
  const [t, headerSession] = await Promise.all([
    getTranslations("kudosPage"),
    getHeaderSession(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-white">
      <SiteHeader
        variant="full"
        activeHref="/kudos"
        onSignOut={signOutAction}
        {...headerSession}
      />
      <main className="mx-auto flex w-full max-w-[1152px] flex-1 flex-col items-center gap-10 px-6 py-16 text-center md:px-16 lg:py-24">
        <p className="text-2xl leading-8 font-bold">{t("eyebrow")}</p>
        <h1 className="text-4xl leading-tight font-bold text-brand-yellow lg:text-[57px] lg:leading-16">
          {t("title")}
        </h1>
        <Image src="/images/home/kudos-logo.svg" alt="Sun* Kudos" width={364} height={72} />
        <p className="max-w-3xl whitespace-pre-line text-left text-base leading-7 font-bold tracking-[0.5px] md:text-center">
          {t("body")}
        </p>
        <p className="rounded-lg border border-accent-border px-5 py-3 text-sm text-white/75">
          {t("comingSoon")}
        </p>
      </main>
      <SiteFooter variant="full" activeHref="/kudos" />
    </div>
  );
}
