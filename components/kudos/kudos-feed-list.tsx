"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import { KudosFeedCard } from "@/components/kudos/kudos-feed-card";
import type { KudosFeedPost } from "@/lib/kudos/types";

/**
 * `C.2_Danh sách lời cảm ơn` (node `2940:13482`) — the vertical feed of kudos posts. The design's
 * "infinity scroll" (spec C) needs a server round-trip, so it's exposed as a "Load more" button
 * calling the optional `onLoadMore` — an actual scroll-triggered fetch is the data-layer's job.
 */
export type KudosFeedListProps = {
  posts: readonly KudosFeedPost[];
  hasMore: boolean;
  buildShareUrl: (postId: string) => string;
  onLoadMore?: () => void;
  onOpenProfile?: (personId: string) => void;
  onSelectHashtag?: (hashtag: string) => void;
  onToggleLike?: (postId: string, nextLiked: boolean) => void;
  onOpenKudosDetail?: (postId: string) => void;
};

export function KudosFeedList({
  posts,
  hasMore,
  buildShareUrl,
  onLoadMore,
  onOpenProfile,
  onSelectHashtag,
  onToggleLike,
  onOpenKudosDetail,
}: KudosFeedListProps) {
  const t = useTranslations("kudosBoard.feed");
  const loadMoreRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !onLoadMore || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
    }, { rootMargin: "300px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [onLoadMore, posts.length]);

  if (posts.length === 0) {
    return <p className="w-full py-16 text-center text-base text-white/70">{t("empty")}</p>;
  }

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {posts.map((post) => (
        <KudosFeedCard
          key={post.id}
          post={post}
          shareUrl={buildShareUrl(post.id)}
          onOpenProfile={onOpenProfile}
          onSelectHashtag={onSelectHashtag}
          onToggleLike={onToggleLike}
          onOpenKudosDetail={onOpenKudosDetail}
        />
      ))}
      {hasMore && (
        <button
          ref={loadMoreRef}
          type="button"
          onClick={onLoadMore}
          className="rounded-lg border border-accent-border px-6 py-3 text-sm font-bold text-white hover:bg-brand-yellow/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
        >
          {t("loadMore")}
        </button>
      )}
    </div>
  );
}
