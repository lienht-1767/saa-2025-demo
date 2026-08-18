import { KudosAllKudosSection } from "@/components/kudos/kudos-all-kudos-section";
import { KudosHero } from "@/components/kudos/kudos-hero";
import { KudosHighlightSection } from "@/components/kudos/kudos-highlight-section";
import { KudosSpotlightSection } from "@/components/kudos/kudos-spotlight-section";
import type { KudosBoardProps } from "@/lib/kudos/types";

/**
 * Composed root for the "Sun* Kudos — Live board" screen (MoMorph `MaZUn5xHXZ`, node `2940:13431`):
 * hero, HIGHLIGHT KUDOS, SPOTLIGHT BOARD, ALL KUDOS. Presentational only — `data` is the board's
 * entire content; every server-backed action arrives as an optional no-op-by-default callback in
 * `callbacks`. `app/kudos/page.tsx` mounts this inside the existing `SiteHeader`/`SiteFooter` chrome.
 */
export function KudosBoard({ data, callbacks, filters }: KudosBoardProps) {
  function buildShareUrl(postId: string): string {
    // Presentational-only: this board has no origin/base-URL config of its own, so it shares a
    // relative path. The data layer is free to swap in an absolute URL via a real backing store.
    return `/kudos/${postId}`;
  }

  return (
    <div className="flex w-full flex-col items-center gap-20">
      <KudosHero onOpenKudosComposer={callbacks?.onOpenKudosComposer} onSearchProfile={callbacks?.onSearchProfile} />
      <KudosHighlightSection
        data={data.highlight}
        selectedHashtagId={filters?.hashtagId ?? null}
        selectedDepartmentId={filters?.departmentId ?? null}
        buildShareUrl={buildShareUrl}
        onFilterChange={callbacks?.onFilterChange}
        onOpenProfile={callbacks?.onOpenProfile}
        onSelectHashtag={callbacks?.onSelectHashtag}
        onToggleLike={callbacks?.onToggleLike}
        onOpenKudosDetail={callbacks?.onOpenKudosDetail}
      />
      <KudosSpotlightSection data={data.spotlight} onSelectNode={callbacks?.onOpenKudosDetail} />
      <KudosAllKudosSection
        data={data.feed}
        buildShareUrl={buildShareUrl}
        onLoadMore={callbacks?.onLoadMore}
        onOpenProfile={callbacks?.onOpenProfile}
        onSelectHashtag={callbacks?.onSelectHashtag}
        onToggleLike={callbacks?.onToggleLike}
        onOpenKudosDetail={callbacks?.onOpenKudosDetail}
        onOpenSecretBox={callbacks?.onOpenSecretBox}
      />
    </div>
  );
}
