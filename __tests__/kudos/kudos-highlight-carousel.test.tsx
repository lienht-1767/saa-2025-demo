import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";

import { KudosHighlightCarousel } from "@/components/kudos/kudos-highlight-carousel";
import { MOCK_HIGHLIGHT_CARDS } from "@/__tests__/kudos/fixtures/board-data";
import viMessages from "@/messages/vi.json";

function renderCarousel() {
  return render(
    <NextIntlClientProvider locale="vi" messages={viMessages}>
      <KudosHighlightCarousel cards={MOCK_HIGHLIGHT_CARDS} buildShareUrl={(id) => `/kudos/${id}`} />
    </NextIntlClientProvider>,
  );
}

describe("KudosHighlightCarousel", () => {
  it("disables Prev on the first card and shows page 1 of N", () => {
    renderCarousel();

    expect(screen.getByRole("button", { name: "Slide trước" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Slide tiếp theo" })).toBeEnabled();
    expect(screen.getByText(`1/${MOCK_HIGHLIGHT_CARDS.length}`)).toBeInTheDocument();
  });

  it("advances the page and re-enables Prev after clicking Next", async () => {
    const user = userEvent.setup();
    renderCarousel();

    await user.click(screen.getByRole("button", { name: "Slide tiếp theo" }));

    expect(screen.getByText(`2/${MOCK_HIGHLIGHT_CARDS.length}`)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Slide trước" })).toBeEnabled();
  });

  it("disables Next once the last card is reached", async () => {
    const user = userEvent.setup();
    renderCarousel();
    const nextButton = screen.getByRole("button", { name: "Slide tiếp theo" });

    for (let i = 1; i < MOCK_HIGHLIGHT_CARDS.length; i += 1) {
      await user.click(nextButton);
    }

    expect(nextButton).toBeDisabled();
  });

  it("shows the empty-state message when there are no cards", () => {
    render(
      <NextIntlClientProvider locale="vi" messages={viMessages}>
        <KudosHighlightCarousel cards={[]} buildShareUrl={(id) => `/kudos/${id}`} />
      </NextIntlClientProvider>,
    );

    expect(screen.getByText("Hiện tại chưa có Kudos nào.")).toBeInTheDocument();
  });
});
