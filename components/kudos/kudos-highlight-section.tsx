import { useTranslations } from "next-intl";

import { KudosHighlightCarousel } from "@/components/kudos/kudos-highlight-carousel";
import { KudosHighlightFilters } from "@/components/kudos/kudos-highlight-filters";
import { KudosSectionHeader } from "@/components/kudos/kudos-section-header";
import type { KudosHighlightData } from "@/lib/kudos/types";

/** `B_Highlight` (node `2940:13451`) — header + filters + the 5-card carousel. */
export type KudosHighlightSectionProps = {
  data: KudosHighlightData;
  selectedHashtagId?: string | null;
  selectedDepartmentId?: string | null;
  buildShareUrl: (postId: string) => string;
  onFilterChange?: (filter: { hashtagId: string | null; departmentId: string | null }) => void;
  onOpenProfile?: (personId: string) => void;
  onSelectHashtag?: (hashtag: string) => void;
  onToggleLike?: (postId: string, nextLiked: boolean) => void;
  onOpenKudosDetail?: (postId: string) => void;
};

export function KudosHighlightSection({
  data,
  selectedHashtagId = null,
  selectedDepartmentId = null,
  buildShareUrl,
  onFilterChange,
  onOpenProfile,
  onSelectHashtag,
  onToggleLike,
  onOpenKudosDetail,
}: KudosHighlightSectionProps) {
  const t = useTranslations("kudosBoard.highlight");

  return (
    /* mm:2940:13451 */
    <section aria-labelledby="kudos-highlight-heading" className="flex w-full flex-col items-center gap-10">
      <div id="kudos-highlight-heading" className="w-full">
        <KudosSectionHeader
          caption={t("caption")}
          title={t("title")}
          trailing={
            <KudosHighlightFilters
              hashtagOptions={data.hashtagFilters}
              departmentOptions={data.departmentFilters}
              selectedHashtagId={selectedHashtagId}
              selectedDepartmentId={selectedDepartmentId}
              onFilterChange={onFilterChange}
            />
          }
        />
      </div>
      <KudosHighlightCarousel
        cards={data.cards}
        buildShareUrl={buildShareUrl}
        onOpenProfile={onOpenProfile}
        onSelectHashtag={onSelectHashtag}
        onToggleLike={onToggleLike}
        onOpenKudosDetail={onOpenKudosDetail}
      />
    </section>
  );
}
