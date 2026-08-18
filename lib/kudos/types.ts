/**
 * Shared data contracts for the `/kudos` live board (MoMorph screen `MaZUn5xHXZ`).
 *
 * This module is the boundary between the presentational UI built here and whatever backend
 * agent wires real data into it — every prop a top-level `components/kudos/*` component takes
 * is typed from these shapes. Nothing here reaches out to Supabase or fetch; the board only
 * ever receives a `KudosBoardData` value as a prop.
 */

/** A Sunner referenced as a kudos sender or receiver. */
export type KudosPersonRef = {
  id: string;
  name: string;
  department: string;
  avatarUrl: string | null;
  /**
   * Lifetime kudos received. The UI derives both the hoa-thị star tier and the title badge
   * ("New Hero" / "Rising Hero" / "Super Hero" / "Legend Hero") from this single count via
   * `computeHoaThiTier` in `lib/kudos/hoa-thi-tier.ts` — the backend only needs to supply the
   * raw count, not a pre-computed tier or label, so the two can never drift apart.
   */
  kudosCount: number;
};

/** One card in the HIGHLIGHT KUDOS carousel (spec B.*). */
export type KudosHighlightCard = {
  id: string;
  sender: KudosPersonRef;
  receiver: KudosPersonRef;
  /** ISO 8601 timestamp; formatted for display via `lib/kudos/format-post-time.ts`. */
  postedAt: string;
  content: string;
  hashtags: string[];
  likeCount: number;
  likedByViewer: boolean;
  likeDisabled?: boolean;
  likePending?: boolean;
};

export type KudosFeedAttachment = { id: string; url: string; alt: string };

/** One post in the ALL KUDOS feed (spec C.*). */
export type KudosFeedPost = {
  id: string;
  sender: KudosPersonRef;
  receiver: KudosPersonRef;
  postedAt: string;
  /** Short badge line above the content, e.g. "IDOL GIỚI TRẺ". `null` when the post carries none. */
  tagLine: string | null;
  content: string;
  attachments: KudosFeedAttachment[];
  hashtags: string[];
  likeCount: number;
  likedByViewer: boolean;
  likeDisabled?: boolean;
  likePending?: boolean;
};

/** One name placed on the SPOTLIGHT BOARD word cloud (spec B.7.*). */
export type KudosSpotlightNode = {
  id: string;
  name: string;
  kudosCount: number;
  lastKudosAt: string;
  latestKudosId: string | null;
  /** The single name the design renders in red — at most one node should carry this. */
  highlighted?: boolean;
};

export type KudosSpotlightTickerItem = {
  id: string;
  text: string;
  at: string;
};

/** Values behind the ALL KUDOS sidebar stats box (spec D.*). */
export type KudosSidebarStats = {
  received: number;
  sent: number;
  heartsReceived: number;
  secretBoxesOpened: number;
  secretBoxesUnopened: number;
};

export type KudosRecentGiftEntry = {
  id: string;
  name: string;
  avatarUrl: string | null;
  giftLabel: string;
  receivedAt: string;
};

export type KudosFilterOption = { id: string; label: string };

export type KudosHighlightData = {
  cards: readonly KudosHighlightCard[];
  hashtagFilters: readonly KudosFilterOption[];
  departmentFilters: readonly KudosFilterOption[];
};

export type KudosSpotlightData = {
  totalKudos: number;
  nodes: readonly KudosSpotlightNode[];
  ticker: readonly KudosSpotlightTickerItem[];
};

export type KudosFeedData = {
  posts: readonly KudosFeedPost[];
  hasMore: boolean;
  /**
   * The signed-in viewer's personal stats, or `null` for a guest. Widened from a required
   * `KudosSidebarStats` in phase 06 (page integration) so a guest sees a login CTA where the
   * stats box sits, instead of a box full of zeros (clarifications: "Ẩn khối thống kê, thay bằng
   * CTA đăng nhập"). `components/kudos/kudos-all-kudos-section.tsx` branches on this.
   */
  stats: KudosSidebarStats | null;
  recentGifts: readonly KudosRecentGiftEntry[];
};

/** The single prop `KudosBoard` takes — everything the four sections render from. */
export type KudosBoardData = {
  highlight: KudosHighlightData;
  spotlight: KudosSpotlightData;
  feed: KudosFeedData;
};

/**
 * Optional callbacks for behaviour that needs a server. Every entry defaults to a no-op inside
 * the components that consume it — this file only documents the contract's shape.
 */
export type KudosBoardCallbacks = {
  /**
   * The hero "ghi nhận" pill (spec A.1) was clicked. Its own compose dialog is out of this
   * board's scope (clarifications.md: built by whoever owns the real submission flow) — this
   * only signals "open it". `onSubmitKudos` is that dialog's eventual submit handler.
   */
  onOpenKudosComposer?: () => void;
  onSubmitKudos?: (input: KudosComposerInput) => void;
  /** Hero/highlight "Tìm kiếm profile Sunner" query changed. */
  onSearchProfile?: (
    query: string,
  ) => "not-found" | "error" | void | Promise<"not-found" | "error" | void>;
  onToggleLike?: (postId: string, nextLiked: boolean) => void;
  onLoadMore?: () => void;
  onOpenKudosDetail?: (postId: string) => void;
  onOpenProfile?: (personId: string) => void;
  onOpenSecretBox?: () => void;
  /** The Hashtag/Phòng ban dropdown selection changed (spec B.1.1/B.1.2). `null` clears that filter. */
  onFilterChange?: (filter: { hashtagId: string | null; departmentId: string | null }) => void;
  /** An inline hashtag chip on a card was clicked (spec B.4.3/C.3.7/D.4) — filters by that tag text. */
  onSelectHashtag?: (hashtag: string) => void;
};

export type KudosComposerInput = {
  recipientId: string;
  message: string;
  hashtagIds: string[];
  imageUrls: string[];
};

export type KudosBoardProps = {
  data: KudosBoardData;
  callbacks?: KudosBoardCallbacks;
  filters?: { hashtagId: string | null; departmentId: string | null };
};
