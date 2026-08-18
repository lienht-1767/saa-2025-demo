"use client";

import { useTranslations } from "next-intl";

import { KudosCopyToast } from "@/components/kudos/kudos-copy-toast";
import { IconArrowDetail, IconCopyLink, IconHeart } from "@/components/kudos/kudos-icons";
import { formatLikeCount } from "@/lib/kudos/format-like-count";
import { useCopyLink } from "@/lib/kudos/use-copy-link";

/**
 * `B.4.4_Action` (highlight card, node `335:9461`) and `C.4_Button` (all-kudos post, node
 * `256:5194`) — like count + heart toggle, "Copy Link", and (highlight only) "Xem chi tiết".
 * Heart state: grey/inactive vs red/active per spec C.4.1. "Sender cannot like their own kudos" is
 * enforced server-side (RLS, per clarifications.md) — this board has no current-viewer identity
 * in its data contract, so that rule isn't re-implemented client-side here.
 */
export type KudosActionRowProps = {
  postId: string;
  likeCount: number;
  likedByViewer: boolean;
  shareUrl: string;
  variant: "highlight" | "feed";
  onToggleLike?: (postId: string, nextLiked: boolean) => void;
  onOpenKudosDetail?: (postId: string) => void;
  disabled?: boolean;
  pending?: boolean;
};

export function KudosActionRow({
  postId,
  likeCount,
  likedByViewer,
  shareUrl,
  variant,
  onToggleLike,
  onOpenKudosDetail,
  disabled = false,
  pending = false,
}: KudosActionRowProps) {
  const t = useTranslations("kudosBoard.actions");
  const { status, copy } = useCopyLink();

  return (
    /* mm:335:9461 */
    <div className="flex w-full items-center justify-between gap-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => copy(shareUrl)}
          className="flex items-center gap-1 rounded p-4 text-base leading-6 font-bold text-ink hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
        >
          <IconCopyLink className="size-6" />
          {t("copyLink")}
        </button>
        {variant === "highlight" && (
          <button
            type="button"
            onClick={() => onOpenKudosDetail?.(postId)}
            className="flex items-center gap-1 rounded p-4 text-base leading-6 font-bold text-ink hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
          >
            {t("viewDetail")}
            <IconArrowDetail className="size-6" />
          </button>
        )}
        <KudosCopyToast status={status} />
      </div>
      <button
        type="button"
        aria-pressed={likedByViewer}
        aria-label={t("toggleLike")}
        aria-busy={pending}
        disabled={disabled || pending}
        onClick={() => onToggleLike?.(postId, !likedByViewer)}
        className="flex items-center gap-1 rounded p-1 text-2xl leading-8 font-bold text-ink disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
      >
        {formatLikeCount(likeCount)}
        <IconHeart className={`size-8 ${likedByViewer ? "text-badge-danger" : "text-kudos-muted"}`} />
      </button>
    </div>
  );
}
