import type {
  KudosBoardData,
  KudosFeedPost,
  KudosHighlightCard,
  KudosPersonRef,
  KudosRecentGiftEntry,
  KudosSpotlightNode,
  KudosSpotlightTickerItem,
} from "@/lib/kudos/types";

/**
 * Test-only fixture for the `/kudos` board component tests. Moved here from the product code
 * (`lib/kudos/mock-board-data.ts` / `lib/kudos/mock-people.ts`, deleted in phase 06) once the
 * real read layer (`lib/kudos/read/get-board-data.ts`) replaced them as the data source. Kept
 * only for the two Track A tests that render `KudosBoard`/`KudosHighlightCarousel` in isolation.
 */

type RosterEntry = { id: string; name: string; department: string; kudosCount: number };

const ROSTER: readonly RosterEntry[] = [
  { id: "huynh-duong-xuan", name: "Huỳnh Dương Xuân", department: "CECV2", kudosCount: 15 },
  { id: "do-hoang-hiep", name: "Đỗ Hoàng Hiệp", department: "CEVC10", kudosCount: 52 },
  { id: "duong-thuy-an", name: "Dương Thúy An", department: "CECV2", kudosCount: 8 },
  { id: "mai-phuong-thuy", name: "Mai Phương Thúy", department: "CEVC10", kudosCount: 25 },
  { id: "le-kieu-trang", name: "Lê Kiều Trang", department: "CECV2", kudosCount: 31 },
  { id: "nguyen-van-quy", name: "Nguyễn Văn Quy", department: "CEVC10", kudosCount: 45 },
  { id: "nguyen-ba-chuc", name: "Nguyễn Bá Chức", department: "CECV2", kudosCount: 12 },
  { id: "nguyen-hoang-linh", name: "Nguyễn Hoàng Linh", department: "CEVC10", kudosCount: 61 },
] as const;

function toPersonRef(entry: RosterEntry): KudosPersonRef {
  return { id: entry.id, name: entry.name, department: entry.department, avatarUrl: null, kudosCount: entry.kudosCount };
}

const MOCK_PEOPLE: readonly KudosPersonRef[] = ROSTER.map(toPersonRef);

function findMockPerson(id: string): KudosPersonRef {
  const person = MOCK_PEOPLE.find((candidate) => candidate.id === id);
  if (!person) throw new RangeError(`findMockPerson: unknown mock person id "${id}"`);
  return person;
}

function inferredCard(id: string, senderId: string, receiverId: string, likeCount: number): KudosHighlightCard {
  return {
    id,
    sender: findMockPerson(senderId),
    receiver: findMockPerson(receiverId),
    postedAt: "2025-10-30T09:15:00.000Z",
    content: "Cảm ơn bạn đã luôn nhiệt tình hỗ trợ đội nhóm trong suốt dự án vừa qua, rất trân trọng đóng góp của bạn.",
    hashtags: ["#Dedicated", "#TeamSpirit"],
    likeCount,
    likedByViewer: false,
  };
}

const EVIDENCED_CARD: KudosHighlightCard = {
  id: "highlight-evidenced-1",
  sender: findMockPerson("huynh-duong-xuan"),
  receiver: findMockPerson("do-hoang-hiep"),
  postedAt: "2025-10-30T10:00:00.000Z",
  content:
    "Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất...",
  hashtags: ["#Dedicated", "#Inspring"],
  likeCount: 1000,
  likedByViewer: false,
};

export const MOCK_HIGHLIGHT_CARDS: readonly KudosHighlightCard[] = [
  inferredCard("highlight-2", "duong-thuy-an", "nguyen-van-quy", 420),
  EVIDENCED_CARD,
  inferredCard("highlight-3", "le-kieu-trang", "mai-phuong-thuy", 305),
  inferredCard("highlight-4", "nguyen-ba-chuc", "nguyen-hoang-linh", 210),
  inferredCard("highlight-5", "nguyen-hoang-linh", "huynh-duong-xuan", 150),
];

const MOCK_HASHTAG_FILTERS = [
  { id: "idol-gioi-tre", label: "IDOL GIỚI TRẺ" },
  { id: "dedicated", label: "#Dedicated" },
  { id: "inspring", label: "#Inspring" },
] as const;

const MOCK_DEPARTMENT_FILTERS = [
  { id: "marketing", label: "Marketing" },
  { id: "cecv2", label: "CECV2" },
  { id: "cevc10", label: "CEVC10" },
] as const;

const MOCK_SPOTLIGHT_NODES: readonly KudosSpotlightNode[] = MOCK_PEOPLE.flatMap((person, index) =>
  Array.from({ length: 2 + (index % 3) }, (_, repeat) => ({
    id: `${person.id}-${repeat}`,
    name: person.name,
    kudosCount: 10 + index * 7 + repeat * 3,
    lastKudosAt: "2025-10-30T08:00:00.000Z",
    latestKudosId: `latest-${person.id}-${repeat}`,
    highlighted: person.id === "nguyen-hoang-linh",
  })),
);

const MOCK_SPOTLIGHT_TICKER: readonly KudosSpotlightTickerItem[] = MOCK_PEOPLE.slice(0, 4).map((person, index) => ({
  id: `ticker-${person.id}`,
  text: `${person.name} đã nhận được một Kudos mới`,
  at: `2025-10-30T08:${30 + index}:00.000Z`,
}));

function inferredPost(id: string, senderId: string, receiverId: string, tagLine: string | null): KudosFeedPost {
  return {
    id,
    sender: findMockPerson(senderId),
    receiver: findMockPerson(receiverId),
    postedAt: "2025-10-30T10:00:00.000Z",
    tagLine,
    content:
      "Cảm ơn bạn đã đồng hành và hỗ trợ hết mình trong suốt chặng đường vừa qua, chúc bạn luôn giữ vững năng lượng tích cực này.",
    attachments: [],
    hashtags: ["#Dedicated", "#Inspring"],
    likeCount: 10,
    likedByViewer: false,
  };
}

const MOCK_FEED_POSTS: readonly KudosFeedPost[] = [
  inferredPost("feed-1", "le-kieu-trang", "mai-phuong-thuy", "IDOL GIỚI TRẺ"),
  inferredPost("feed-2", "nguyen-van-quy", "do-hoang-hiep", null),
  inferredPost("feed-3", "duong-thuy-an", "nguyen-ba-chuc", null),
  inferredPost("feed-4", "huynh-duong-xuan", "nguyen-hoang-linh", null),
];

const MOCK_SIDEBAR_STATS = {
  received: 25,
  sent: 25,
  heartsReceived: 25,
  secretBoxesOpened: 25,
  secretBoxesUnopened: 25,
};

const MOCK_RECENT_GIFTS: readonly KudosRecentGiftEntry[] = MOCK_PEOPLE.slice(0, 6).map((person, index) => ({
  id: `gift-${person.id}`,
  name: person.name,
  avatarUrl: person.avatarUrl,
  giftLabel: "Nhận được 1 áo phông SAA",
  receivedAt: `2025-10-${20 + index}T10:00:00.000Z`,
}));

export const MOCK_KUDOS_BOARD_DATA: KudosBoardData = {
  highlight: {
    cards: MOCK_HIGHLIGHT_CARDS,
    hashtagFilters: [...MOCK_HASHTAG_FILTERS],
    departmentFilters: [...MOCK_DEPARTMENT_FILTERS],
  },
  spotlight: {
    totalKudos: 388,
    nodes: MOCK_SPOTLIGHT_NODES,
    ticker: MOCK_SPOTLIGHT_TICKER,
  },
  feed: {
    posts: MOCK_FEED_POSTS,
    hasMore: true,
    stats: MOCK_SIDEBAR_STATS,
    recentGifts: MOCK_RECENT_GIFTS,
  },
};
