import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/server", () => ({ connection: vi.fn().mockResolvedValue(undefined) }));

const { default: HomePage } = await import("@/app/page");
const { SiteHeader } = await import("@/components/layout/site-header");

function findElement(node: ReactNode, type: ReactElement["type"]): ReactElement | undefined {
  for (const child of Children.toArray(node)) {
    if (!isValidElement(child)) continue;
    if (child.type === type) return child;

    const nested = findElement((child.props as { children?: ReactNode }).children, type);
    if (nested) return nested;
  }
}

describe("homepage header wiring", () => {
  it("renders the Figma notification and account controls while session data is pending", async () => {
    const page = await HomePage();
    const header = findElement(page, SiteHeader);

    expect(header).toBeDefined();
    expect(header?.props).toMatchObject({
      variant: "full",
      isAuthenticated: true,
      unreadNotificationCount: 1,
    });
  });
});
