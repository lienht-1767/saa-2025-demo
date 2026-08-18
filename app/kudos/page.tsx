import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { KudosBoardLive } from "@/components/kudos/kudos-board-live";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentProfile } from "@/lib/auth/profile";
import { signOutAction } from "@/lib/auth/sign-out-action";
import { getHeaderSession } from "@/lib/layout/header-session";
import { parseBoardFilters, type BoardSearchParams } from "@/lib/kudos/read/board-filters";
import { getKudosBoardData } from "@/lib/kudos/read/get-board-data";
import type { KudosBoardData } from "@/lib/kudos/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.kudos");

  return { title: t("title"), description: t("description") };
}

type KudosPageProps = {
  searchParams: Promise<BoardSearchParams>;
};

/**
 * The `/kudos` live board (MoMorph `MaZUn5xHXZ`). Public route (`lib/auth/routes.ts`) — a guest
 * sees the full board, and every action pushes to `/login` from inside `KudosBoardLive` instead
 * of the route itself gating access (plan Security Considerations: the real boundary is the
 * action layer, RLS on writes, not this page).
 */
export default async function KudosPage({ searchParams }: KudosPageProps) {
  const [headerSession, profile, resolvedSearchParams] = await Promise.all([
    getHeaderSession(),
    getCurrentProfile(),
    searchParams,
  ]);

  const filters = parseBoardFilters(resolvedSearchParams);
  const boardData = await getKudosBoardData({ viewerId: profile?.userId ?? null, filters });

  // The read layer has no viewer to compute stats from for a guest, so it returns an all-zero
  // `KudosSidebarStats` rather than `null` (see its own comment in get-board-data.ts). This is
  // the one place that turns that into the `null` the guest CTA branches on (types.ts).
  const data: KudosBoardData = headerSession.isAuthenticated
    ? boardData
    : { ...boardData, feed: { ...boardData.feed, stats: null } };

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-white">
      <SiteHeader
        variant="full"
        activeHref="/kudos"
        onSignOut={signOutAction}
        {...headerSession}
      />
      <main className="mx-auto flex w-full max-w-[1512px] flex-1 flex-col items-center px-6 py-16 md:px-16">
        <KudosBoardLive
          data={data}
          isAuthenticated={headerSession.isAuthenticated}
          viewerId={profile?.userId ?? null}
          filters={filters}
        />
      </main>
      <SiteFooter variant="full" activeHref="/kudos" />
    </div>
  );
}
