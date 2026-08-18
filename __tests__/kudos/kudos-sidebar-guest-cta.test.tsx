import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

import { KudosSidebarGuestCta } from "@/components/kudos/kudos-sidebar-guest-cta";
import { LOGIN_ROUTE } from "@/lib/auth/routes";
import viMessages from "@/messages/vi.json";

describe("KudosSidebarGuestCta", () => {
  it("renders the guest copy with a link to the login route", () => {
    render(
      <NextIntlClientProvider locale="vi" messages={viMessages}>
        <KudosSidebarGuestCta />
      </NextIntlClientProvider>,
    );

    expect(screen.getByText("Đăng nhập để xem thống kê của bạn")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Đăng nhập ngay" })).toHaveAttribute("href", LOGIN_ROUTE);
  });
});
