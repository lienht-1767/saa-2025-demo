import { formatTimeOfDay } from "@/lib/kudos/format-time-of-day";
import type { KudosSpotlightTickerItem } from "@/lib/kudos/types";

/**
 * Recent-kudos ticker at the bottom-left of the Spotlight board — evidenced from the repeating
 * "{time} {name} đã nhận được một Kudos mới" lines in evidence/momorph-screen-MaZUn5xHXZ.png
 * (this phrasing wasn't in the specs/test-case CSVs, only visible in the render). The muted-white-
 * on-dark styling is this repo's own choice, matching the rest of the board.
 */
export type KudosSpotlightTickerProps = { items: readonly KudosSpotlightTickerItem[] };

export function KudosSpotlightTicker({ items }: KudosSpotlightTickerProps) {
  if (items.length === 0) return null;

  return (
    <ul className="flex max-w-[calc(100vw-7rem)] flex-col text-xs leading-4 font-bold text-white/70 sm:max-w-[570px] sm:text-sm sm:leading-5">
      {items.slice(0, 5).map((item) => (
        <li key={item.id} className="truncate">
          {formatTimeOfDay(item.at)} {item.text}
        </li>
      ))}
    </ul>
  );
}
