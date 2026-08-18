import { useTranslations } from "next-intl";

import { KudosActionRow } from "@/components/kudos/kudos-action-row";
import { IconArrowDetail } from "@/components/kudos/kudos-icons";
import { KudosHashtagRow } from "@/components/kudos/kudos-hashtag-row";
import { KudosPersonBlock } from "@/components/kudos/kudos-person-block";
import { formatPostTime } from "@/lib/kudos/format-post-time";
import type { KudosHighlightCard as KudosHighlightCardData } from "@/lib/kudos/types";

/**
 * `B.3_KUDO - Highlight` (node `2940:13465`): 528px card, 16px radius, `#FFF8E1` fill, a 4px gold
 * border when centred/active — faded and non-interactive on the sides (spec: "Active/center: Nổi
 * bật hơn; Inactive: Mờ/che về 2 bên"). MoMorph's static export repeats the same active-state
 * styling on every sibling card instance (no distinct "inactive" variant was captured), so the
 * faded treatment below (`opacity`, no border, `pointer-events-none`) is this repo's own
 * reasonable rendering of that state description, not read off the design.
 */
/**
 * Minimal typography for the rich-text markup `sanitizeKudosHtml` allows through (b/i/s, ol/li,
 * a, blockquote): list markers visible, quote indented, link underlined — legible inside the
 * cream card without touching the shared stylesheet (Track A owns `app/globals.css`).
 */
const KUDOS_RICH_TEXT_CLASSES =
  "[&_ol]:list-decimal [&_ol]:pl-6 [&_li]:ml-1 [&_blockquote]:border-l-4 [&_blockquote]:border-ink/30 [&_blockquote]:pl-3 [&_blockquote]:italic [&_a]:underline [&_a]:text-ink break-words";

export type KudosHighlightCardProps = {
  card: KudosHighlightCardData;
  isActive: boolean;
  shareUrl: string;
  onOpenProfile?: (personId: string) => void;
  onSelectHashtag?: (hashtag: string) => void;
  onToggleLike?: (postId: string, nextLiked: boolean) => void;
  onOpenKudosDetail?: (postId: string) => void;
};

export function KudosHighlightCard({
  card,
  isActive,
  shareUrl,
  onOpenProfile,
  onSelectHashtag,
  onToggleLike,
  onOpenKudosDetail,
}: KudosHighlightCardProps) {
  const t = useTranslations("kudosBoard.highlight");

  return (
    /* mm:2940:13465 */
    <article
      aria-hidden={!isActive}
      className={`flex w-full max-w-[528px] shrink-0 flex-col items-start gap-4 rounded-2xl bg-kudos-card px-6 pt-6 pb-4 transition-[opacity,border-color] duration-300 motion-reduce:transition-none ${
        isActive ? "border-4 border-brand-yellow opacity-100" : "pointer-events-none border-4 border-transparent opacity-40"
      }`}
    >
      <div className="flex w-full items-start justify-between gap-6">
        {/* An anonymous sender maps to a `sender.id === ""` sentinel (map-board-data.ts) — no
            real profile to link to, so onOpenProfile is withheld for that block only. */}
        <KudosPersonBlock person={card.sender} onOpenProfile={isActive && card.sender.id ? onOpenProfile : undefined} />
        <IconArrowDetail aria-hidden className="mt-12 size-8 shrink-0 text-ink" />
        <KudosPersonBlock person={card.receiver} onOpenProfile={isActive ? onOpenProfile : undefined} />
      </div>
      <hr className="h-px w-full border-0 bg-brand-yellow" />
      <div className="flex w-full flex-col gap-4">
        <p className="text-base leading-6 font-bold tracking-[0.5px] text-kudos-muted">{formatPostTime(card.postedAt)}</p>
        <div className="w-full rounded-xl border border-brand-yellow bg-brand-yellow/40 px-6 py-4">
          {/* card.contentHtml is sanitized in this request by map-board-data.ts's
              `sanitizeKudosHtml` — never a raw column, never client-supplied. */}
          <div
            className={`${KUDOS_RICH_TEXT_CLASSES} line-clamp-3 text-xl leading-8 font-bold text-justify text-ink`}
            dangerouslySetInnerHTML={{ __html: card.contentHtml }}
          />
        </div>
        <KudosHashtagRow hashtags={card.hashtags} onSelectHashtag={isActive ? onSelectHashtag : undefined} />
      </div>
      <hr className="h-px w-full border-0 bg-brand-yellow" />
      {isActive ? (
        <KudosActionRow
          postId={card.id}
          likeCount={card.likeCount}
          likedByViewer={card.likedByViewer}
          shareUrl={shareUrl}
          variant="highlight"
          onToggleLike={onToggleLike}
          onOpenKudosDetail={onOpenKudosDetail}
          disabled={card.likeDisabled}
          pending={card.likePending}
        />
      ) : (
        <span className="sr-only">{t("inactiveCard")}</span>
      )}
    </article>
  );
}
