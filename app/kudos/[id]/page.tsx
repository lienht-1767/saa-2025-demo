import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { KudosPersonBlock } from "@/components/kudos/kudos-person-block";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentProfile } from "@/lib/auth/profile";
import { signOutAction } from "@/lib/auth/sign-out-action";
import { LOGIN_ROUTE } from "@/lib/auth/routes";
import { formatPostTime } from "@/lib/kudos/format-post-time";
import { getKudosDetail } from "@/lib/kudos/read/get-kudos-detail";
import { isUuid } from "@/lib/kudos/uuid";
import { getHeaderSession } from "@/lib/layout/header-session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("kudosBoard.stub");
  return { title: t("title") };
}

export default async function KudosDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const viewer = await getCurrentProfile();
  if (!viewer) redirect(LOGIN_ROUTE);
  const [detail, headerSession, t] = await Promise.all([getKudosDetail(id), getHeaderSession(), getTranslations("kudosBoard.stub")]);
  if (!detail) notFound();
  // detail.messageHtml is sanitized in this request by getKudosDetail's `sanitizeKudosHtml` —
  // never a raw column, never client-supplied.
  return <div className="flex min-h-screen flex-col bg-canvas text-white"><SiteHeader variant="full" activeHref="/kudos" onSignOut={signOutAction} {...headerSession} /><main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16"><h1 className="text-4xl font-bold text-brand-yellow">{t("title")}</h1><div className="rounded-2xl bg-kudos-card p-6 text-ink">{detail.title && <p className="text-center text-base font-bold tracking-[0.5px] text-ink">{detail.title}</p>}<div className="flex items-start justify-between gap-6"><KudosPersonBlock person={detail.sender} /><KudosPersonBlock person={detail.recipient} /></div><p className="mt-8 text-sm text-ink/60">{formatPostTime(detail.createdAt)}</p><div className="mt-4 text-lg leading-8 break-words [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:ml-1 [&_blockquote]:border-l-4 [&_blockquote]:border-ink/30 [&_blockquote]:pl-3 [&_blockquote]:italic [&_a]:underline [&_a]:text-ink" dangerouslySetInnerHTML={{ __html: detail.messageHtml }} /><p className="mt-6 font-bold">♥ {detail.likeCount}</p></div><p>{t("body")}</p><Link href="/kudos" className="font-bold text-brand-yellow hover:underline">{t("back")}</Link></main><SiteFooter variant="full" activeHref="/kudos" /></div>;
}
