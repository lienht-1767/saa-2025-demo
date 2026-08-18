"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { IconPanZoom, IconSearch } from "@/components/kudos/kudos-icons";
import { KudosSpotlightTicker } from "@/components/kudos/kudos-spotlight-ticker";
import { KudosSpotlightWordCloud } from "@/components/kudos/kudos-spotlight-word-cloud";
import { useSpotlightPanZoom } from "@/lib/kudos/use-spotlight-pan-zoom";
import { normalizeSearchText } from "@/lib/kudos/normalize-search-text";
import type { KudosSpotlightData } from "@/lib/kudos/types";

/**
 * `B.7_Spotlight` (node `2940:14174`): 1157px-wide dark board, 1px `accent-border`, ~47px radius.
 * The design paints a photographic key-visual behind the word cloud (nodes `2940:14178`/`14181`).
 * MoMorph did not export that crop as a standalone asset, so this reuses the nearest existing
 * SAA key visual under the same dark overlay.
 */
export type KudosSpotlightBoardProps = {
  data: KudosSpotlightData;
  onSelectNode?: (nodeId: string) => void;
};

export function KudosSpotlightBoard({ data, onSelectNode }: KudosSpotlightBoardProps) {
  const t = useTranslations("kudosBoard.spotlight");
  const [query, setQuery] = useState("");
  const { scale, translate, zoomIn, reset, handlePointerDown, handlePointerMove, handlePointerUp } =
    useSpotlightPanZoom();

  const filteredNodes = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return data.nodes;
    return data.nodes.filter((node) => normalizeSearchText(node.name).includes(normalizedQuery));
  }, [data.nodes, query]);

  return (
    /* mm:2940:14174 */
    <div
      style={{ backgroundImage: "linear-gradient(rgba(3,16,22,.78), rgba(3,16,22,.9)), url('/images/home/keyvisual-bg.webp')" }}
      className="relative min-h-[420px] w-full max-w-[1157px] overflow-hidden rounded-[32px] border border-accent-border bg-cover bg-center sm:aspect-[1157/548] sm:min-h-0 sm:rounded-[47px]"
    >
      <p className="absolute top-4 right-5 z-20 text-2xl leading-9 font-bold text-white sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:text-[36px] sm:leading-[44px]">
        {t("totalKudos", { count: data.totalKudos })}
      </p>

      <label htmlFor="kudos-spotlight-search" className="sr-only">
        {t("searchLabel")}
      </label>
      <div className="absolute top-5 left-5 z-20 flex h-10 w-[min(48%,219px)] items-center gap-2 rounded-full border border-accent-border bg-[#071218]/80 px-3 text-sm text-white sm:top-[25px] sm:left-6 sm:w-[219px]">
        <IconSearch className="size-5 shrink-0" />
        <input
          id="kudos-spotlight-search"
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            reset();
          }}
          placeholder={t("searchPlaceholder")}
          maxLength={100}
          className="min-w-0 flex-1 bg-transparent placeholder:text-white/70 focus:outline-none"
        />
      </div>

      <div
        role="application"
        aria-label={t("panZoomLabel")}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="absolute inset-0 z-10 h-full w-full touch-none overflow-hidden"
      >
        <div
          style={{ transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})` }}
          className="h-full w-full origin-center transition-transform duration-100 motion-reduce:transition-none"
        >
          <KudosSpotlightWordCloud nodes={filteredNodes} onSelectNode={onSelectNode} />
        </div>
      </div>

      <div className="absolute bottom-5 left-6 z-20 sm:left-12">
        <KudosSpotlightTicker items={data.ticker} />
      </div>

      <button
        type="button"
        onClick={() => (scale === 1 ? zoomIn() : reset())}
        aria-label={scale === 1 ? t("zoomIn") : t("resetView")}
        className="absolute right-6 bottom-5 z-20 flex size-10 items-center justify-center rounded-full text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
      >
        <IconPanZoom className="size-6" />
      </button>
    </div>
  );
}
