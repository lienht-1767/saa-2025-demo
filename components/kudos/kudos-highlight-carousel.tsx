"use client";

import { useTranslations } from "next-intl";

import { KudosHighlightCard } from "@/components/kudos/kudos-highlight-card";
import { IconChevronLeft, IconChevronRight } from "@/components/kudos/kudos-icons";
import { useHighlightCarousel } from "@/lib/kudos/use-highlight-carousel";
import type { KudosHighlightCard as KudosHighlightCardData } from "@/lib/kudos/types";

/**
 * `B.2_HIGHLIGHT KUDOS` + `B.5_slide` (nodes `2940:13461`, `2940:13471`) — the 5-card carousel:
 * centre card prominent, one neighbour faded on each side, circular prev/next arrows (each 80x80,
 * disabled at its end per spec B.2.1/B.2.2), and the "2/5" page indicator.
 */
export type KudosHighlightCarouselProps = {
  cards: readonly KudosHighlightCardData[];
  buildShareUrl: (postId: string) => string;
  onOpenProfile?: (personId: string) => void;
  onSelectHashtag?: (hashtag: string) => void;
  onToggleLike?: (postId: string, nextLiked: boolean) => void;
  onOpenKudosDetail?: (postId: string) => void;
};

export function KudosHighlightCarousel({
  cards,
  buildShareUrl,
  onOpenProfile,
  onSelectHashtag,
  onToggleLike,
  onOpenKudosDetail,
}: KudosHighlightCarouselProps) {
  const t = useTranslations("kudosBoard.highlight");
  const { index, canGoPrev, canGoNext, pageLabel, next, prev } = useHighlightCarousel(cards.length);

  if (cards.length === 0) {
    return <p className="w-full py-16 text-center text-base text-white/70">{t("empty")}</p>;
  }

  const visible = [cards[index - 1], cards[index], cards[index + 1]].filter(
    (card): card is KudosHighlightCardData => card != null,
  );

  return (
    /* mm:2940:13461 */
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex w-full items-center justify-center gap-6 overflow-hidden">
        <button
          type="button"
          onClick={prev}
          disabled={!canGoPrev}
          aria-label={t("prevSlide")}
          className="hidden size-16 shrink-0 items-center justify-center rounded text-white transition-colors duration-200 hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow motion-reduce:transition-none sm:flex"
        >
          <IconChevronLeft className="size-10" />
        </button>

        {visible.map((card) => {
          const isActive = card.id === cards[index].id;
          return (
            <div key={card.id} className={isActive ? "flex w-full justify-center" : "hidden lg:flex lg:w-full lg:justify-center"}>
              <KudosHighlightCard
                card={card}
                isActive={isActive}
                shareUrl={buildShareUrl(card.id)}
                onOpenProfile={onOpenProfile}
                onSelectHashtag={onSelectHashtag}
                onToggleLike={onToggleLike}
                onOpenKudosDetail={onOpenKudosDetail}
              />
            </div>
          );
        })}

        <button
          type="button"
          onClick={next}
          disabled={!canGoNext}
          aria-label={t("nextSlide")}
          className="hidden size-16 shrink-0 items-center justify-center rounded text-white transition-colors duration-200 hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow motion-reduce:transition-none sm:flex"
        >
          <IconChevronRight className="size-10" />
        </button>
      </div>
      <p className="text-sm font-bold text-white/70" aria-live="polite">
        {pageLabel}
      </p>
    </div>
  );
}
