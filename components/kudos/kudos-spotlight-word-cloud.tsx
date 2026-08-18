"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";

import { computeWordCloudLayout } from "@/lib/kudos/word-cloud-layout";
import { formatPostTime } from "@/lib/kudos/format-post-time";
import type { KudosSpotlightNode } from "@/lib/kudos/types";

const BOARD_WIDTH = 1100;
const BOARD_HEIGHT = 480;

/**
 * `B.7_Spotlight` word cloud (node `2940:14174`) — hand-written SVG per the implementation
 * decision in clarifications.md (no charting library). Node x/y placement is computed by
 * `lib/kudos/word-cloud-layout.ts` since MoMorph's fetched styles carried no per-node coordinates
 * (see the implementer's handoff report); font size and the one highlighted name are read from
 * the real word-cloud text nodes captured in evidence/momorph-frame-styles.json.
 */
export type KudosSpotlightWordCloudProps = {
  nodes: readonly KudosSpotlightNode[];
  onSelectNode?: (nodeId: string) => void;
};

export function KudosSpotlightWordCloud({ nodes, onSelectNode }: KudosSpotlightWordCloudProps) {
  const t = useTranslations("kudosBoard.spotlight");
  const titleId = useId();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const layout = computeWordCloudLayout(nodes, { width: BOARD_WIDTH, height: BOARD_HEIGHT });
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const hovered = layout.find((placement) => placement.id === hoveredId) ?? null;
  const hoveredNode = hoveredId ? (nodesById.get(hoveredId) ?? null) : null;

  if (layout.length === 0) {
    return <p className="flex h-full w-full items-center justify-center text-base text-white/70">{t("empty")}</p>;
  }

  return (
    <div className="relative h-full w-full">
      <svg
        role="img"
        aria-labelledby={titleId}
        viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
      >
        <title id={titleId}>{t("wordCloudTitle")}</title>
        {layout.map((placement) => {
          const node = nodesById.get(placement.id);
          if (!node) return null;

          return (
            <text
              key={placement.id}
              x={placement.x}
              y={placement.y}
              fontSize={placement.fontSize}
              fontWeight={700}
              textAnchor="middle"
              tabIndex={0}
              role="button"
              aria-label={`${placement.name} — ${formatPostTime(node.lastKudosAt)}`}
              className={`cursor-pointer outline-none focus-visible:fill-white ${
                placement.highlighted ? "fill-kudos-spotlight-name" : "fill-white/80 hover:fill-white"
              }`}
              onPointerEnter={() => setHoveredId(placement.id)}
              onPointerLeave={() => setHoveredId(null)}
              onFocus={() => setHoveredId(placement.id)}
              onBlur={() => setHoveredId(null)}
              onClick={() => node.latestKudosId && onSelectNode?.(node.latestKudosId)}
              onKeyDown={(event) => {
                if ((event.key === "Enter" || event.key === " ") && node.latestKudosId) {
                  event.preventDefault();
                  onSelectNode?.(node.latestKudosId);
                }
              }}
            >
              {placement.name}
            </text>
          );
        })}
      </svg>

      {hovered && hoveredNode && (
        <div
          role="tooltip"
          style={{ left: `${(hovered.x / BOARD_WIDTH) * 100}%`, top: `${(hovered.y / BOARD_HEIGHT) * 100}%` }}
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded bg-surface-dark px-3 py-2 text-sm whitespace-nowrap text-white shadow-lg ring-1 ring-white/15"
        >
          {hovered.name} — {formatPostTime(hoveredNode.lastKudosAt)}
        </div>
      )}
    </div>
  );
}
