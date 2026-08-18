import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentProfileMock = vi.fn();
const getFeedPageMock = vi.fn();

vi.mock("@/lib/auth/profile", () => ({ getCurrentProfile: getCurrentProfileMock }));
vi.mock("@/lib/kudos/read/get-board-data", () => ({ getFeedPage: getFeedPageMock }));

const { loadMoreFeed } = await import("@/lib/kudos/actions/load-more-feed");

describe("loadMoreFeed", () => {
  beforeEach(() => {
    getCurrentProfileMock.mockReset();
    getFeedPageMock.mockReset();
    getFeedPageMock.mockResolvedValue({ posts: [], hasMore: false });
  });

  it("resolves the signed-in viewer and forwards filters/offset to the read layer", async () => {
    getCurrentProfileMock.mockResolvedValue({ userId: "user-1" });

    await loadMoreFeed({ filters: { hashtagId: "dedicated", departmentId: null }, offset: 10 });

    expect(getFeedPageMock).toHaveBeenCalledWith({
      viewerId: "user-1",
      filters: { hashtagId: "dedicated", departmentId: null },
      offset: 10,
    });
  });

  it("passes a null viewerId for a guest", async () => {
    getCurrentProfileMock.mockResolvedValue(null);

    await loadMoreFeed({ filters: { hashtagId: null, departmentId: null }, offset: 0 });

    expect(getFeedPageMock).toHaveBeenCalledWith(
      expect.objectContaining({ viewerId: null }),
    );
  });

  it("clamps a negative or non-integer offset to 0 rather than trusting the wire value", async () => {
    getCurrentProfileMock.mockResolvedValue(null);

    await loadMoreFeed({ filters: { hashtagId: null, departmentId: null }, offset: -5 });
    expect(getFeedPageMock).toHaveBeenCalledWith(expect.objectContaining({ offset: 0 }));

    await loadMoreFeed({ filters: { hashtagId: null, departmentId: null }, offset: 3.5 });
    expect(getFeedPageMock).toHaveBeenCalledWith(expect.objectContaining({ offset: 0 }));
  });

  it("drops non-string filter values rather than forwarding them untyped", async () => {
    getCurrentProfileMock.mockResolvedValue(null);

    await loadMoreFeed({
      filters: { hashtagId: 42, departmentId: undefined } as never,
      offset: 0,
    });

    expect(getFeedPageMock).toHaveBeenCalledWith(
      expect.objectContaining({ filters: { hashtagId: null, departmentId: null } }),
    );
  });

  it("returns the read layer's result unchanged", async () => {
    getCurrentProfileMock.mockResolvedValue(null);
    getFeedPageMock.mockResolvedValue({ posts: [{ id: "feed-5" }], hasMore: true });

    await expect(
      loadMoreFeed({ filters: { hashtagId: null, departmentId: null }, offset: 4 }),
    ).resolves.toEqual({ posts: [{ id: "feed-5" }], hasMore: true });
  });
});
