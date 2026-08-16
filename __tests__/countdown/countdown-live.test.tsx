import { act, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PrelaunchCountdownLive } from "@/components/countdown/countdown-live";
import { computeCountdown } from "@/lib/home/countdown";
import viMessages from "@/messages/vi.json";

const replace = vi.fn();
const router = { replace };

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

function renderLive(deadlineMs: number, nowMs: number) {
  return render(
    <NextIntlClientProvider locale="vi" messages={viMessages}>
      <PrelaunchCountdownLive deadlineMs={deadlineMs} initial={computeCountdown(deadlineMs, nowMs)} />
    </NextIntlClientProvider>,
  );
}

describe("PrelaunchCountdownLive", () => {
  afterEach(() => {
    vi.useRealTimers();
    replace.mockReset();
  });

  it("updates the visible whole minute while checking the deadline every second", () => {
    const now = Date.UTC(2026, 7, 16, 3, 0, 0);
    vi.useFakeTimers();
    vi.setSystemTime(now);
    renderLive(now + 61_000, now);

    expect(screen.getByRole("timer")).toHaveAccessibleName("Còn 00 ngày 00 giờ 01 phút");

    act(() => {
      vi.advanceTimersByTime(2_000);
    });

    expect(screen.getByRole("timer")).toHaveAccessibleName("Còn 00 ngày 00 giờ 00 phút");
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects to the homepage as soon as the deadline is reached", () => {
    const now = Date.UTC(2026, 7, 16, 3, 0, 0);
    vi.useFakeTimers();
    vi.setSystemTime(now);
    renderLive(now + 2_000, now);

    act(() => {
      vi.advanceTimersByTime(2_000);
    });

    expect(replace).toHaveBeenCalledWith("/");
    expect(vi.getTimerCount()).toBe(0);
  });
});
