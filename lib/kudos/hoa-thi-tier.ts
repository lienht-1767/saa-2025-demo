export type HoaThiTier = 0 | 1 | 2 | 3;
export type HoaThiTitle = "New Hero" | "Rising Hero" | "Super Hero" | "Legend Hero";
export type HoaThiRank = { tier: HoaThiTier; title: HoaThiTitle };

/**
 * Hoa thị (star) tier and title badge a Sunner's kudos card shows next to their name, both
 * derived from one lifetime kudos count so the two can never drift apart:
 *
 * | kudos received | tier (stars) | title       |
 * |-----------------|--------------|-------------|
 * | < 10            | 0            | New Hero    |
 * | 10–19           | 1            | Rising Hero |
 * | 20–49           | 2            | Super Hero  |
 * | ≥ 50            | 3            | Legend Hero |
 *
 * All four titles and the 10/20/50 thresholds are confirmed (grep hits for each title string in
 * `evidence/momorph-node-tree.json` and `evidence/momorph-frame-styles.json`) — this replaces the
 * earlier opaque-passthrough `titleBadge` field, which existed only because the count→title
 * mapping was still undecided (see clarifications.md, formerly Unresolved #4).
 */
export function computeHoaThiTier(kudosCount: number): HoaThiRank {
  if (kudosCount < 0) throw new RangeError("computeHoaThiTier: kudosCount must not be negative");

  if (kudosCount >= 50) return { tier: 3, title: "Legend Hero" };
  if (kudosCount >= 20) return { tier: 2, title: "Super Hero" };
  if (kudosCount >= 10) return { tier: 1, title: "Rising Hero" };
  return { tier: 0, title: "New Hero" };
}
