import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

import viMessages from "@/messages/vi.json";
import enMessages from "@/messages/en.json";

type Messages = typeof viMessages;

// The layout components are async Server Components; give them the same message tree the
// real provider would, resolved synchronously.
vi.mock("next-intl/server", () => ({
  getTranslations: async (namespace: keyof Messages) => {
    const messages = (globalThis as { __messages?: Messages }).__messages ?? viMessages;
    return (key: string) => (messages[namespace] as Record<string, string>)[key];
  },
}));

vi.mock("@/lib/supabase/browser-client", () => ({
  createSupabaseBrowserClient: () => ({ auth: { signInWithOAuth: vi.fn() } }),
}));

vi.mock("@/lib/i18n/actions", () => ({ setLocale: vi.fn() }));

const { SiteHeader } = await import("@/components/layout/site-header");
const { SiteFooter } = await import("@/components/layout/site-footer");
const { LoginHero } = await import("@/app/login/login-hero");

async function renderLoginScreen(messages: Messages = viMessages, locale = "vi") {
  (globalThis as { __messages?: Messages }).__messages = messages;

  const [header, hero, footer] = await Promise.all([
    SiteHeader(),
    LoginHero({ authFailed: false }),
    SiteFooter(),
  ]);

  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {header}
      {hero}
      {footer}
    </NextIntlClientProvider>,
  );
}

describe("login screen", () => {
  it("renders the brand logo in the header (test case b9805e65)", async () => {
    await renderLoginScreen();

    const logo = screen.getByAltText("Sun* Annual Awards 2025");
    expect(logo).toBeInTheDocument();
    // The design's logo is a static image, not a link.
    expect(logo.closest("a")).toBeNull();
  });

  it("renders the language selector inside the header (test case 8415b629)", async () => {
    await renderLoginScreen();

    const header = document.querySelector("header");
    expect(header).toBeTruthy();
    expect(header?.querySelector('[aria-haspopup="menu"]')).toBeTruthy();
  });

  it("renders the key visual and both intro lines (test case 42b82364)", async () => {
    await renderLoginScreen();

    expect(screen.getByAltText("ROOT FURTHER")).toBeInTheDocument();
    expect(
      screen.getByText("Bắt đầu hành trình của bạn cùng SAA 2025."),
    ).toBeInTheDocument();
    expect(screen.getByText("Đăng nhập để khám phá!")).toBeInTheDocument();
  });

  it("renders the login button (test case 6ae76d15)", async () => {
    await renderLoginScreen();

    expect(screen.getByRole("button", { name: /LOGIN With Google/ })).toBeInTheDocument();
  });

  it("renders the copyright footer", async () => {
    await renderLoginScreen();

    const footer = document.querySelector("footer");
    expect(footer).toHaveTextContent("Bản quyền thuộc về Sun* © 2025");
  });

  it("keeps the header / main / footer order from the design", async () => {
    await renderLoginScreen();

    const regions = Array.from(document.querySelectorAll("header, main, footer")).map(
      (element) => element.tagName.toLowerCase(),
    );
    expect(regions).toEqual(["header", "main", "footer"]);
  });

  it("retranslates every string when the locale changes (US003)", async () => {
    await renderLoginScreen(enMessages, "en");

    expect(screen.getByText("Start your journey with SAA 2025.")).toBeInTheDocument();
    expect(screen.getByText("Sign in to explore!")).toBeInTheDocument();
    expect(document.querySelector("footer")).toHaveTextContent("Copyright Sun* © 2025");
    // The button label is intentionally identical in both locales — it is a brand string.
    expect(screen.getByRole("button", { name: /LOGIN With Google/ })).toBeInTheDocument();
  });
});
