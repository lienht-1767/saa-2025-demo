import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";

import { KudosHashtagRow } from "@/components/kudos/kudos-hashtag-row";
import viMessages from "@/messages/vi.json";

function renderRow(hashtags: string[], onSelectHashtag?: (hashtag: string) => void) {
  return render(
    <NextIntlClientProvider locale="vi" messages={viMessages}>
      <KudosHashtagRow hashtags={hashtags} onSelectHashtag={onSelectHashtag} />
    </NextIntlClientProvider>,
  );
}

describe("KudosHashtagRow", () => {
  it("renders every tag when there are 5 or fewer", () => {
    renderRow(["#Dedicated", "#Inspring"]);

    expect(screen.getByText("#Dedicated")).toBeInTheDocument();
    expect(screen.getByText("#Inspring")).toBeInTheDocument();
    expect(screen.queryByText("…")).not.toBeInTheDocument();
  });

  it("caps at 5 tags and shows an overflow marker for the rest", () => {
    renderRow(["#a", "#b", "#c", "#d", "#e", "#f", "#g"]);

    expect(screen.getAllByRole("button")).toHaveLength(5);
    expect(screen.getByText("…")).toBeInTheDocument();
  });

  it("renders nothing for an empty hashtag list", () => {
    const { container } = renderRow([]);
    expect(container).toBeEmptyDOMElement();
  });

  it("calls onSelectHashtag with the clicked tag", async () => {
    const user = userEvent.setup();
    const onSelectHashtag = vi.fn();
    renderRow(["#Dedicated"], onSelectHashtag);

    await user.click(screen.getByText("#Dedicated"));

    expect(onSelectHashtag).toHaveBeenCalledWith("#Dedicated");
  });
});
