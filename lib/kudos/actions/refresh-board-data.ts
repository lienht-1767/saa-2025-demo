"use server";

import { getCurrentProfile } from "@/lib/auth/profile";
import type { KudosBoardFilters } from "@/lib/kudos/read/board-filters";
import { getKudosBoardData } from "@/lib/kudos/read/get-board-data";

export async function refreshBoardData(filters: KudosBoardFilters) {
  const profile = await getCurrentProfile();
  const data = await getKudosBoardData({ viewerId: profile?.userId ?? null, filters });
  return profile ? data : { ...data, feed: { ...data.feed, stats: null } };
}
