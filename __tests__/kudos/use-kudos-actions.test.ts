import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MOCK_KUDOS_BOARD_DATA } from "@/__tests__/kudos/fixtures/board-data";
import { useKudosActions } from "@/lib/kudos/use-kudos-actions";

const { toggleMock, sendMock } = vi.hoisted(() => ({ toggleMock: vi.fn(), sendMock: vi.fn() }));
vi.mock("@/lib/kudos/actions/toggle-like", () => ({ toggleLike: toggleMock }));
vi.mock("@/lib/kudos/actions/send-kudos", () => ({ sendKudos: sendMock }));

function setup() {
  let data = structuredClone(MOCK_KUDOS_BOARD_DATA);
  const setBoardData = vi.fn((update) => { data = typeof update === "function" ? update(data) : update; });
  const hook = renderHook(() => useKudosActions({ isAuthenticated: true, setBoardData, requireLogin: vi.fn(), onSent: vi.fn().mockResolvedValue(undefined) }));
  return { ...hook, getData: () => data };
}

describe("useKudosActions", () => {
  beforeEach(() => { toggleMock.mockReset(); sendMock.mockReset(); });
  it("keeps an optimistic like after success", async () => {
    toggleMock.mockResolvedValue({ status: "liked", likeCount: 421 });
    const { result, getData } = setup();
    await act(() => result.current.toggle("highlight-2", true));
    expect(getData().highlight.cards[0]?.likedByViewer).toBe(true);
    expect(getData().highlight.cards[0]?.likeCount).toBe(421);
  });
  it("rolls an optimistic like back after failure", async () => {
    toggleMock.mockResolvedValue({ status: "failed" });
    const { result, getData } = setup();
    const before = getData().highlight.cards[0]?.likeCount;
    await act(() => result.current.toggle("highlight-2", true));
    expect(getData().highlight.cards[0]?.likedByViewer).toBe(false);
    expect(getData().highlight.cards[0]?.likeCount).toBe(before);
  });
});
