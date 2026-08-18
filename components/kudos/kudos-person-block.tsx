"use client";

import { KudosAvatar } from "@/components/kudos/kudos-avatar";
import { KudosTitleBadge } from "@/components/kudos/kudos-title-badge";
import { computeHoaThiTier } from "@/lib/kudos/hoa-thi-tier";
import type { KudosPersonRef } from "@/lib/kudos/types";

/**
 * `B.3.2_Thông tin người gửi` / `B.3.6_Thông tin người nhận` (node `256:4737`) — avatar, name,
 * department, and hoa-thị title badge, reused for both sender and receiver on every kudos card
 * (the light `#FFF8E1` card background is the same across the highlight card and the all-kudos
 * post, per `evidence/momorph-frame-styles.json` nodes `2940:13465` and `3127:21871`).
 */
export type KudosPersonBlockProps = {
  person: KudosPersonRef;
  onOpenProfile?: (personId: string) => void;
};

export function KudosPersonBlock({ person, onOpenProfile }: KudosPersonBlockProps) {
  const { title } = computeHoaThiTier(person.kudosCount);

  return (
    /* mm:335:9443 */
    <div className="flex flex-col items-center gap-[13px] text-center">
      <KudosAvatar name={person.name} avatarUrl={person.avatarUrl} />
      <div className="flex flex-col items-center gap-0.5">
        <button
          type="button"
          onClick={() => onOpenProfile?.(person.id)}
          className="rounded text-base leading-6 font-bold tracking-[0.15px] text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
        >
          {person.name}
        </button>
        <div className="flex items-center justify-center gap-2.5">
          <span className="text-sm leading-5 font-bold tracking-[0.1px] text-kudos-muted">{person.department}</span>
          <span aria-hidden className="size-1 rounded-full bg-kudos-muted opacity-40" />
          <KudosTitleBadge label={title} />
        </div>
      </div>
    </div>
  );
}
