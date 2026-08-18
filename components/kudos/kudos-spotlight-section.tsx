import { useTranslations } from "next-intl";

import { KudosSectionHeader } from "@/components/kudos/kudos-section-header";
import { KudosSpotlightBoard } from "@/components/kudos/kudos-spotlight-board";
import type { KudosSpotlightData } from "@/lib/kudos/types";

/** `B.6_Header Giải thưởng` + `B.7_Spotlight` (nodes `2940:13476`, `2940:14174`). */
export type KudosSpotlightSectionProps = {
  data: KudosSpotlightData;
  onSelectNode?: (nodeId: string) => void;
};

export function KudosSpotlightSection({ data, onSelectNode }: KudosSpotlightSectionProps) {
  const t = useTranslations("kudosBoard.spotlight");

  return (
    <section aria-labelledby="kudos-spotlight-heading" className="flex w-full flex-col items-center gap-10">
      <div id="kudos-spotlight-heading" className="w-full">
        <KudosSectionHeader caption={t("caption")} title={t("title")} />
      </div>
      <KudosSpotlightBoard data={data} onSelectNode={onSelectNode} />
    </section>
  );
}
