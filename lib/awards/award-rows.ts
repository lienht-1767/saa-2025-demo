import { AWARD_CARDS, type AwardCardData } from "@/lib/home/awards";

/**
 * Per-row layout + design bindings for `D.Danh sách giải thưởng` (313:8466) on the `/awards`
 * screen (zFYDgyj_pD). Copy lives in the `awards` next-intl namespace — this file only carries
 * what next-intl can't: which side the 336x336 artwork renders on, the description's text
 * alignment (D.5 breaks from the rest), which rows carry an optional prize note or a second
 * prize block, and the Figma node of each row for traceability.
 *
 * Reuses `AWARD_CARDS` for `slug`/`wordmark`/`key` so the six anchors never drift from the
 * homepage award cards that deep-link here via `/awards#<slug>`.
 *
 * The message catalogue models `prize` as `{ primary, secondary? }` objects rather than an
 * array — `__tests__/i18n/messages-parity.test.ts`'s key-tree comparison only handles plain
 * nested objects, not arrays, and this project's messages files are outside this task's file
 * ownership. `hasPrimaryNote`/`hasSecondaryPrize` tell `AwardsList` which of those keys actually
 * exist for a given row, so it never asks next-intl for a message that isn't there.
 */
export type AwardRowLayout = "artwork-left" | "artwork-right";

export type AwardRowData = AwardCardData & {
  /** Figma node of the row instance/frame (D.1..D.6), kept for traceability against the design. */
  rowNodeId: string;
  layout: AwardRowLayout;
  /** D.5 (Signature 2025 - Creator) is set left-aligned in the design; the other five are justified. */
  descriptionAlign: "justify" | "left";
  /** D.4 (Best Manager) and D.6 (MVP) have no note under their prize amount. */
  hasPrimaryNote: boolean;
  /** Only D.5 (Signature 2025 - Creator) has a second prize block, split by "Hoặc". */
  hasSecondaryPrize: boolean;
};

type RowMeta = Pick<
  AwardRowData,
  "rowNodeId" | "layout" | "descriptionAlign" | "hasPrimaryNote" | "hasSecondaryPrize"
>;

const ROW_META: Record<AwardCardData["key"], RowMeta> = {
  topTalent: {
    rowNodeId: "313:8467",
    layout: "artwork-left",
    descriptionAlign: "justify",
    hasPrimaryNote: true,
    hasSecondaryPrize: false,
  },
  topProject: {
    rowNodeId: "313:8468",
    layout: "artwork-right",
    descriptionAlign: "justify",
    hasPrimaryNote: true,
    hasSecondaryPrize: false,
  },
  topProjectLeader: {
    rowNodeId: "313:8469",
    layout: "artwork-left",
    descriptionAlign: "justify",
    hasPrimaryNote: true,
    hasSecondaryPrize: false,
  },
  bestManager: {
    rowNodeId: "313:8470",
    layout: "artwork-right",
    descriptionAlign: "justify",
    hasPrimaryNote: false,
    hasSecondaryPrize: false,
  },
  signatureCreator: {
    rowNodeId: "313:8471",
    layout: "artwork-left",
    descriptionAlign: "left",
    hasPrimaryNote: true,
    hasSecondaryPrize: true,
  },
  mvp: {
    rowNodeId: "313:8510",
    layout: "artwork-right",
    descriptionAlign: "justify",
    hasPrimaryNote: false,
    hasSecondaryPrize: false,
  },
};

export const AWARD_ROWS: readonly AwardRowData[] = AWARD_CARDS.map((card) => ({
  ...card,
  ...ROW_META[card.key],
}));

/** One prize amount + its optional note, as resolved out of `awards.items.<key>.prize`. */
export type AwardPrizeEntry = { amount: string; note?: string };
