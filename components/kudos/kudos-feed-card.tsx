"use client";

import { KudosActionRow } from "@/components/kudos/kudos-action-row";
import { KudosFeedAttachments } from "@/components/kudos/kudos-feed-attachments";
import { KudosHashtagRow } from "@/components/kudos/kudos-hashtag-row";
import { IconArrowDetail } from "@/components/kudos/kudos-icons";
import { KudosPersonBlock } from "@/components/kudos/kudos-person-block";
import { formatPostTime } from "@/lib/kudos/format-post-time";
import type { KudosFeedPost } from "@/lib/kudos/types";

/**
 * `C.3_KUDO Post` (node `3127:21871`): 24px-radius `#FFF8E1` card, 40/40/16/40 padding, gold 1px
 * dividers between the people row / content / action row. Clicking the card opens the kudos
 * detail page (spec C: "Click thẻ: mở trang/nội dung chi tiết của kudos"); the sender/receiver
 * blocks, hashtag chips, and action buttons stop that click from bubbling since each has its own
 * navigation.
 */
export type KudosFeedCardProps = {
  post: KudosFeedPost;
  shareUrl: string;
  onOpenProfile?: (personId: string) => void;
  onSelectHashtag?: (hashtag: string) => void;
  onToggleLike?: (postId: string, nextLiked: boolean) => void;
  onOpenKudosDetail?: (postId: string) => void;
};

export function KudosFeedCard({
  post,
  shareUrl,
  onOpenProfile,
  onSelectHashtag,
  onToggleLike,
  onOpenKudosDetail,
}: KudosFeedCardProps) {
  return (
    /* mm:3127:21871 */
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpenKudosDetail?.(post.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onOpenKudosDetail?.(post.id);
      }}
      className="flex w-full cursor-pointer flex-col items-start gap-4 rounded-2xl bg-kudos-card px-6 py-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow sm:px-10 sm:pt-10 sm:pb-4"
    >
      <div className="flex w-full items-start justify-between gap-6" onClick={(event) => event.stopPropagation()}>
        <KudosPersonBlock person={post.sender} onOpenProfile={onOpenProfile} />
        <IconArrowDetail aria-hidden className="mt-12 size-8 shrink-0 text-ink" />
        <KudosPersonBlock person={post.receiver} onOpenProfile={onOpenProfile} />
      </div>
      <hr className="h-px w-full border-0 bg-brand-yellow" />
      <div className="flex w-full flex-col gap-4">
        <p className="text-base leading-6 font-bold tracking-[0.5px] text-kudos-muted">{formatPostTime(post.postedAt)}</p>
        {post.tagLine && (
          <p className="text-center text-base leading-6 font-bold tracking-[0.5px] text-ink">{post.tagLine}</p>
        )}
        <div className="w-full rounded-xl border border-brand-yellow bg-brand-yellow/40 px-6 py-4">
          <p className="line-clamp-5 text-xl leading-8 font-bold text-justify text-ink">{post.content}</p>
        </div>
        <div onClick={(event) => event.stopPropagation()}>
          <KudosFeedAttachments attachments={post.attachments} />
        </div>
        <div onClick={(event) => event.stopPropagation()}>
          <KudosHashtagRow hashtags={post.hashtags} onSelectHashtag={onSelectHashtag} />
        </div>
      </div>
      <hr className="h-px w-full border-0 bg-brand-yellow" />
      <div className="w-full" onClick={(event) => event.stopPropagation()}>
        <KudosActionRow
          postId={post.id}
          likeCount={post.likeCount}
          likedByViewer={post.likedByViewer}
          shareUrl={shareUrl}
          variant="feed"
          onToggleLike={onToggleLike}
          disabled={post.likeDisabled}
          pending={post.likePending}
        />
      </div>
    </article>
  );
}
