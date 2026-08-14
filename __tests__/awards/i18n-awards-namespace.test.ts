import { describe, expect, it } from "vitest";

import en from "@/messages/en.json";
import vi from "@/messages/vi.json";
import { AWARD_CARDS } from "@/lib/home/awards";

/**
 * Covers only what `__tests__/i18n/messages-parity.test.ts` does NOT: that the `awards` namespace
 * carries all six `AWARD_CARDS` items in both locales, that `en` isn't a copy-pasted `vi` (edge
 * case row 11), and BR05 — Signature 2025 - Creator's two prize blocks. Key-tree equality and
 * empty-string checks are the global parity test's job (DRY) — not repeated here.
 */
const AWARD_KEYS = AWARD_CARDS.map((card) => card.key);

describe("awards i18n namespace", () => {
  it.each(AWARD_KEYS)("has the %s award item under both vi and en", (key) => {
    expect(vi.awards.items[key]).toBeDefined();
    expect(en.awards.items[key]).toBeDefined();
  });

  it.each(AWARD_KEYS)(
    "keeps the %s en description distinct from its vi source (edge case row 11 — no copy-paste)",
    (key) => {
      expect(en.awards.items[key].description).not.toBe(vi.awards.items[key].description);
    },
  );

  it("gives Signature 2025 - Creator two prize blocks in both languages (BR05)", () => {
    for (const messages of [vi, en]) {
      const prize = messages.awards.items.signatureCreator.prize;
      expect(prize.primary.amount).toBeTruthy();
      expect(prize.secondary?.amount).toBeTruthy();
    }
  });
});
