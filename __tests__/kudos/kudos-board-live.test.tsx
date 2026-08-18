import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";

import { MOCK_KUDOS_BOARD_DATA } from "@/__tests__/kudos/fixtures/board-data";
import { KudosBoardLive } from "@/components/kudos/kudos-board-live";
import type { KudosBoardFilters } from "@/lib/kudos/read/board-filters";
import viMessages from "@/messages/vi.json";

const { push, replace, loadMoreFeedMock, toggleLikeMock } = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  loadMoreFeedMock: vi.fn(),
  toggleLikeMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
}));
vi.mock("@/lib/kudos/actions/load-more-feed", () => ({ loadMoreFeed: loadMoreFeedMock }));
vi.mock("@/lib/kudos/actions/toggle-like", () => ({ toggleLike: toggleLikeMock }));
vi.mock("@/lib/kudos/actions/send-kudos", () => ({ sendKudos: vi.fn() }));
vi.mock("@/lib/kudos/realtime/use-kudos-realtime", () => ({ useKudosRealtime: () => "live" }));

const NO_FILTERS: KudosBoardFilters = { hashtagId: null, departmentId: null };
const ACTIVE_CARD = MOCK_KUDOS_BOARD_DATA.highlight.cards[0]; // "highlight-2": hashtags #Dedicated/#TeamSpirit
const VIEWER_ID = "30000000-0000-0000-0000-000000000001";

function renderLive(isAuthenticated: boolean, filters: KudosBoardFilters = NO_FILTERS) {
  return render(
    <NextIntlClientProvider locale="vi" messages={viMessages}>
      <KudosBoardLive data={MOCK_KUDOS_BOARD_DATA} isAuthenticated={isAuthenticated} viewerId={isAuthenticated ? VIEWER_ID : null} filters={filters} />
    </NextIntlClientProvider>,
  );
}

describe("KudosBoardLive", () => {
  beforeEach(() => {
    push.mockReset();
    replace.mockReset();
    loadMoreFeedMock.mockReset();
    toggleLikeMock.mockReset();
    toggleLikeMock.mockResolvedValue({ status: "liked", likeCount: 1 });
  });

  it("sends a guest to /login instead of opening the kudos detail", async () => {
    const user = userEvent.setup();
    renderLive(false);

    await user.click(screen.getByRole("button", { name: "Xem chi tiết" }));

    expect(push).toHaveBeenCalledWith("/login");
  });

  it("sends a guest to /login instead of opening a profile", async () => {
    const user = userEvent.setup();
    renderLive(false);

    await user.click(screen.getAllByRole("button", { name: ACTIVE_CARD.sender.name })[0]);

    expect(push).toHaveBeenCalledWith("/login");
  });

  it("sends a guest to /login instead of toggling a like", async () => {
    const user = userEvent.setup();
    renderLive(false);

    await user.click(screen.getAllByRole("button", { name: "Thích hoặc bỏ thích lời cảm ơn này" })[0]);

    expect(push).toHaveBeenCalledWith("/login");
  });

  it("opens the kudos detail route for a signed-in viewer", async () => {
    const user = userEvent.setup();
    renderLive(true);

    await user.click(screen.getByRole("button", { name: "Xem chi tiết" }));

    expect(push).toHaveBeenCalledWith(`/kudos/${ACTIVE_CARD.id}`);
  });

  it("opens the profile route for a signed-in viewer", async () => {
    const user = userEvent.setup();
    renderLive(true);

    await user.click(screen.getAllByRole("button", { name: ACTIVE_CARD.sender.name })[0]);

    expect(push).toHaveBeenCalledWith(`/profile/${ACTIVE_CARD.sender.id}`);
  });

  it("does not navigate a signed-in viewer's like toggle (mutation deferred to a later phase)", async () => {
    const user = userEvent.setup();
    renderLive(true);

    await user.click(screen.getAllByRole("button", { name: "Thích hoặc bỏ thích lời cảm ơn này" })[0]);

    expect(push).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  it("replaces the URL with the matching catalog id when a hashtag chip is selected", async () => {
    const user = userEvent.setup();
    renderLive(true);

    await user.click(screen.getAllByRole("button", { name: "#Dedicated" })[0]);

    expect(replace).toHaveBeenCalledWith("/kudos?hashtagId=dedicated", { scroll: false });
  });

  it("does not navigate for a hashtag chip with no matching catalog entry", async () => {
    const user = userEvent.setup();
    renderLive(true);

    await user.click(screen.getAllByRole("button", { name: "#TeamSpirit" })[0]);

    expect(replace).not.toHaveBeenCalled();
  });

  it("appends the next feed page and hides Xem thêm once hasMore is false", async () => {
    const user = userEvent.setup();
    loadMoreFeedMock.mockResolvedValue({
      posts: [
        {
          id: "feed-extra",
          sender: ACTIVE_CARD.sender,
          receiver: ACTIVE_CARD.receiver,
          postedAt: "2025-11-01T00:00:00.000Z",
          tagLine: null,
          content: "Bài kudos bổ sung cho bài kiểm tra Xem thêm.",
          attachments: [],
          hashtags: [],
          likeCount: 0,
          likedByViewer: false,
        },
      ],
      hasMore: false,
    });
    renderLive(true);

    await user.click(screen.getByRole("button", { name: "Xem thêm" }));

    expect(loadMoreFeedMock).toHaveBeenCalledWith({
      filters: NO_FILTERS,
      offset: MOCK_KUDOS_BOARD_DATA.feed.posts.length,
    });
    await waitFor(() => {
      expect(screen.getByText("Bài kudos bổ sung cho bài kiểm tra Xem thêm.")).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: "Xem thêm" })).not.toBeInTheDocument();
  });

  it("shows the secret box coming-soon notice for a signed-in viewer", async () => {
    const user = userEvent.setup();
    renderLive(true);

    await user.click(screen.getByRole("button", { name: "Mở Secret Box" }));

    expect(screen.getByRole("status")).toHaveTextContent("Tính năng Secret Box sẽ sớm ra mắt.");
    expect(push).not.toHaveBeenCalled();
  });

  it("resyncs board data when the server supplies a fresh filter pair", () => {
    const { rerender } = renderLive(true);
    expect(screen.getByText("388 KUDOS")).toBeInTheDocument();

    const nextFilters: KudosBoardFilters = { hashtagId: "dedicated", departmentId: null };
    const nextData = { ...MOCK_KUDOS_BOARD_DATA, spotlight: { ...MOCK_KUDOS_BOARD_DATA.spotlight, totalKudos: 42 } };
    rerender(
      <NextIntlClientProvider locale="vi" messages={viMessages}>
        <KudosBoardLive data={nextData} isAuthenticated viewerId={VIEWER_ID} filters={nextFilters} />
      </NextIntlClientProvider>,
    );

    expect(screen.getByText("42 KUDOS")).toBeInTheDocument();
  });

  it("shows active URL filters in the Highlight controls after navigation", () => {
    renderLive(true, { hashtagId: "dedicated", departmentId: "marketing" });

    const filterButtons = screen
      .getAllByRole("button")
      .filter((button) => button.getAttribute("aria-haspopup") === "menu");
    expect(filterButtons.map((button) => button.textContent)).toEqual(["#Dedicated", "Marketing"]);
  });

  it("keeps an optimistic filter selection when the second dropdown changes", async () => {
    const user = userEvent.setup();
    renderLive(true);

    await user.click(screen.getByRole("button", { name: "Hashtag" }));
    await user.click(screen.getByRole("menuitemradio", { name: "#Dedicated" }));
    await user.click(screen.getByRole("button", { name: "Phòng ban" }));
    await user.click(screen.getByRole("menuitemradio", { name: "Marketing" }));

    expect(replace).toHaveBeenLastCalledWith(
      "/kudos?hashtagId=dedicated&departmentId=marketing",
      { scroll: false },
    );
  });
});
