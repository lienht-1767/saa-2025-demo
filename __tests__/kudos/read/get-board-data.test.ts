import { beforeEach, describe, expect, it, vi } from "vitest";

const createSupabaseServerClientMock = vi.fn();
const tMock = vi.fn((key: string, values?: Record<string, unknown>) =>
  values ? `${key}(${JSON.stringify(values)})` : key,
);
const getTranslationsMock = vi.fn().mockResolvedValue(tMock);

const fetchHighlightRows = vi.fn();
const fetchFeedRows = vi.fn();
const fetchSpotlightNodeRows = vi.fn();
const fetchTotalKudosCount = vi.fn();
const fetchTickerRows = vi.fn();
const fetchHashtagCatalog = vi.fn();
const fetchDepartmentCatalog = vi.fn();
const fetchViewerLikedIds = vi.fn();
const fetchViewerSentKudos = vi.fn();
const fetchViewerProfile = vi.fn();

vi.mock("@/lib/supabase/server-client", () => ({
  createSupabaseServerClient: createSupabaseServerClientMock,
}));
vi.mock("next-intl/server", () => ({ getTranslations: getTranslationsMock }));
vi.mock("@/lib/kudos/read/kudos-queries", () => ({
  fetchHighlightRows,
  fetchFeedRows,
  fetchSpotlightNodeRows,
  fetchTotalKudosCount,
  fetchTickerRows,
  fetchHashtagCatalog,
  fetchDepartmentCatalog,
  fetchViewerLikedIds,
  fetchViewerSentKudos,
  fetchViewerProfile,
}));

const { getFeedPage, getKudosBoardData } = await import("@/lib/kudos/read/get-board-data");

const senderRow = {
  id: "sender-1",
  full_name: "An Nguyen",
  avatar_url: null,
  kudos_received_count: 12,
  department: { name: "Marketing" },
};
const recipientRow = {
  id: "recipient-1",
  full_name: "Binh Tran",
  avatar_url: null,
  kudos_received_count: 55,
  department: null,
};

function buildKudosRow(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    message: `Cam on ban #${id}`,
    like_count: 5,
    created_at: "2026-01-01T10:00:00.000Z",
    sender: senderRow,
    recipient: recipientRow,
    kudos_hashtags: [],
    ...overrides,
  };
}

function ok<T>(data: T) {
  return { data, error: null };
}

/** Wires every query mock to a benign empty/zero default; individual tests override what they need. */
function resetAllQueryMocksToEmpty() {
  createSupabaseServerClientMock.mockReset().mockResolvedValue({});
  getTranslationsMock.mockClear();
  tMock.mockClear();

  fetchHighlightRows.mockReset().mockResolvedValue(ok([]));
  fetchFeedRows.mockReset().mockResolvedValue(ok([]));
  fetchSpotlightNodeRows.mockReset().mockResolvedValue(ok([]));
  fetchTotalKudosCount.mockReset().mockResolvedValue({ count: 0, error: null });
  fetchTickerRows.mockReset().mockResolvedValue(ok([]));
  fetchHashtagCatalog.mockReset().mockResolvedValue(ok([]));
  fetchDepartmentCatalog.mockReset().mockResolvedValue(ok([]));
  fetchViewerLikedIds.mockReset().mockResolvedValue(ok([]));
  fetchViewerSentKudos.mockReset().mockResolvedValue(ok([]));
  fetchViewerProfile.mockReset().mockResolvedValue(ok(null));
}

describe("getKudosBoardData", () => {
  beforeEach(() => {
    resetAllQueryMocksToEmpty();
  });

  it("assembles every section for an authenticated viewer, including stats and likedByViewer", async () => {
    fetchHighlightRows.mockResolvedValue(ok([buildKudosRow("k1")]));
    fetchFeedRows.mockResolvedValue(ok([buildKudosRow("f1", { kudos_images: [] }), buildKudosRow("f2", { kudos_images: [] })]));
    fetchSpotlightNodeRows.mockResolvedValue(
      ok([{ id: "u1", full_name: "An", kudos_received_count: 30, last_kudos_received_at: "2026-01-01T00:00:00.000Z" }]),
    );
    fetchTotalKudosCount.mockResolvedValue({ count: 388, error: null });
    fetchTickerRows.mockResolvedValue(ok([{ id: "t1", created_at: "2026-01-01T00:00:00.000Z", recipient: { full_name: "An" } }]));
    fetchHashtagCatalog.mockResolvedValue(ok([{ id: "h1", name: "Dedicated" }]));
    fetchDepartmentCatalog.mockResolvedValue(ok([{ id: "d1", name: "Marketing" }]));
    fetchViewerLikedIds.mockResolvedValue(ok([{ kudos_id: "k1" }]));
    fetchViewerSentKudos.mockResolvedValue(ok([{ like_count: 3 }, { like_count: 7 }]));
    fetchViewerProfile.mockResolvedValue(ok({ kudos_received_count: 15 }));

    const board = await getKudosBoardData({ viewerId: "viewer-1", feedPageSize: 2 });

    expect(board.highlight.cards).toHaveLength(1);
    expect(board.highlight.cards[0]?.likedByViewer).toBe(true);
    expect(board.highlight.hashtagFilters).toEqual([{ id: "h1", label: "Dedicated" }]);
    expect(board.highlight.departmentFilters).toEqual([{ id: "d1", label: "Marketing" }]);
    expect(board.spotlight.totalKudos).toBe(388);
    expect(board.spotlight.nodes[0]?.highlighted).toBe(true);
    expect(board.feed.posts).toHaveLength(2);
    expect(board.feed.hasMore).toBe(false);
    expect(board.feed.stats).toEqual({
      received: 15,
      sent: 2,
      heartsReceived: 10,
      secretBoxesOpened: 0,
      secretBoxesUnopened: 0,
    });
    expect(board.feed.recentGifts).toEqual([]);
  });

  it("derives hasMore from the pageSize + 1 probe", async () => {
    fetchFeedRows.mockResolvedValue(
      ok([buildKudosRow("f1", { kudos_images: [] }), buildKudosRow("f2", { kudos_images: [] }), buildKudosRow("f3", { kudos_images: [] })]),
    );

    const board = await getKudosBoardData({ viewerId: null, feedPageSize: 2 });

    expect(board.feed.posts).toHaveLength(2);
    expect(board.feed.hasMore).toBe(true);
  });

  it("never requests personal stats for a guest, and every card is unliked", async () => {
    fetchHighlightRows.mockResolvedValue(ok([buildKudosRow("k1")]));

    const board = await getKudosBoardData({ viewerId: null });

    expect(fetchViewerLikedIds).not.toHaveBeenCalled();
    expect(fetchViewerSentKudos).not.toHaveBeenCalled();
    expect(fetchViewerProfile).not.toHaveBeenCalled();
    expect(board.highlight.cards[0]?.likedByViewer).toBe(false);
    expect(board.feed.stats).toEqual({
      received: 0,
      sent: 0,
      heartsReceived: 0,
      secretBoxesOpened: 0,
      secretBoxesUnopened: 0,
    });
  });

  it("degrades a failed section to its empty value and warns, without failing the whole board", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    fetchHighlightRows.mockResolvedValue({ data: null, error: { message: "boom" } });
    fetchSpotlightNodeRows.mockResolvedValue({ data: null, error: { message: "boom" } });
    fetchFeedRows.mockResolvedValue(ok([buildKudosRow("f1", { kudos_images: [] })]));

    const board = await getKudosBoardData({ viewerId: null });

    expect(board.highlight.cards).toEqual([]);
    expect(board.spotlight.nodes).toEqual([]);
    expect(board.feed.posts).toHaveLength(1);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("returns a fully-empty board and never throws when the client itself fails", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    createSupabaseServerClientMock.mockRejectedValue(new Error("no connection"));

    await expect(getKudosBoardData({ viewerId: "viewer-1" })).resolves.toEqual({
      highlight: { cards: [], hashtagFilters: [], departmentFilters: [] },
      spotlight: { totalKudos: 0, nodes: [], ticker: [] },
      feed: {
        posts: [],
        hasMore: false,
        stats: { received: 0, sent: 0, heartsReceived: 0, secretBoxesOpened: 0, secretBoxesUnopened: 0 },
        recentGifts: [],
      },
    });
    warnSpy.mockRestore();
  });
});

describe("getFeedPage", () => {
  beforeEach(() => {
    resetAllQueryMocksToEmpty();
  });

  it("reuses the feed query and mapper, scoping viewer likes to the returned page", async () => {
    fetchFeedRows.mockResolvedValue(ok([buildKudosRow("f1", { kudos_images: [] }), buildKudosRow("f2", { kudos_images: [] })]));
    fetchViewerLikedIds.mockResolvedValue(ok([{ kudos_id: "f1" }]));

    const page = await getFeedPage({ viewerId: "viewer-1", offset: 10, pageSize: 1 });

    expect(fetchFeedRows).toHaveBeenCalledWith({}, { hashtagId: null, departmentId: null }, 10, 1);
    expect(page.posts).toHaveLength(1);
    expect(page.hasMore).toBe(true);
    expect(page.posts[0]?.likedByViewer).toBe(true);
    expect(fetchViewerSentKudos).not.toHaveBeenCalled();
    expect(fetchViewerProfile).not.toHaveBeenCalled();
  });

  it("skips the viewer-likes query entirely for a guest", async () => {
    fetchFeedRows.mockResolvedValue(ok([buildKudosRow("f1", { kudos_images: [] })]));

    const page = await getFeedPage({ viewerId: null, offset: 0 });

    expect(fetchViewerLikedIds).not.toHaveBeenCalled();
    expect(page.posts[0]?.likedByViewer).toBe(false);
  });

  it("returns an empty page and never throws on failure", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    createSupabaseServerClientMock.mockRejectedValue(new Error("no connection"));

    await expect(getFeedPage({ viewerId: null, offset: 0 })).resolves.toEqual({ posts: [], hasMore: false });
    warnSpy.mockRestore();
  });
});
