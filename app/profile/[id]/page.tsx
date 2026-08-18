import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { KudosAvatar } from "@/components/kudos/kudos-avatar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { signOutAction } from "@/lib/auth/sign-out-action";
import { computeHoaThiTier } from "@/lib/kudos/hoa-thi-tier";
import { isUuid } from "@/lib/kudos/uuid";
import { getHeaderSession } from "@/lib/layout/header-session";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("kudosBoard.stub");
  return { title: t("title") };
}

export default async function ProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const supabase = await createSupabaseServerClient();
  const [{ data }, headerSession, t] = await Promise.all([supabase.from("profiles").select("id, full_name, avatar_url, kudos_received_count").eq("id", id).maybeSingle(), getHeaderSession(), getTranslations("kudosBoard.stub")]);
  if (!data) notFound();
  const tier = computeHoaThiTier(data.kudos_received_count);
  const name = data.full_name ?? "Sunner";
  return <div className="flex min-h-screen flex-col bg-canvas text-white"><SiteHeader variant="full" activeHref="/kudos" onSignOut={signOutAction} {...headerSession} /><main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center"><KudosAvatar name={name} avatarUrl={data.avatar_url} size={120} /><h1 className="text-4xl font-bold text-brand-yellow">{name}</h1><p className="rounded-full border border-accent-border px-5 py-2 font-bold">{tier.title} · {tier.tier} ★</p><p>{t("body")}</p><Link href="/kudos" className="font-bold text-brand-yellow hover:underline">{t("back")}</Link></main><SiteFooter variant="full" activeHref="/kudos" /></div>;
}
