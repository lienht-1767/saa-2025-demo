import type { ComponentProps } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";

import { KudosActionRow } from "@/components/kudos/kudos-action-row";
import viMessages from "@/messages/vi.json";

function renderRow(overrides: Partial<ComponentProps<typeof KudosActionRow>> = {}) {
  return render(
    <NextIntlClientProvider locale="vi" messages={viMessages}>
      <KudosActionRow
        postId="kudos-1"
        likeCount={1000}
        likedByViewer={false}
        shareUrl="https://example.com/kudos/1"
        variant="feed"
        {...overrides}
      />
    </NextIntlClientProvider>,
  );
}

describe("KudosActionRow", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("formats the like count with a thousands dot, matching the design's '1.000'", () => {
    renderRow();
    expect(screen.getByText("1.000")).toBeInTheDocument();
  });

  it("only shows 'Xem chi tiết' on the highlight variant, not the feed variant", () => {
    const { rerender } = renderRow({ variant: "feed" });
    expect(screen.queryByRole("button", { name: "Xem chi tiết" })).not.toBeInTheDocument();

    rerender(
      <NextIntlClientProvider locale="vi" messages={viMessages}>
        <KudosActionRow
          postId="kudos-1"
          likeCount={10}
          likedByViewer={false}
          shareUrl="https://example.com/kudos/1"
          variant="highlight"
        />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("button", { name: "Xem chi tiết" })).toBeInTheDocument();
  });

  it("copies the share URL and shows the confirmation toast on click", async () => {
    // `userEvent.setup()` installs its own clipboard stub onto `navigator.clipboard` — spying
    // must happen after that call, or `setup()` overwrites whatever was mocked before it.
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    renderRow();

    await user.click(screen.getByRole("button", { name: "Sao chép liên kết" }));

    expect(writeText).toHaveBeenCalledWith("https://example.com/kudos/1");
    expect(await screen.findByText("Đã sao chép liên kết!")).toBeInTheDocument();
  });

  it("calls onToggleLike with the flipped state", async () => {
    const onToggleLike = vi.fn();
    const user = userEvent.setup();
    renderRow({ likedByViewer: false, onToggleLike });

    await user.click(screen.getByRole("button", { name: "Thích hoặc bỏ thích lời cảm ơn này" }));

    expect(onToggleLike).toHaveBeenCalledWith("kudos-1", true);
  });
});
