import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";

import viMessages from "@/messages/vi.json";

vi.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => (key: string) => {
    const path = `${namespace}.${key}`.split(".");
    let value: unknown = viMessages;
    for (const segment of path) value = (value as Record<string, unknown>)[segment];
    return value as string;
  },
}));

vi.mock("@/lib/i18n/actions", () => ({ setLocale: vi.fn() }));

const { AccountMenu } = await import("@/components/layout/account-menu");
const { NotificationBell } = await import("@/components/layout/notification-bell");
const { SiteHeader } = await import("@/components/layout/site-header");

function withMessages(node: React.ReactNode) {
  return (
    <NextIntlClientProvider locale="vi" messages={viMessages}>
      {node}
    </NextIntlClientProvider>
  );
}

describe("homepage header controls", () => {
  it("keeps the Figma 24px bell glyph and exposes unread state", () => {
    render(withMessages(<NotificationBell unreadCount={3} />));

    const trigger = screen.getByRole("button", { name: "Thông báo, 3 chưa đọc" });
    expect(trigger.querySelector("svg")).toHaveClass("size-6", "shrink-0");
    expect(trigger.parentElement?.querySelector(".bg-badge-danger")).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("opens the notification panel and returns focus to its trigger on Escape", async () => {
    const user = userEvent.setup();
    render(withMessages(<NotificationBell />));
    const trigger = screen.getByRole("button", { name: "Thông báo" });

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog", { name: "Thông báo" })).toHaveAttribute(
      "id",
      trigger.getAttribute("aria-controls"),
    );

    await user.tab();
    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("renders linked notifications as actions and informational rows as text", async () => {
    const user = userEvent.setup();
    render(
      withMessages(
        <NotificationBell
          items={[
            { id: "1", title: "First", href: "/awards" },
            { id: "2", title: "Second" },
          ]}
        />,
      ),
    );

    await user.click(screen.getByRole("button", { name: "Thông báo" }));
    expect(screen.getByRole("link", { name: "First" })).toHaveAttribute("href", "/awards");
    expect(screen.getByText("Second").closest("[role=menuitem]")).toBeNull();
  });

  it("keeps the Figma 24px account glyph and applies role-aware menu entries", async () => {
    const user = userEvent.setup();
    render(withMessages(<AccountMenu isAdmin displayName="Nguyễn An" />));
    const trigger = screen.getByRole("button", { name: "Tài khoản" });

    expect(trigger.querySelector("svg")).toHaveClass("size-6", "shrink-0");
    await user.click(trigger);

    expect(screen.getByText("Nguyễn An")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Trang cá nhân" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Quản trị hệ thống" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Đăng xuất" })).not.toBeInTheDocument();
  });

  it("moves focus through the account menu with arrow keys", async () => {
    const user = userEvent.setup();
    render(withMessages(<AccountMenu isAdmin />));

    await user.click(screen.getByRole("button", { name: "Tài khoản" }));
    const profile = screen.getByRole("menuitem", { name: "Trang cá nhân" });
    const admin = screen.getByRole("menuitem", { name: "Quản trị hệ thống" });
    await waitFor(() => expect(profile).toHaveFocus());
    await user.keyboard("{ArrowDown}");
    expect(admin).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(profile).toHaveFocus();
  });

  it("renders auth-only controls only for an authenticated full header", async () => {
    const guestHeader = await SiteHeader({ variant: "full" });
    const guest = render(withMessages(guestHeader));

    expect(screen.queryByRole("button", { name: "Thông báo" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tài khoản" })).not.toBeInTheDocument();
    guest.unmount();

    const authHeader = await SiteHeader({
      variant: "full",
      isAuthenticated: true,
      unreadNotificationCount: 1,
    });
    render(withMessages(authHeader));

    expect(screen.getByRole("button", { name: "Thông báo, 1 chưa đọc" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tài khoản" })).toBeInTheDocument();
  });
});
