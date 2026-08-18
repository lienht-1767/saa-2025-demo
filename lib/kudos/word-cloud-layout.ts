import type { KudosSpotlightNode } from "@/lib/kudos/types";

export type WordCloudPlacement = {
  id: string;
  name: string;
  x: number;
  y: number;
  fontSize: number;
  highlighted: boolean;
};

type Box = { left: number; right: number; top: number; bottom: number };

const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 40;
const EDGE_MARGIN_RATIO = 0.08;

/** Golden angle. Successive indices land far apart in angle, so points never form spokes. */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** Rough advance width per character relative to font size, for Be Vietnam Pro at weight 700. */
const CHAR_WIDTH_RATIO = 0.56;
/** Breathing room around each name so neighbours never touch. */
const GAP = 8;

/** How far the spiral is walked looking for a free spot before a name is dropped. */
const MAX_PROBES = 900;
const PROBE_STEP = 0.11;

/**
 * The recent-kudos ticker is absolutely positioned at the board's bottom-left, outside this SVG
 * and unaware of it. Names placed there render on top of it and both become unreadable, so the
 * region is reserved. Ratios of the viewBox, deliberately generous — the ticker grows with its
 * item count.
 */
const TICKER_ZONE = { widthRatio: 0.52, heightRatio: 0.34 };

function boxFor(x: number, y: number, name: string, fontSize: number): Box {
  const halfWidth = (name.length * fontSize * CHAR_WIDTH_RATIO) / 2;
  return {
    left: x - halfWidth - GAP / 2,
    right: x + halfWidth + GAP / 2,
    // SVG text is baseline-anchored: most of the glyph sits above y.
    top: y - fontSize * 0.82 - GAP / 2,
    bottom: y + fontSize * 0.24 + GAP / 2,
  };
}

function overlaps(a: Box, b: Box): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

/**
 * Scatters recipient names across the SPOTLIGHT BOARD (spec B.7.*) with font size scaling by
 * kudos count. MoMorph's exact per-node coordinates were not available when this was built (see
 * the implementer's handoff report), so positions are an inferred layout — not read off the
 * design — but deterministic: the same node list always renders identically, so SSR and CSR agree
 * and nothing jitters on re-render.
 *
 * Two defects this replaces, both of which shipped looking fine in tests:
 *
 * 1. The original derived both axes from one 32-bit djb2 hash (`hash % N` for x,
 *    `floor(hash / N) % N` for y). Those are not independent — sequential seeded UUIDs hash to
 *    nearby values, so `floor(hash / N)` was identical for every node and all 15 real names landed
 *    within 4px, stacked in one pile.
 * 2. Spreading them out was not enough: distinct coordinates still collide once the glyphs are
 *    drawn, and the largest name overlapped its neighbour while two more sat on top of the ticker.
 *
 * So placement now walks a phyllotaxis spiral and keeps walking until the name's measured box
 * clears every name already placed and the reserved ticker corner. Biggest names go first, which
 * puts them near the centre as the design shows and leaves the long tail to fill the gaps.
 * A name that finds no free spot within `MAX_PROBES` is dropped rather than drawn on top of
 * another — an absent name is recoverable by zooming; an unreadable pile is not.
 */
export function computeWordCloudLayout(
  nodes: readonly KudosSpotlightNode[],
  bounds: { width: number; height: number },
): WordCloudPlacement[] {
  if (nodes.length === 0) return [];

  const maxCount = Math.max(...nodes.map((node) => node.kudosCount), 1);
  const marginX = bounds.width * EDGE_MARGIN_RATIO;
  const marginY = bounds.height * EDGE_MARGIN_RATIO;
  const centreX = bounds.width / 2;
  const centreY = bounds.height / 2;
  const radiusX = Math.max(centreX - marginX, 0);
  const radiusY = Math.max(centreY - marginY, 0);

  const tickerZone: Box = {
    left: 0,
    right: bounds.width * TICKER_ZONE.widthRatio,
    top: bounds.height * (1 - TICKER_ZONE.heightRatio),
    bottom: bounds.height,
  };

  // Biggest names first so they take the innermost, calmest positions.
  const ordered = [...nodes].sort((a, b) => b.kudosCount - a.kudosCount);
  const placed: Box[] = [];
  const placements: WordCloudPlacement[] = [];

  ordered.forEach((node, index) => {
    const weight = node.kudosCount / maxCount;
    const fontSize = Math.round(MIN_FONT_SIZE + weight * (MAX_FONT_SIZE - MIN_FONT_SIZE));
    const halfWidth = (node.name.length * fontSize * CHAR_WIDTH_RATIO) / 2;

    for (let probe = 0; probe < MAX_PROBES; probe += 1) {
      // Start each name at its own rank on the spiral, then keep walking outward from there.
      const step = index + probe * PROBE_STEP;
      const radiusFraction = Math.min(Math.sqrt(step / Math.max(ordered.length, 1)), 1);
      const angle = step * GOLDEN_ANGLE;

      const rawX = centreX + Math.cos(angle) * radiusFraction * radiusX;
      const rawY = centreY + Math.sin(angle) * radiusFraction * radiusY;

      // Keep the whole glyph run inside the board, not just its anchor point.
      const x = Math.round(
        Math.min(Math.max(rawX, Math.min(marginX + halfWidth, centreX)), Math.max(bounds.width - marginX - halfWidth, centreX)),
      );
      const y = Math.round(Math.min(Math.max(rawY, marginY + fontSize), bounds.height - marginY));

      const box = boxFor(x, y, node.name, fontSize);
      if (overlaps(box, tickerZone)) continue;
      if (placed.some((other) => overlaps(box, other))) continue;

      placed.push(box);
      placements.push({ id: node.id, name: node.name, x, y, fontSize, highlighted: node.highlighted ?? false });
      return;
    }
  });

  return placements;
}
