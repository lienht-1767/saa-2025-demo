import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CtaLink } from "@/components/ui/cta-link";
import { signOutAction } from "@/lib/auth/sign-out-action";
import { getHeaderSession } from "@/lib/layout/header-session";

export default async function NotFound() {
  const [t, headerSession] = await Promise.all([
    getTranslations("notFound"),
    getHeaderSession(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-white">
      <SiteHeader variant="full" onSignOut={signOutAction} {...headerSession} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-6 py-20 text-center">
        <p className="text-2xl font-bold tracking-[0.25em] text-white/60">404</p>
        <h1 className="text-4xl leading-tight font-bold text-brand-yellow lg:text-[57px] lg:leading-16">
          {t("title")}
        </h1>
        <p className="max-w-xl text-base leading-7 font-medium text-white/80">{t("description")}</p>
        <CtaLink href="/" label={t("backHome")} variant="filled" size="md" />
        <Link href="/awards" className="text-sm font-bold text-brand-yellow underline-offset-4 hover:underline">
          {t("viewAwards")}
        </Link>
      </main>
      <SiteFooter variant="full" />
    </div>
  );
}
