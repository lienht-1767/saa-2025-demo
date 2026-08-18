import { describe, expect, it } from "vitest";

import type {
  KudosFeedRow,
  KudosHighlightRow,
  ProfileRefRow,
  SpotlightNodeRow,
  SpotlightTickerRow,
} from "@/lib/kudos/read/db-row-types";
import {
  toAnonymousPersonRef,
  toFeedPost,
  toHighlightCard,
  toPersonRef,
  toSidebarStats,
  toSpotlight,
  toSpotlightNodes,
  toSpotlightTicker,
} from "@/lib/kudos/read/map-board-data";

const senderRow: ProfileRefRow = {
  id: "sender-1",
  full_name: "An Nguyen",
  avatar_url: "https://example.com/an.png",
  kudos_received_count: 12,
  department: { name: "Marketing" },
};

const recipientRow: ProfileRefRow = {
  id: "recipient-1",
  full_name: "Binh Tran",
  avatar_url: null,
  kudos_received_count: 55,
  department: null,
};

function buildHighlightRow(overrides: Partial<KudosHighlightRow> = {}): KudosHighlightRow {
  return {
    id: "kudos-1",
    message: "Cam on ban rat nhieu vi da luon dong hanh",
    like_count: 42,
    created_at: "2026-01-01T10:00:00.000Z",
    sender: senderRow,
    recipient: recipientRow,
    kudos_hashtags: [
      { hashtag_id: "h1", hashtag: { name: "Dedicated" } },
      { hashtag_id: "h2", hashtag: { name: "TeamSpirit" } },
    ],
    title: null,
    is_anonymous: false,
    anonymous_name: null,
    ...overrides,
  };
}

describe("toPersonRef", () => {
  it("maps a full profile row, department name, and the raw lifetime count", () => {
    expect(toPersonRef(senderRow)).toEqual({
      id: "sender-1",
      name: "An Nguyen",
      department: "Marketing",
      avatarUrl: "https://example.com/an.png",
      kudosCount: 12,
    });
  });

  it("falls back to 'Sunner' and an empty department when both are null", () => {
    expect(toPersonRef({ ...senderRow, full_name: null, department: null })).toMatchObject({
      name: "Sunner",
      department: "",
    });
  });

  it("never derives a tier, title, or hero label from the count", () => {
    const ref = toPersonRef(senderRow);
    expect(ref).not.toHaveProperty("starTier");
    expect(ref).not.toHaveProperty("titleBadge");
    expect(Object.keys(ref)).toEqual(["id", "name", "department", "avatarUrl", "kudosCount"]);
  });
});

describe("toHighlightCard", () => {
  it("maps sender, receiver, hashtags, and likedByViewer from the liked-ids set", () => {
    const row = buildHighlightRow();

    expect(toHighlightCard(row, new Set(["kudos-1"]))).toEqual({
      id: "kudos-1",
      sender: toPersonRef(senderRow),
      receiver: toPersonRef(recipientRow),
      postedAt: "2026-01-01T10:00:00.000Z",
      contentHtml: row.message,
      hashtags: ["Dedicated", "TeamSpirit"],
      likeCount: 42,
      likedByViewer: true,
    });
  });

  it("is false for likedByViewer when the card's id is absent from the set", () => {
    expect(toHighlightCard(buildHighlightRow(), new Set())).toMatchObject({ likedByViewer: false });
  });

  it("sanitizes the message so a <script> tag never survives into contentHtml", () => {
    const row = buildHighlightRow({ message: "hi <script>alert(1)</script> there" });

    expect(toHighlightCard(row, new Set()).contentHtml).not.toContain("<script>");
  });

  it("uses the anonymous sender ref, with no avatar, when is_anonymous is true", () => {
    const row = buildHighlightRow({ is_anonymous: true, anonymous_name: "Người bí ẩn" });

    const card = toHighlightCard(row, new Set());

    expect(card.sender).toEqual({ id: "", name: "Người bí ẩn", department: "", avatarUrl: null, kudosCount: 0 });
    expect(card.receiver).toEqual(toPersonRef(recipientRow));
  });
});

describe("toAnonymousPersonRef", () => {
  it("falls back to the generic Sunner name when anonymous_name is null or blank", () => {
    expect(toAnonymousPersonRef(null).name).toBe("Sunner");
    expect(toAnonymousPersonRef("  ").name).toBe("Sunner");
  });

  it("has no avatar and no id (no profile to link)", () => {
    const ref = toAnonymousPersonRef("Ẩn danh");
    expect(ref.avatarUrl).toBeNull();
    expect(ref.id).toBe("");
  });
});

describe("toFeedPost", () => {
  it("sorts attachments by position and sets tagLine from the row's title", () => {
    const row: KudosFeedRow = {
      ...buildHighlightRow({ title: "Người truyền động lực" }),
      kudos_images: [
        { id: "img-2", url: "https://example.com/2.png", position: 1 },
        { id: "img-1", url: "https://example.com/1.png", position: 0 },
      ],
    };

    const post = toFeedPost(row, new Set());

    expect(post.tagLine).toBe("Người truyền động lực");
    expect(post.attachments.map((a) => a.id)).toEqual(["img-1", "img-2"]);
  });

  it("gives a null tagLine when the row's title is null", () => {
    const row: KudosFeedRow = { ...buildHighlightRow({ title: null }), kudos_images: [] };

    expect(toFeedPost(row, new Set()).tagLine).toBeNull();
  });

  it("trims a long message to a short attachment alt label", () => {
    const longMessage = "a".repeat(120);
    const row: KudosFeedRow = {
      ...buildHighlightRow({ message: longMessage }),
      kudos_images: [{ id: "img-1", url: "https://example.com/1.png", position: 0 }],
    };

    const post = toFeedPost(row, new Set());

    expect(post.attachments[0]?.alt.length).toBeLessThanOrEqual(61);
    expect(post.attachments[0]?.alt.endsWith("…")).toBe(true);
  });

  it("strips markup out of the attachment alt text", () => {
    const row: KudosFeedRow = {
      ...buildHighlightRow({ message: "<b>bold</b> and <script>alert(1)</script> text" }),
      kudos_images: [{ id: "img-1", url: "https://example.com/1.png", position: 0 }],
    };

    const alt = toFeedPost(row, new Set()).attachments[0]?.alt ?? "";
    expect(alt).not.toContain("<");
    expect(alt).not.toContain(">");
  });

  it("returns an empty attachments array when the kudos carries no images", () => {
    const row: KudosFeedRow = { ...buildHighlightRow(), kudos_images: [] };

    expect(toFeedPost(row, new Set()).attachments).toEqual([]);
  });

  it("sanitizes the message so a <script> tag never survives into contentHtml", () => {
    const row: KudosFeedRow = { ...buildHighlightRow({ message: "<script>alert(1)</script>ok" }), kudos_images: [] };

    expect(toFeedPost(row, new Set()).contentHtml).not.toContain("<script>");
  });

  it("uses the anonymous sender ref, with no avatar, when is_anonymous is true", () => {
    const row: KudosFeedRow = {
      ...buildHighlightRow({ is_anonymous: true, anonymous_name: "Người bí ẩn" }),
      kudos_images: [],
    };

    const post = toFeedPost(row, new Set());

    expect(post.sender).toEqual({ id: "", name: "Người bí ẩn", department: "", avatarUrl: null, kudosCount: 0 });
  });
});

describe("toSpotlightNodes", () => {
  const rows: SpotlightNodeRow[] = [
    { id: "u1", full_name: "An Nguyen", kudos_received_count: 30, last_kudos_received_at: "2026-01-01T00:00:00.000Z", received_kudos: [{ id: "k1", created_at: "2026-01-01T00:00:00.000Z" }] },
    { id: "u2", full_name: "Binh Tran", kudos_received_count: 20, last_kudos_received_at: "2026-01-02T00:00:00.000Z", received_kudos: [{ id: "k2", created_at: "2026-01-02T00:00:00.000Z" }] },
  ];

  it("marks only the first (highest-ranked) row as highlighted", () => {
    const nodes = toSpotlightNodes(rows);

    expect(nodes[0]?.highlighted).toBe(true);
    expect(nodes[1]?.highlighted).toBeUndefined();
  });

  it("falls back to the epoch timestamp when last_kudos_received_at is null", () => {
    const nodes = toSpotlightNodes([{ id: "u3", full_name: "Chi Le", kudos_received_count: 5, last_kudos_received_at: null, received_kudos: [] }]);

    expect(nodes[0]?.lastKudosAt).toBe("1970-01-01T00:00:00.000Z");
  });

  it("maps an empty row set to an empty node list", () => {
    expect(toSpotlightNodes([])).toEqual([]);
  });
});

describe("toSpotlightTicker", () => {
  it("formats each row's recipient name through the injected translator", () => {
    const rows: SpotlightTickerRow[] = [
      { id: "t1", created_at: "2026-01-01T08:30:00.000Z", recipient: { full_name: "An Nguyen" } },
    ];
    const format = (name: string) => `${name} just received a new Kudos`;

    expect(toSpotlightTicker(rows, format)).toEqual([
      { id: "t1", text: "An Nguyen just received a new Kudos", at: "2026-01-01T08:30:00.000Z" },
    ]);
  });

  it("falls back to 'Sunner' when the recipient embed is missing a name", () => {
    const rows: SpotlightTickerRow[] = [{ id: "t2", created_at: "2026-01-01T09:00:00.000Z", recipient: null }];

    expect(toSpotlightTicker(rows, (name) => name)).toEqual([{ id: "t2", text: "Sunner", at: "2026-01-01T09:00:00.000Z" }]);
  });
});

describe("toSpotlight", () => {
  it("composes totalKudos, nodes, and ticker into one KudosSpotlightData value", () => {
    const spotlight = toSpotlight(
      [{ id: "u1", full_name: "An", kudos_received_count: 10, last_kudos_received_at: "2026-01-01T00:00:00.000Z", received_kudos: [{ id: "k1", created_at: "2026-01-01T00:00:00.000Z" }] }],
      [{ id: "t1", created_at: "2026-01-01T00:00:00.000Z", recipient: { full_name: "An" } }],
      388,
      (name) => `${name}!`,
    );

    expect(spotlight.totalKudos).toBe(388);
    expect(spotlight.nodes).toHaveLength(1);
    expect(spotlight.ticker).toEqual([{ id: "t1", text: "An!", at: "2026-01-01T00:00:00.000Z" }]);
  });

  it("maps empty rows to the fully-empty spotlight shape", () => {
    expect(toSpotlight([], [], 0, (name) => name)).toEqual({ totalKudos: 0, nodes: [], ticker: [] });
  });
});

describe("toSidebarStats", () => {
  it("sums like_count across the viewer's sent kudos for heartsReceived, and counts rows for sent", () => {
    expect(toSidebarStats(15, [{ like_count: 3 }, { like_count: 7 }])).toEqual({
      received: 15,
      sent: 2,
      heartsReceived: 10,
      secretBoxesOpened: 0,
      secretBoxesUnopened: 0,
    });
  });

  it("returns all-zero stats for a viewer with no received count and no sent kudos", () => {
    expect(toSidebarStats(0, [])).toEqual({
      received: 0,
      sent: 0,
      heartsReceived: 0,
      secretBoxesOpened: 0,
      secretBoxesUnopened: 0,
    });
  });
});
