import { useTranslations } from "next-intl";

import { KudosFeedList } from "@/components/kudos/kudos-feed-list";
import { KudosSectionHeader } from "@/components/kudos/kudos-section-header";
import { KudosSidebarGuestCta } from "@/components/kudos/kudos-sidebar-guest-cta";
import { KudosSidebarRecentGifts } from "@/components/kudos/kudos-sidebar-recent-gifts";
import { KudosSidebarStats } from "@/components/kudos/kudos-sidebar-stats";
import type { KudosFeedData } from "@/lib/kudos/types";

/**
 * `C_All kudos` + `D_Thống menu phải` (nodes `2940:13475`, `2940:13488`) — the feed and its
 * sidebar. Desktop is a two-column layout (feed 680px, sidebar 422px, per the evidenced widths);
 * the sidebar stacks below the feed on narrower viewports, per this task's responsive scope.
 */
export type KudosAllKudosSectionProps = {
  data: KudosFeedData;
  buildShareUrl: (postId: string) => string;
  onLoadMore?: () => void;
  onOpenProfile?: (personId: string) => void;
  onSelectHashtag?: (hashtag: string) => void;
  onToggleLike?: (postId: string, nextLiked: boolean) => void;
  onOpenKudosDetail?: (postId: string) => void;
  onOpenSecretBox?: () => void;
};

export function KudosAllKudosSection({
  data,
  buildShareUrl,
  onLoadMore,
  onOpenProfile,
  onSelectHashtag,
  onToggleLike,
  onOpenKudosDetail,
  onOpenSecretBox,
}: KudosAllKudosSectionProps) {
  const t = useTranslations("kudosBoard.feed");

  return (
    <section aria-labelledby="kudos-all-heading" className="flex w-full flex-col items-start gap-10">
      <div id="kudos-all-heading" className="w-full">
        <KudosSectionHeader caption={t("caption")} title={t("title")} />
      </div>
      <div className="flex w-full flex-col items-start gap-10 lg:flex-row">
        <div className="w-full lg:max-w-[680px] lg:flex-1">
          <KudosFeedList
            posts={data.posts}
            hasMore={data.hasMore}
            buildShareUrl={buildShareUrl}
            onLoadMore={onLoadMore}
            onOpenProfile={onOpenProfile}
            onSelectHashtag={onSelectHashtag}
            onToggleLike={onToggleLike}
            onOpenKudosDetail={onOpenKudosDetail}
          />
        </div>
        <aside className="flex w-full flex-col gap-6 lg:max-w-[422px]">
          {data.stats ? (
            <KudosSidebarStats stats={data.stats} onOpenSecretBox={onOpenSecretBox} />
          ) : (
            <KudosSidebarGuestCta />
          )}
          <KudosSidebarRecentGifts gifts={data.recentGifts} onOpenProfile={onOpenProfile} />
        </aside>
      </div>
    </section>
  );
}
