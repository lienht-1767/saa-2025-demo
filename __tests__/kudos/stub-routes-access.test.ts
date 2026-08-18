import { describe, expect, it } from "vitest";

import { isPublicRoute } from "@/lib/auth/routes";
import { isUuid } from "@/lib/kudos/uuid";

describe("Kudos deep-route access contracts", () => {
  it("keeps kudos detail public at the proxy layer so the page-level session gate is required", () => {
    expect(isPublicRoute("/kudos/40000000-0000-0000-0000-000000000001")).toBe(true);
  });
  it("keeps profile detail protected and rejects malformed ids before querying", () => {
    expect(isPublicRoute("/profile/30000000-0000-0000-0000-000000000001")).toBe(false);
    expect(isUuid("not-a-uuid")).toBe(false);
  });
});
