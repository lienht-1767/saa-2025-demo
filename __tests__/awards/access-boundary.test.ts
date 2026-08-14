import { describe, expect, it } from "vitest";

import { AWARDS_ROUTE, isPublicRoute } from "@/lib/auth/routes";
import { AWARD_CARDS } from "@/lib/home/awards";

/**
 * The cross-page consequence of BR01, stated out loud.
 *
 * `/` is public and its six award cards deep-link to `/awards#<slug>`, while `/awards` requires
 * a session. A guest clicking any of those cards therefore lands on `/login`. That is the
 * intended boundary (TC ID-1), NOT a broken link — read `clarifications.md` before "fixing" it
 * by putting `/awards` back on the whitelist.
 *
 * The slug order is asserted here too because it is the contract the page's anchors are built
 * from (BR02); `__tests__/awards/page-contract.test.tsx` checks the rendered side of it.
 */

/** BR02 — the six categories, in the order the design lists them. */
const EXPECTED_SLUGS = [
  "top-talent",
  "top-project",
  "top-project-leader",
  "best-manager",
  "signature-2025-creator",
  "mvp",
] as const;

describe("award page access boundary", () => {
  it("keeps AWARDS_ROUTE exported even though it left the whitelist", () => {
    expect(AWARDS_ROUTE).toBe("/awards");
    expect(isPublicRoute(AWARDS_ROUTE)).toBe(false);
  });

  it("lists exactly the six award slugs, in BR02 order, with no duplicates", () => {
    expect(AWARD_CARDS.map((card) => card.slug)).toEqual([...EXPECTED_SLUGS]);
    expect(new Set(AWARD_CARDS.map((card) => card.slug)).size).toBe(AWARD_CARDS.length);
  });

  // The hash never reaches the server, so every deep-linked card resolves to the same guarded
  // pathname — one guest redirect for all six, not six special cases.
  it.each(EXPECTED_SLUGS)(
    "sends a guest following /awards#%s to the login route",
    (slug) => {
      const { pathname, hash } = new URL(`${AWARDS_ROUTE}#${slug}`, "http://localhost:3000");

      expect(hash).toBe(`#${slug}`);
      expect(isPublicRoute(pathname)).toBe(false);
    },
  );
});
