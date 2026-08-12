import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

import vi_messages from "@/messages/vi.json";
import { CountdownLive } from "@/components/home/countdown-live";
import { computeCountdown, ZERO_COUNTDOWN } from "@/lib/home/countdown";

const NOW = Date.parse("2026-01-01T00:00:00+07:00");

function withProvider(deadlineMs: number | null, initial: ReturnType<typeof computeCountdown>) {
  return (
    <NextIntlClientProvider locale="vi" messages={vi_messages}>
      <CountdownLive deadlineMs={deadlineMs} initial={initial} />
    </NextIntlClientProvider>
  );
}

describe("CountdownLive", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("hydrates without a text-mismatch warning even when server and client clocks disagree (edge case row 4)", () => {
    const serverNow = NOW;
    const clientNow = NOW + 2000; // client hydrates two seconds after the server rendered
    const deadline = NOW + 2 * 86_400_000 + 3 * 3_600_000 + 4 * 60_000;
    const initial = computeCountdown(deadline, serverNow);
    const tree = withProvider(deadline, initial);

    const html = renderToString(tree);
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.useFakeTimers();
    vi.setSystemTime(clientNow);

    act(() => {
      hydrateRoot(container, tree);
    });

    expect(consoleError).not.toHaveBeenCalled();

    container.remove();
  });

  it("renders exactly the server-supplied initial value on first paint", () => {
    const deadline = NOW + 2 * 86_400_000 + 3 * 3_600_000 + 4 * 60_000;
    const initial = computeCountdown(deadline, NOW);

    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    render(withProvider(deadline, initial));

    expect(screen.getByRole("timer")).toHaveAccessibleName("Còn 02 ngày 03 giờ 04 phút");
  });

  it("decreases the rendered minutes after a 60s tick", () => {
    const deadline = NOW + 3 * 60_000;
    const initial = computeCountdown(deadline, NOW);

    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    render(withProvider(deadline, initial));

    expect(screen.getByRole("timer")).toHaveAccessibleName("Còn 00 ngày 00 giờ 03 phút");

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(screen.getByRole("timer")).toHaveAccessibleName("Còn 00 ngày 00 giờ 02 phút");
  });

  it("flips to the terminal state once the deadline is crossed and stops ticking (ID-39/40/41)", () => {
    const deadline = NOW + 60_000;
    const initial = computeCountdown(deadline, NOW);

    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    render(withProvider(deadline, initial));

    act(() => {
      vi.advanceTimersByTime(120_000);
    });

    expect(screen.queryByText(/comming soon/i)).not.toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("clears its interval on unmount", () => {
    const deadline = NOW + 10 * 60_000;
    const initial = computeCountdown(deadline, NOW);

    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    const { unmount } = render(withProvider(deadline, initial));

    expect(vi.getTimerCount()).toBeGreaterThan(0);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  it("never starts a timer when the deadline could not be resolved (BR13)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    render(withProvider(null, ZERO_COUNTDOWN));

    expect(vi.getTimerCount()).toBe(0);
    expect(screen.queryByText(/comming soon/i)).not.toBeInTheDocument();
  });
});
