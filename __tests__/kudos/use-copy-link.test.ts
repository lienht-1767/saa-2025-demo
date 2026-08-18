import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { useCopyLink } from "@/lib/kudos/use-copy-link";

describe("useCopyLink", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("goes idle -> copied on a successful clipboard write, then back to idle after the toast window", async () => {
    // This suite never calls userEvent.setup() (no rendered DOM to click), so jsdom's default,
    // clipboard-less `navigator` is still in play here — a plain property assignment is enough.
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const { result } = renderHook(() => useCopyLink());
    expect(result.current.status).toBe("idle");

    await act(async () => {
      result.current.copy("https://example.com/kudos/1");
    });

    expect(writeText).toHaveBeenCalledWith("https://example.com/kudos/1");
    expect(result.current.status).toBe("copied");

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.status).toBe("idle");
  });

  it("goes idle -> error when the clipboard write rejects, instead of failing silently", async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } });

    const { result } = renderHook(() => useCopyLink());

    await act(async () => {
      result.current.copy("https://example.com/kudos/1");
    });

    expect(result.current.status).toBe("error");
  });
});
