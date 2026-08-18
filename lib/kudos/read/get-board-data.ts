import { getTranslations } from "next-intl/server";

import type { KudosBoardFilters } from "@/lib/kudos/read/board-filters";
import { degradeCountToZero, degradeToEmptyList, degradeToNull } from "@/lib/kudos/read/degrade-query-result";
import {
  fetchDepartmentCatalog,
  fetchFeedRows,
  fetchHashtagCatalog,
  fetchHighlightRows,
  fetchSpotlightNodeRows,
  fetchTickerRows,
  fetchTotalKudosCount,
  fetchViewerLikedIds,
  fetchViewerProfile,
  fetchViewerSentKudos,
  type KudosSupabaseClient,
} from "@/lib/kudos/read/kudos-queries";
import { toFeedPost, toHighlightCard, toSidebarStats, toSpotlight } from "@/lib/kudos/read/map-board-data";
import type { KudosBoardData, KudosFeedPost, KudosSidebarStats } from "@/lib/kudos/types";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

const DEFAULT_FEED_PAGE_SIZE = 10;
const EMPTY_FILTERS: KudosBoardFilters = { hashtagId: null, departmentId: null };

export type GetKudosBoardDataParams = {
  viewerId: string | null;
  filters?: KudosBoardFilters;
  feedPageSize?: number;
};

export type GetFeedPageParams = {
  viewerId: string | null;
  filters?: KudosBoardFilters;
  offset: number;
  pageSize?: number;
};

export type FeedPageResult = { posts: KudosFeedPost[]; hasMore: boolean };

const ZERO_STATS: KudosSidebarStats = {
  received: 0,
  sent: 0,
  heartsReceived: 0,
  secretBoxesOpened: 0,
  secretBoxesUnopened: 0,
};

/**
 * Resolves the viewer's liked-kudos ids and (optionally) sidebar stats in one shot. Guests
 * (`viewerId === null`) skip every query here entirely — "the same code path with the same
 * policies, just fewer of them" (plan Security Considerations). `stats` stays a real
 * `KudosSidebarStats` (all zero) for guests because `KudosFeedData.stats` is not yet nullable —
 * phase 06 owns widening that field to `KudosSidebarStats | null` (plan Overview).
 */
async function resolveViewerContext(
  supabase: KudosSupabaseClient,
  viewerId: string | null,
  visibleKudosIds: readonly string[],
  needsStats: boolean,
): Promise<{ likedIds: ReadonlySet<string>; stats: KudosSidebarStats }> {
  if (!viewerId) return { likedIds: new Set(), stats: ZERO_STATS };

  const [likedResult, sentResult, profileResult] = await Promise.all([
    visibleKudosIds.length > 0
      ? fetchViewerLikedIds(supabase, viewerId, visibleKudosIds)
      : Promise.resolve({ data: [], error: null }),
    needsStats ? fetchViewerSentKudos(supabase, viewerId) : Promise.resolve({ data: [], error: null }),
    needsStats ? fetchViewerProfile(supabase, viewerId) : Promise.resolve({ data: null, error: null }),
  ]);

  const likedIds = new Set(degradeToEmptyList(likedResult, "viewer-likes").map((row) => row.kudos_id));
  if (!needsStats) return { likedIds, stats: ZERO_STATS };

  const sentRows = degradeToEmptyList(sentResult, "viewer-sent-kudos");
  const profileRow = degradeToNull(profileResult, "viewer-profile");

  return { likedIds, stats: toSidebarStats(profileRow?.kudos_received_count ?? 0, sentRows) };
}

function emptyBoardData(): KudosBoardData {
  return {
    highlight: { cards: [], hashtagFilters: [], departmentFilters: [] },
    spotlight: { totalKudos: 0, nodes: [], ticker: [] },
    feed: { posts: [], hasMore: false, stats: ZERO_STATS, recentGifts: [] },
  };
}

/** Assembles `KudosBoardData` for the `/kudos` page. Never throws — every section degrades independently. */
export async function getKudosBoardData({
  viewerId,
  filters = EMPTY_FILTERS,
  feedPageSize = DEFAULT_FEED_PAGE_SIZE,
}: GetKudosBoardDataParams): Promise<KudosBoardData> {
  try {
    const supabase = await createSupabaseServerClient();
    const t = await getTranslations("kudosBoard");
    const formatTickerLine = (name: string) => t("spotlight.tickerLine", { name });

    const [highlightResult, feedResult, spotlightNodesResult, totalKudosResult, tickerResult, hashtagResult, departmentResult] =
      await Promise.all([
        fetchHighlightRows(supabase, filters),
        fetchFeedRows(supabase, filters, 0, feedPageSize),
        fetchSpotlightNodeRows(supabase),
        fetchTotalKudosCount(supabase),
        fetchTickerRows(supabase),
        fetchHashtagCatalog(supabase),
        fetchDepartmentCatalog(supabase),
      ]);

    const highlightRows = degradeToEmptyList(highlightResult, "highlight");
    const feedRowsFetched = degradeToEmptyList(feedResult, "feed");
    const hasMore = feedRowsFetched.length > feedPageSize;
    const feedPageRows = feedRowsFetched.slice(0, feedPageSize);
    const visibleKudosIds = [...highlightRows.map((row) => row.id), ...feedPageRows.map((row) => row.id)];

    const { likedIds, stats } = await resolveViewerContext(supabase, viewerId, visibleKudosIds, true);

    return {
      highlight: {
        cards: highlightRows.map((row) => toHighlightCard(row, likedIds, viewerId)),
        hashtagFilters: degradeToEmptyList(hashtagResult, "hashtag-catalog").map((row) => ({
          id: row.id,
          label: row.name,
        })),
        departmentFilters: degradeToEmptyList(departmentResult, "department-catalog").map((row) => ({
          id: row.id,
          label: row.name,
        })),
      },
      spotlight: toSpotlight(
        degradeToEmptyList(spotlightNodesResult, "spotlight-nodes"),
        degradeToEmptyList(tickerResult, "ticker"),
        degradeCountToZero(totalKudosResult, "total-kudos"),
        formatTickerLine,
      ),
      feed: {
        posts: feedPageRows.map((row) => toFeedPost(row, likedIds, viewerId)),
        hasMore,
        stats,
        // Gift leaderboard has no data source in this schema (plan Key Insights) — always empty.
        recentGifts: [],
      },
    };
  } catch {
    console.warn("[kudos/read] Unable to load the kudos board; returning an empty board.");
    return emptyBoardData();
  }
}

/**
 * Same feed query and mapper as `getKudosBoardData`, exported for phase 06's "Xem thêm" pagination
 * (DRY: one query shape, two entry points).
 */
export async function getFeedPage({
  viewerId,
  filters = EMPTY_FILTERS,
  offset,
  pageSize = DEFAULT_FEED_PAGE_SIZE,
}: GetFeedPageParams): Promise<FeedPageResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const feedResult = await fetchFeedRows(supabase, filters, offset, pageSize);
    const feedRowsFetched = degradeToEmptyList(feedResult, "feed-page");
    const hasMore = feedRowsFetched.length > pageSize;
    const feedPageRows = feedRowsFetched.slice(0, pageSize);

    const { likedIds } = await resolveViewerContext(
      supabase,
      viewerId,
      feedPageRows.map((row) => row.id),
      false,
    );

    return { posts: feedPageRows.map((row) => toFeedPost(row, likedIds, viewerId)), hasMore };
  } catch {
    console.warn("[kudos/read] Unable to load the next feed page; returning an empty page.");
    return { posts: [], hasMore: false };
  }
}
