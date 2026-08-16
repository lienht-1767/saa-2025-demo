import { render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import { PrelaunchCountdownDisplay } from "@/components/countdown/countdown-display";
import viMessages from "@/messages/vi.json";

function renderDisplay(days = 2, hours = 5, minutes = 20) {
  return render(
    <NextIntlClientProvider locale="vi" messages={viMessages}>
      <PrelaunchCountdownDisplay days={days} hours={hours} minutes={minutes} />
    </NextIntlClientProvider>,
  );
}

describe("PrelaunchCountdownDisplay", () => {
  it("renders the exact Figma copy and one label for each unit", () => {
    renderDisplay();

    expect(screen.getByRole("heading", { name: "Sự kiện sẽ bắt đầu sau" })).toBeInTheDocument();
    expect(screen.getByText("DAYS")).toBeInTheDocument();
    expect(screen.getByText("HOURS")).toBeInTheDocument();
    expect(screen.getByText("MINUTES")).toBeInTheDocument();
  });

  it("exposes a zero-padded accessible countdown summary", () => {
    renderDisplay();

    const timer = screen.getByRole("timer", { name: "Còn 02 ngày 05 giờ 20 phút" });
    expect(within(timer).getAllByText("0")).toHaveLength(3);
    expect(within(timer).getAllByText("2")).toHaveLength(2);
    expect(within(timer).getByText("5")).toBeInTheDocument();
  });

  it("keeps exactly two boxes per unit when a configured event is more than 99 days away", () => {
    const { container } = renderDisplay(132, 5, 20);

    expect(screen.getByRole("timer")).toHaveAccessibleName("Còn 99 ngày 05 giờ 20 phút");
    expect(container.querySelectorAll(".countdown-digit")).toHaveLength(6);
  });
});
