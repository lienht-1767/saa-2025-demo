import { sanitizeKudosHtml } from "@/lib/kudos/sanitize-kudos-html";
import { stripKudosHtml } from "@/lib/kudos/strip-kudos-html";
import type {
  HashtagLinkRow,
  KudosFeedRow,
  KudosHighlightRow,
  ProfileRefRow,
  SpotlightNodeRow,
  SpotlightTickerRow,
  ViewerSentKudosRow,
} from "@/lib/kudos/read/db-row-types";
import type {
  KudosFeedPost,
  KudosHighlightCard,
  KudosPersonRef,
  KudosSidebarStats,
  KudosSpotlightData,
  KudosSpotlightNode,
  KudosSpotlightTickerItem,
} from "@/lib/kudos/types";

/**
 * Pure row → `KudosBoardData` mappers. No Supabase import, no branching on network state — every
 * function here takes rows already fetched by `kudos-queries.ts` and shapes them, which is what
 * lets this module be unit-tested without a database (phase-05 plan Key Insights).
 */

const FALLBACK_NAME = "Sunner";
const ATTACHMENT_ALT_MAX_LENGTH = 60;

/**
 * Maps a joined `profiles` row to `KudosPersonRef`. `kudosCount` is the trigger-maintained
 * `kudos_received_count` — never a computed tier or title; `computeHoaThiTier` derives those at
 * render time (`lib/kudos/hoa-thi-tier.ts`).
 */
export function toPersonRef(row: ProfileRefRow): KudosPersonRef {
  return {
    id: row.id,
    name: row.full_name ?? FALLBACK_NAME,
    department: row.department?.name ?? "",
    avatarUrl: row.avatar_url,
    kudosCount: row.kudos_received_count,
  };
}

function toHashtagNames(links: readonly HashtagLinkRow[]): string[] {
  return links.map((link) => link.hashtag?.name).filter((name): name is string => Boolean(name));
}

function toAttachmentAlt(plainText: string): string {
  const trimmed = plainText.trim();
  return trimmed.length > ATTACHMENT_ALT_MAX_LENGTH
    ? `${trimmed.slice(0, ATTACHMENT_ALT_MAX_LENGTH)}…`
    : trimmed;
}

/**
 * Sender ref shown in place of the real sender when `is_anonymous` is true. `id: ""` is a
 * deliberate sentinel: it carries no real profile, so `KudosFeedCard`/`KudosHighlightCard` skip
 * wiring `onOpenProfile` for a sender whose id is empty — "no avatar image and no profile link"
 * (phase-05 plan Requirements). `avatarUrl: null` reuses `KudosAvatar`'s existing initials
 * fallback rather than ever showing the real sender's photo.
 *
 * Anonymity here is presentational only — `sender_id` is still stored and PostgREST-readable
 * regardless of this flag (clarifications.md, round 2; migration
 * `20260818212642_add_kudos_title_and_anonymity.sql`). This helper only controls what the UI
 * renders, never what the database stores or exposes.
 */
export function toAnonymousPersonRef(anonymousName: string | null): KudosPersonRef {
  const name = anonymousName?.trim();
  return { id: "", name: name || FALLBACK_NAME, department: "", avatarUrl: null, kudosCount: 0 };
}

function toSenderRef(row: KudosHighlightRow): KudosPersonRef {
  return row.is_anonymous ? toAnonymousPersonRef(row.anonymous_name) : toPersonRef(row.sender);
}

export function toHighlightCard(
  row: KudosHighlightRow,
  likedByViewerIds: ReadonlySet<string>,
  viewerId: string | null = null,
): KudosHighlightCard {
  return {
    id: row.id,
    sender: toSenderRef(row),
    receiver: toPersonRef(row.recipient),
    postedAt: row.created_at,
    // Sanitized again on read: legacy rows predate the sanitizer and any future insert path that
    // forgets to sanitize still gets a safe render here (phase-05 plan Key Insights).
    contentHtml: sanitizeKudosHtml(row.message),
    hashtags: toHashtagNames(row.kudos_hashtags),
    likeCount: row.like_count,
    likedByViewer: likedByViewerIds.has(row.id),
    ...(viewerId === row.sender.id ? { likeDisabled: true as const } : {}),
  };
}

export function toFeedPost(
  row: KudosFeedRow,
  likedByViewerIds: ReadonlySet<string>,
  viewerId: string | null = null,
): KudosFeedPost {
  // Alt text is always plain text, never HTML — stripped, not sanitized, so no markup ever ends
  // up in an `alt` attribute (phase-05 plan Key Insights).
  const alt = toAttachmentAlt(stripKudosHtml(row.message));
  return {
    id: row.id,
    sender: toSenderRef(row),
    receiver: toPersonRef(row.recipient),
    postedAt: row.created_at,
    tagLine: row.title,
    contentHtml: sanitizeKudosHtml(row.message),
    attachments: [...row.kudos_images]
      .sort((a, b) => a.position - b.position)
      .map((image) => ({ id: image.id, url: image.url, alt })),
    hashtags: toHashtagNames(row.kudos_hashtags),
    likeCount: row.like_count,
    likedByViewer: likedByViewerIds.has(row.id),
    ...(viewerId === row.sender.id ? { likeDisabled: true as const } : {}),
  };
}

/**
 * Defensive fallback for `last_kudos_received_at`: the counter trigger (`on_kudos_created`,
 * phase 02) always sets this column in the same statement that increments `kudos_received_count`,
 * so a row selected with `kudos_received_count > 0` should never carry a null timestamp — this
 * only guards against that invariant being violated some other way.
 */
const EPOCH_FALLBACK = "1970-01-01T00:00:00.000Z";

export function toSpotlightNodes(rows: readonly SpotlightNodeRow[]): KudosSpotlightNode[] {
  return rows.map((row, index) => ({
    id: row.id,
    name: row.full_name ?? FALLBACK_NAME,
    kudosCount: row.kudos_received_count,
    lastKudosAt: row.last_kudos_received_at ?? EPOCH_FALLBACK,
    latestKudosId: row.received_kudos?.[0]?.id ?? null,
    // The design renders exactly one name in red: the highest count, i.e. the first row of a
    // `kudos_received_count desc` ordered result (plan: "highlighted: true on the top node only").
    ...(index === 0 ? { highlighted: true as const } : {}),
  }));
}

export function toSpotlightTicker(
  rows: readonly SpotlightTickerRow[],
  formatTickerLine: (name: string) => string,
): KudosSpotlightTickerItem[] {
  return rows.map((row) => ({
    id: row.id,
    text: formatTickerLine(row.recipient?.full_name ?? FALLBACK_NAME),
    at: row.created_at,
  }));
}

export function toSpotlight(
  nodeRows: readonly SpotlightNodeRow[],
  tickerRows: readonly SpotlightTickerRow[],
  totalKudos: number,
  formatTickerLine: (name: string) => string,
): KudosSpotlightData {
  return {
    totalKudos,
    nodes: toSpotlightNodes(nodeRows),
    ticker: toSpotlightTicker(tickerRows, formatTickerLine),
  };
}

/**
 * `secretBoxesOpened`/`secretBoxesUnopened` are always 0 — the Secret Box gift system has no
 * schema and is out of scope for phase 05 (plan Key Insights), not an oversight.
 */
export function toSidebarStats(
  receivedCount: number,
  sentRows: readonly ViewerSentKudosRow[],
): KudosSidebarStats {
  return {
    received: receivedCount,
    sent: sentRows.length,
    heartsReceived: sentRows.reduce((sum, row) => sum + row.like_count, 0),
    secretBoxesOpened: 0,
    secretBoxesUnopened: 0,
  };
}
