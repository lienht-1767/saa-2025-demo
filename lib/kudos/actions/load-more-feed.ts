"use server";

import { getCurrentProfile } from "@/lib/auth/profile";
import type { KudosBoardFilters } from "@/lib/kudos/read/board-filters";
import { getFeedPage } from "@/lib/kudos/read/get-board-data";
import type { KudosFeedPost } from "@/lib/kudos/types";

export type LoadMoreFeedParams = {
  filters: KudosBoardFilters;
  offset: number;
};

export type LoadMoreFeedResult = { posts: KudosFeedPost[]; hasMore: boolean };

/**
 * Backs the "Xem thêm" button (`components/kudos/kudos-board-live.tsx` `onLoadMore`). Read-only,
 * so guests may paginate without signing in — the same query `getKudosBoardData` uses for the
 * first page, exported separately by the read layer for this exact entry point.
 *
 * This is a server action, so `filters`/`offset` arrive over the wire from the client and are
 * re-validated here rather than trusted from the (client-enforced-only) TypeScript types.
 */
export async function loadMoreFeed({ filters, offset }: LoadMoreFeedParams): Promise<LoadMoreFeedResult> {
  const safeOffset = Number.isInteger(offset) && offset >= 0 ? offset : 0;
  const safeFilters: KudosBoardFilters = {
    hashtagId: typeof filters?.hashtagId === "string" ? filters.hashtagId : null,
    departmentId: typeof filters?.departmentId === "string" ? filters.departmentId : null,
  };

  // Neither call below throws (both degrade internally); no try/catch needed here.
  const profile = await getCurrentProfile();
  return getFeedPage({ viewerId: profile?.userId ?? null, filters: safeFilters, offset: safeOffset });
}
