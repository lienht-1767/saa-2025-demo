import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";

import { AwardsNav } from "@/components/awards/awards-nav";
import { AWARD_ROWS } from "@/lib/awards/award-rows";
import viMessages from "@/messages/vi.json";

class IntersectionObserverStub {
  static latest: IntersectionObserverStub | undefined;
  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    IntersectionObserverStub.latest = this;
  }

  observe() {}
  disconnect() {}
  unobserve() {}

  emit(entries: Partial<IntersectionObserverEntry>[]) {
    this.callback(entries as IntersectionObserverEntry[], this as unknown as IntersectionObserver);
  }
}

describe("AwardsNav", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/awards");
    vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: query.includes("reduce"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    Element.prototype.scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollTo = vi.fn();
  });

  function renderNav() {
    return render(
      <NextIntlClientProvider locale="vi" messages={viMessages}>
        <AwardsNav rows={AWARD_ROWS.slice(0, 2)} />
        <section id="top-talent" tabIndex={-1} />
        <section id="top-project" tabIndex={-1} />
      </NextIntlClientProvider>,
    );
  }

  it("initialises no-hash navigation on the first award", async () => {
    renderNav();
    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Top Talent" })).toHaveAttribute(
        "aria-current",
        "location",
      ),
    );
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
    expect(HTMLElement.prototype.scrollTo).toHaveBeenCalled();
  });

  it("updates the URL, active state, focus and reduced-motion scroll on click", async () => {
    const user = userEvent.setup();
    renderNav();
    const target = document.getElementById("top-project") as HTMLElement;

    await user.click(screen.getByRole("link", { name: "Top Project" }));

    expect(window.location.hash).toBe("#top-project");
    expect(screen.getByRole("link", { name: "Top Project" })).toHaveAttribute(
      "aria-current",
      "location",
    );
    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
    expect(target).toHaveFocus();
  });

  it("uses smooth scrolling when reduced motion is not requested", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches: false,
        media: "",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    const user = userEvent.setup();
    renderNav();
    const target = document.getElementById("top-project") as HTMLElement;

    await user.click(screen.getByRole("link", { name: "Top Project" }));

    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
  });

  it("does not mark an invalid deep link as active", async () => {
    window.history.replaceState(null, "", "/awards#missing");
    renderNav();

    await waitFor(() => expect(screen.queryByRole("link", { current: "location" })).toBeNull());
  });

  it("uses live section positions instead of stale observer entry coordinates", async () => {
    renderNav();
    const first = document.getElementById("top-talent") as HTMLElement;
    const second = document.getElementById("top-project") as HTMLElement;
    first.getBoundingClientRect = vi.fn(() => ({ top: -240 }) as DOMRect);
    second.getBoundingClientRect = vi.fn(() => ({ top: 104 }) as DOMRect);

    IntersectionObserverStub.latest?.emit([
      { target: first, isIntersecting: true, boundingClientRect: { top: 90 } as DOMRect },
      { target: second, isIntersecting: true, boundingClientRect: { top: 700 } as DOMRect },
    ]);

    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Top Project" })).toHaveAttribute(
        "aria-current",
        "location",
      ),
    );
  });
});
