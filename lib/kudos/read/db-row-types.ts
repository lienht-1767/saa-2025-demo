/**
 * PostgREST row shapes for the kudos board read queries in `kudos-queries.ts`. Column names and
 * FK-hint embeds mirror `supabase/migrations/*.sql` exactly — see the phase-05 plan's "Take every
 * column name, type and FK direction from these files, not from prose."
 */

/** `sender:profiles!kudos_sender_id_fkey(...)` / `recipient:profiles!kudos_recipient_id_fkey(...)`. */
export type ProfileRefRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  kudos_received_count: number;
  department: { name: string } | null;
};

/** One row of the `kudos_hashtags(hashtag_id, hashtag:hashtags(name))` embed. */
export type HashtagLinkRow = {
  hashtag_id: string;
  hashtag: { name: string } | null;
};

/** One row of the `kudos_images(id, url, position)` embed. */
export type KudosImageRow = {
  id: string;
  url: string;
  position: number;
};

/** Shared shape of a `kudos` row as selected for HIGHLIGHT (no images) and the ticker query. */
export type KudosHighlightRow = {
  id: string;
  message: string;
  like_count: number;
  created_at: string;
  sender: ProfileRefRow;
  recipient: ProfileRefRow;
  kudos_hashtags: HashtagLinkRow[];
  /**
   * "Danh hiệu" — nullable; legacy rows predate the phase-02 migration. Optional (not just
   * nullable) here because phase 05 wires the read-path select and existing fixtures/tests built
   * before that phase don't populate it; consuming it is phase 05's job, declaring it is this
   * phase's.
   */
  title?: string | null;
  /**
   * Presentational only (migration `20260818212642_add_kudos_title_and_anonymity.sql`):
   * `sender_id`/`sender` stay populated regardless of this flag. Never treat it as a real
   * privacy boundary when consuming this row. Optional for the same pre-phase-05 fixture reason
   * as `title`; treat a missing value as `false` when consuming.
   */
  is_anonymous?: boolean;
  anonymous_name?: string | null;
};

/** Same as `KudosHighlightRow` plus the ALL KUDOS feed's image attachments. */
export type KudosFeedRow = KudosHighlightRow & {
  kudos_images: KudosImageRow[];
};

/** `profiles` row for one SPOTLIGHT word-cloud node. */
export type SpotlightNodeRow = {
  id: string;
  full_name: string | null;
  kudos_received_count: number;
  last_kudos_received_at: string | null;
  received_kudos?: Array<{ id: string; created_at: string }>;
};

/** `kudos` row for one SPOTLIGHT ticker line. */
export type SpotlightTickerRow = {
  id: string;
  created_at: string;
  recipient: { full_name: string | null } | null;
};

/** `hashtags` catalog row, used for the HIGHLIGHT hashtag filter dropdown. */
export type HashtagCatalogRow = { id: string; name: string };

/** `departments` catalog row, used for the HIGHLIGHT department filter dropdown. */
export type DepartmentCatalogRow = { id: string; name: string };

/** `kudos_likes` row scoped to the viewer, used to derive `likedByViewer`. */
export type ViewerLikedIdRow = { kudos_id: string };

/** `kudos` row for the viewer's own sent kudos — row count → `stats.sent`, sum → `stats.heartsReceived`. */
export type ViewerSentKudosRow = { like_count: number };

/** The viewer's own `profiles` row, read only for `stats.received`. */
export type ViewerProfileRow = { kudos_received_count: number };
