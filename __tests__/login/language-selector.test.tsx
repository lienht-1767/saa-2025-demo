import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";

import viMessages from "@/messages/vi.json";

const setLocale = vi.fn();

vi.mock("@/lib/i18n/actions", () => ({
  setLocale: (locale: string) => setLocale(locale),
}));

const { LanguageSelector } = await import("@/components/i18n/language-selector");

function renderSelector(locale = "vi") {
  return render(
    <NextIntlClientProvider locale={locale} messages={viMessages}>
      <LanguageSelector />
    </NextIntlClientProvider>,
  );
}

describe("LanguageSelector", () => {
  beforeEach(() => {
    setLocale.mockReset();
    setLocale.mockResolvedValue(undefined);
  });

  it("shows VN by default with the flag and chevron (test cases 5f1cbabd, 98e20775)", () => {
    renderSelector();

    expect(screen.getByRole("button", { name: /Ngôn ngữ/ })).toHaveTextContent("VN");
    expect(document.querySelector('img[src*="flag-vn.svg"]')).toBeTruthy();
    expect(document.querySelector('img[src*="chevron-down.svg"]')).toBeTruthy();
  });

  it("opens the dropdown on click (test cases 4426635b, 20d87e28)", async () => {
    renderSelector();

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Ngôn ngữ/ }));

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: /Tiếng Việt/ })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: /English/ })).toBeInTheDocument();
  });

  it("marks the active locale as checked", async () => {
    renderSelector("vi");

    await userEvent.click(screen.getByRole("button", { name: /Ngôn ngữ/ }));

    expect(screen.getByRole("menuitemradio", { name: /Tiếng Việt/ })).toBeChecked();
    expect(screen.getByRole("menuitemradio", { name: /English/ })).not.toBeChecked();
  });

  it("persists the choice when another locale is selected", async () => {
    renderSelector("vi");

    await userEvent.click(screen.getByRole("button", { name: /Ngôn ngữ/ }));
    await userEvent.click(screen.getByRole("menuitemradio", { name: /English/ }));

    await waitFor(() => {
      expect(setLocale).toHaveBeenCalledWith("en");
    });
  });

  it("does not re-write the cookie when the active locale is picked again", async () => {
    renderSelector("vi");

    await userEvent.click(screen.getByRole("button", { name: /Ngôn ngữ/ }));
    await userEvent.click(screen.getByRole("menuitemradio", { name: /Tiếng Việt/ }));

    expect(setLocale).not.toHaveBeenCalled();
  });

  it("closes on Escape", async () => {
    renderSelector();

    await userEvent.click(screen.getByRole("button", { name: /Ngôn ngữ/ }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  it("closes on an outside click", async () => {
    render(
      <NextIntlClientProvider locale="vi" messages={viMessages}>
        <div>
          <LanguageSelector />
          <button type="button">outside</button>
        </div>
      </NextIntlClientProvider>,
    );

    await userEvent.click(screen.getByRole("button", { name: /Ngôn ngữ/ }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "outside" }));

    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  it("reports its expanded state to assistive tech", async () => {
    renderSelector();

    const trigger = screen.getByRole("button", { name: /Ngôn ngữ/ });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
});
