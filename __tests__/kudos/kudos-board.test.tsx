import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

import { KudosBoard } from "@/components/kudos/kudos-board";
import { MOCK_KUDOS_BOARD_DATA } from "@/__tests__/kudos/fixtures/board-data";
import viMessages from "@/messages/vi.json";

describe("KudosBoard", () => {
  it("renders every section's heading with the mock data and no crash", () => {
    render(
      <NextIntlClientProvider locale="vi" messages={viMessages}>
        <KudosBoard data={MOCK_KUDOS_BOARD_DATA} />
      </NextIntlClientProvider>,
    );

    expect(screen.getByRole("heading", { name: "Hệ thống ghi nhận và cảm ơn" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "KUDOS NỔI BẬT" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "BẢNG VINH DANH" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "TẤT CẢ KUDOS" })).toBeInTheDocument();
    expect(screen.getByText("388 KUDOS")).toBeInTheDocument();
  });

  it("falls back to every callback being a safe no-op when none are supplied", () => {
    // Regression guard: components must optional-chain every callback prop, never call it
    // unconditionally — otherwise mounting the board without `callbacks` throws.
    expect(() =>
      render(
        <NextIntlClientProvider locale="vi" messages={viMessages}>
          <KudosBoard data={MOCK_KUDOS_BOARD_DATA} />
        </NextIntlClientProvider>,
      ),
    ).not.toThrow();
  });

  it("renders the guest login CTA instead of the stats box when stats is null", () => {
    const guestData = { ...MOCK_KUDOS_BOARD_DATA, feed: { ...MOCK_KUDOS_BOARD_DATA.feed, stats: null } };

    render(
      <NextIntlClientProvider locale="vi" messages={viMessages}>
        <KudosBoard data={guestData} />
      </NextIntlClientProvider>,
    );

    expect(screen.getByText("Đăng nhập để xem thống kê của bạn")).toBeInTheDocument();
    expect(screen.queryByText("Số Kudos bạn nhận được:")).not.toBeInTheDocument();
  });

  it("renders the personal stats box instead of the guest CTA for a signed-in viewer", () => {
    render(
      <NextIntlClientProvider locale="vi" messages={viMessages}>
        <KudosBoard data={MOCK_KUDOS_BOARD_DATA} />
      </NextIntlClientProvider>,
    );

    expect(screen.getByText("Số Kudos bạn nhận được:")).toBeInTheDocument();
    expect(screen.queryByText("Đăng nhập để xem thống kê của bạn")).not.toBeInTheDocument();
  });
});
