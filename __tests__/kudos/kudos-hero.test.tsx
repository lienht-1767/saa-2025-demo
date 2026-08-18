import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";

import { KudosHero } from "@/components/kudos/kudos-hero";
import viMessages from "@/messages/vi.json";

function renderHero(onSearchProfile = vi.fn()) {
  render(
    <NextIntlClientProvider locale="vi" messages={viMessages}>
      <KudosHero onSearchProfile={onSearchProfile} />
    </NextIntlClientProvider>,
  );
  return onSearchProfile;
}

describe("KudosHero profile search", () => {
  it("submits from the visible search icon", async () => {
    const user = userEvent.setup();
    const onSearch = renderHero();

    await user.type(screen.getByRole("searchbox", { name: "Tìm kiếm profile Sunner" }), "Nguyễn Linh");
    await user.click(screen.getByRole("button", { name: "Tìm profile" }));

    expect(onSearch).toHaveBeenCalledWith("Nguyễn Linh");
  });

  it("shows a useful message when no profile matches", async () => {
    const user = userEvent.setup();
    renderHero(vi.fn().mockResolvedValue("not-found"));

    await user.type(screen.getByRole("searchbox", { name: "Tìm kiếm profile Sunner" }), "Không tồn tại");
    await user.keyboard("{Enter}");

    expect(await screen.findByText("Không tìm thấy Sunner phù hợp.")).toBeInTheDocument();
  });
});
