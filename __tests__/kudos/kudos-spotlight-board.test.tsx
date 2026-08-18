import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";

import { KudosSpotlightBoard } from "@/components/kudos/kudos-spotlight-board";
import type { KudosSpotlightData } from "@/lib/kudos/types";
import viMessages from "@/messages/vi.json";

const DATA: KudosSpotlightData = {
  totalKudos: 12,
  nodes: [
    { id: "nguyen", name: "Nguyễn Hoàng Linh", kudosCount: 12, lastKudosAt: "2026-08-18T08:00:00Z", latestKudosId: "k1" },
    { id: "do", name: "Đỗ Hoàng Hiệp", kudosCount: 8, lastKudosAt: "2026-08-18T07:00:00Z", latestKudosId: "k2" },
  ],
  ticker: [],
};

function renderBoard() {
  return render(
    <NextIntlClientProvider locale="vi" messages={viMessages}>
      <KudosSpotlightBoard data={DATA} />
    </NextIntlClientProvider>,
  );
}

describe("KudosSpotlightBoard", () => {
  it("filters Vietnamese names with an unaccented query", async () => {
    const user = userEvent.setup();
    renderBoard();

    await user.type(screen.getByRole("searchbox", { name: "Tìm kiếm profile Sunner" }), "nguyen");

    expect(screen.getByText("Nguyễn Hoàng Linh")).toBeInTheDocument();
    expect(screen.queryByText("Đỗ Hoàng Hiệp")).not.toBeInTheDocument();
  });

  it("keeps the board at the design width and uses one pan/zoom toggle", async () => {
    const user = userEvent.setup();
    renderBoard();

    const board = screen.getByRole("application").parentElement;
    expect(board).toHaveClass("max-w-[1157px]");

    const toggle = screen.getByRole("button", { name: "Phóng to" });
    await user.click(toggle);
    expect(screen.getByRole("button", { name: "Đặt lại góc nhìn" })).toBeInTheDocument();
  });
});
