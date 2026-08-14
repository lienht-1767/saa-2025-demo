import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { AWARD_CARDS } from "@/lib/home/awards";
import type { AwardRowProps } from "@/components/awards/award-row";

/**
 * `AwardsList` (see `collectIds` below) is invoked directly outside of Next's RSC renderer to
 * reach the six section anchors, and `next-intl/server`'s real `getTranslations` refuses to run
 * outside that renderer ("not supported in Client Components"). This test only needs the DOM
 * shape, not translated copy — content-level coverage is `i18n-awards-namespace.test.ts`'s job —
 * so `t()` is stubbed to the identity of its key, at the module boundary next-intl exposes.
 */
vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
}));

const headerSession = {
  isAuthenticated: true,
  isAdmin: true,
  displayName: "Admin Sunner",
  unreadNotificationCount: 2,
  notifications: [],
};

vi.mock("@/lib/layout/header-session", () => ({
  getHeaderSession: async () => headerSession,
}));

const { default: AwardsPage } = await import("@/app/awards/page");
const { SiteHeader } = await import("@/components/layout/site-header");
const { KudosSection } = await import("@/components/home/kudos-section");
const { AwardsList } = await import("@/components/awards/awards-list");
const { AwardRow } = await import("@/components/awards/award-row");

/**
 * Phase 04 — cross-track integration for `/awards`. This file proves the rendered tree honors
 * the phase 01 "Hợp đồng tích hợp": `SiteHeader` wired `full`/`/awards`, exactly the six
 * `AWARD_CARDS` slugs anchored in BR02 order with no duplicates, and `KudosSection` reused as-is.
 * It asserts behavior/contract only — no Tailwind classes, no copy strings.
 */

function findElement(node: ReactNode, type: ReactElement["type"]): ReactElement | undefined {
  for (const child of Children.toArray(node)) {
    if (!isValidElement(child)) continue;
    if (child.type === type) return child;

    const nested = findElement((child.props as { children?: ReactNode }).children, type);
    if (nested) return nested;
  }
}

/**
 * `AwardsList` and `AwardRow` are Server Components whose own JSX only exists once invoked —
 * `Children.toArray` can't see past an un-rendered element. Both are hook-free, so this calls
 * them directly wherever the walk meets them (mirroring what the real request does) to reach the
 * `<section id={slug}>` anchors. `AwardsNav` ("use client", uses hooks) is deliberately never
 * invoked here — the walk just stops at it, which is fine since it carries no `id` we need.
 * Only `<section>` ids are collected — `AwardRow` also sets a sibling `${slug}-heading` id on
 * its `<h2>` for `aria-labelledby`, which is not one of the six anchors under test.
 */
async function collectIds(node: ReactNode): Promise<string[]> {
  const ids: string[] = [];

  for (const child of Children.toArray(node)) {
    if (!isValidElement(child)) continue;

    const props = child.props as { id?: unknown; children?: ReactNode };
    if (child.type === "section" && typeof props.id === "string") ids.push(props.id);

    let rendered: ReactNode = props.children;
    if (child.type === AwardsList) rendered = await AwardsList();
    else if (child.type === AwardRow) rendered = AwardRow(child.props as AwardRowProps);

    ids.push(...(await collectIds(rendered)));
  }

  return ids;
}

describe("/awards page contract", () => {
  it("renders SiteHeader with the full variant pinned to /awards (FR-US004-3)", async () => {
    const page = await AwardsPage();
    const header = findElement(page, SiteHeader);

    expect(header).toBeDefined();
    expect(header?.props).toMatchObject({
      variant: "full",
      activeHref: "/awards",
      ...headerSession,
    });
  });

  it("provides the footer's general-standards hash destination", async () => {
    const page = await AwardsPage();
    const anchor = findElementWithId(page, "tieu-chuan-chung");

    expect(anchor).toBeDefined();
  });

  it("anchors all six AWARD_CARDS slugs in BR02 order with no duplicates", async () => {
    const page = await AwardsPage();
    const ids = await collectIds(page);

    expect(ids).toEqual(AWARD_CARDS.map((card) => card.slug));
    expect(new Set(ids).size).toBe(6);
  });

  it("renders KudosSection reused as-is (FR-US003-3)", async () => {
    const page = await AwardsPage();
    const kudos = findElement(page, KudosSection);

    expect(kudos).toBeDefined();
  });
});

function findElementWithId(node: ReactNode, id: string): ReactElement | undefined {
  for (const child of Children.toArray(node)) {
    if (!isValidElement(child)) continue;
    const props = child.props as { id?: string; children?: ReactNode };
    if (props.id === id) return child;
    const nested = findElementWithId(props.children, id);
    if (nested) return nested;
  }
}
