import type { PostgrestError } from "@supabase/supabase-js";

import type { createSupabaseServerClient } from "@/lib/supabase/server-client";

import type { KudosBoardFilters } from "@/lib/kudos/read/board-filters";
import type {
  DepartmentCatalogRow,
  HashtagCatalogRow,
  KudosFeedRow,
  KudosHighlightRow,
  SpotlightNodeRow,
  SpotlightTickerRow,
  ViewerLikedIdRow,
  ViewerProfileRow,
  ViewerSentKudosRow,
} from "@/lib/kudos/read/db-row-types";

/**
 * I/O only, no branching: every function below returns the raw PostgREST `{ data, error }` (or
 * `{ count, error }`) result untouched. Degrading a failed query to an empty section is
 * `get-board-data.ts`'s job, not this module's (phase-05 plan Architecture).
 *
 * The declared return types below are asserted, not computed by postgrest-js — our `.select()`
 * strings are built at runtime (not string literals), so postgrest-js's literal-parsing type
 * inference can't resolve a row shape from them. The row shapes in `db-row-types.ts`, taken
 * directly from the `.select()` strings and the migrations, are the source of truth instead.
 */

export type KudosSupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

type QueryResult<T> = Promise<{ data: T | null; error: PostgrestError | null }>;
type CountResult = Promise<{ count: number | null; error: PostgrestError | null }>;

const HIGHLIGHT_LIMIT = 5;
// Caps the SPOTLIGHT word cloud so the query stays index-backed at any board size (plan Risk Assessment).
const SPOTLIGHT_NODE_LIMIT = 60;
const TICKER_LIMIT = 10;

const PROFILE_REF_SELECT =
  "id, full_name, avatar_url, kudos_received_count, department:departments(name)";

/**
 * Always a plain (left-join) embed — never `!inner`. PostgREST's documented behavior for a
 * filter applied to an embedded resource also narrows which CHILD rows of that embed come back,
 * not just whether the parent row qualifies. Filtering this embed by `hashtag_id` would mean a
 * kudos with 3 hashtags comes back carrying only the one that matched the filter, silently
 * dropping its other tags from the response. Instead, an active hashtag filter narrows the
 * parent `kudos` rows by id (`resolveHashtagIdFilter` below), so this embed can stay unfiltered
 * and a matching card's full hashtag set always comes back intact.
 */
const HASHTAGS_EMBED = "kudos_hashtags(hashtag_id, hashtag:hashtags(name))";

function kudosSelect(options: { withImages: boolean }): string {
  const base =
    `id, message, like_count, created_at, ` +
    `sender:profiles!kudos_sender_id_fkey(${PROFILE_REF_SELECT}), ` +
    `recipient:profiles!kudos_recipient_id_fkey(${PROFILE_REF_SELECT}), ` +
    HASHTAGS_EMBED;
  return options.withImages ? `${base}, kudos_images(id, url, position)` : base;
}

type KudosHashtagLinkIdRow = { kudos_id: string };

/**
 * Resolves the `kudos` ids carrying a given hashtag, via a narrow query against the join table
 * (index-backed by `kudos_hashtags_hashtag_idx`). The caller uses the result to constrain the
 * main `kudos` query with `.in("id", ids)` instead of filtering the hashtag embed directly — see
 * `HASHTAGS_EMBED`'s doc for why that distinction matters.
 */
async function fetchKudosIdsForHashtag(
  client: KudosSupabaseClient,
  hashtagId: string,
): Promise<{ ids: string[]; error: null } | { ids: null; error: PostgrestError }> {
  const { data, error } = await client
    .from("kudos_hashtags")
    .select("kudos_id")
    .eq("hashtag_id", hashtagId);

  if (error) return { ids: null, error };
  return { ids: ((data ?? []) as KudosHashtagLinkIdRow[]).map((row) => row.kudos_id), error: null };
}

/**
 * Resolves an active hashtag filter (if any) to an id list for `.in("id", ids)`, or a
 * short-circuit result when the id-resolution query itself fails or matches nothing — in either
 * case there is no point running the main `kudos` query at all.
 */
async function resolveHashtagIdFilter<T>(
  client: KudosSupabaseClient,
  hashtagId: string | null,
): Promise<{ shortCircuit: { data: T[] | null; error: PostgrestError | null } } | { ids: string[] | null }> {
  if (!hashtagId) return { ids: null };

  const { ids, error } = await fetchKudosIdsForHashtag(client, hashtagId);
  if (error) return { shortCircuit: { data: null, error } };
  if (ids.length === 0) return { shortCircuit: { data: [], error: null } };
  return { ids };
}

/** HIGHLIGHT KUDOS: top 5 by `like_count`, filters AND-combined (ALG-001, BR-005). */
export async function fetchHighlightRows(
  client: KudosSupabaseClient,
  filters: KudosBoardFilters,
): QueryResult<KudosHighlightRow[]> {
  const hashtagFilter = await resolveHashtagIdFilter<KudosHighlightRow>(client, filters.hashtagId);
  if ("shortCircuit" in hashtagFilter) return hashtagFilter.shortCircuit;

  let query = client
    .from("kudos")
    .select(kudosSelect({ withImages: false }))
    .order("like_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(HIGHLIGHT_LIMIT);

  if (hashtagFilter.ids) query = query.in("id", hashtagFilter.ids);
  if (filters.departmentId) query = query.eq("department_id", filters.departmentId);

  return query as unknown as QueryResult<KudosHighlightRow[]>;
}

/** ALL KUDOS feed page: fetches `pageSize + 1` rows so the caller can derive `hasMore`. */
export async function fetchFeedRows(
  client: KudosSupabaseClient,
  filters: KudosBoardFilters,
  offset: number,
  pageSize: number,
): QueryResult<KudosFeedRow[]> {
  const hashtagFilter = await resolveHashtagIdFilter<KudosFeedRow>(client, filters.hashtagId);
  if ("shortCircuit" in hashtagFilter) return hashtagFilter.shortCircuit;

  let query = client
    .from("kudos")
    .select(kudosSelect({ withImages: true }))
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize);

  if (hashtagFilter.ids) query = query.in("id", hashtagFilter.ids);
  if (filters.departmentId) query = query.eq("department_id", filters.departmentId);

  return query as unknown as QueryResult<KudosFeedRow[]>;
}

/** SPOTLIGHT word-cloud nodes: every Sunner with at least one kudos, ranked so index 0 is the highlight. */
export function fetchSpotlightNodeRows(client: KudosSupabaseClient): QueryResult<SpotlightNodeRow[]> {
  return client
    .from("profiles")
    .select("id, full_name, kudos_received_count, last_kudos_received_at, received_kudos:kudos!kudos_recipient_id_fkey(id, created_at)")
    .gt("kudos_received_count", 0)
    .order("kudos_received_count", { ascending: false })
    .order("created_at", { referencedTable: "received_kudos", ascending: false })
    .limit(1, { referencedTable: "received_kudos" })
    .limit(SPOTLIGHT_NODE_LIMIT) as unknown as QueryResult<SpotlightNodeRow[]>;
}

/** SPOTLIGHT "388 KUDOS" header — unfiltered, board-wide total (head request, no row transfer). */
export function fetchTotalKudosCount(client: KudosSupabaseClient): CountResult {
  return client.from("kudos").select("*", { count: "exact", head: true }) as unknown as CountResult;
}

/** SPOTLIGHT ticker: the 10 most recent kudos, unfiltered. */
export function fetchTickerRows(client: KudosSupabaseClient): QueryResult<SpotlightTickerRow[]> {
  return client
    .from("kudos")
    .select("id, created_at, recipient:profiles!kudos_recipient_id_fkey(full_name)")
    .order("created_at", { ascending: false })
    .limit(TICKER_LIMIT) as unknown as QueryResult<SpotlightTickerRow[]>;
}

/** The two filter-dropdown catalogs. */
export function fetchHashtagCatalog(client: KudosSupabaseClient): QueryResult<HashtagCatalogRow[]> {
  return client
    .from("hashtags")
    .select("id, name")
    .order("name", { ascending: true }) as unknown as QueryResult<HashtagCatalogRow[]>;
}

export function fetchDepartmentCatalog(client: KudosSupabaseClient): QueryResult<DepartmentCatalogRow[]> {
  return client
    .from("departments")
    .select("id, name")
    .order("name", { ascending: true }) as unknown as QueryResult<DepartmentCatalogRow[]>;
}

/** Scoped to the ids visible on the current page — never the whole `kudos_likes` table. */
export function fetchViewerLikedIds(
  client: KudosSupabaseClient,
  viewerId: string,
  visibleKudosIds: readonly string[],
): QueryResult<ViewerLikedIdRow[]> {
  return client
    .from("kudos_likes")
    .select("kudos_id")
    .eq("user_id", viewerId)
    .in("kudos_id", [...visibleKudosIds]) as unknown as QueryResult<ViewerLikedIdRow[]>;
}

/** The viewer's own sent kudos: row count → `stats.sent`, `SUM(like_count)` → `stats.heartsReceived`. */
export function fetchViewerSentKudos(
  client: KudosSupabaseClient,
  viewerId: string,
): QueryResult<ViewerSentKudosRow[]> {
  return client
    .from("kudos")
    .select("like_count")
    .eq("sender_id", viewerId) as unknown as QueryResult<ViewerSentKudosRow[]>;
}

/** The viewer's own lifetime received count, for `stats.received` — read, never aggregated. */
export function fetchViewerProfile(
  client: KudosSupabaseClient,
  viewerId: string,
): QueryResult<ViewerProfileRow> {
  return client
    .from("profiles")
    .select("kudos_received_count")
    .eq("id", viewerId)
    .maybeSingle() as unknown as QueryResult<ViewerProfileRow>;
}
