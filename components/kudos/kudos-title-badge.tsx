import type { HoaThiTitle } from "@/lib/kudos/hoa-thi-tier";

/**
 * The small pill next to a Sunner's department, e.g. "Rising Hero" — node
 * `I2940:13465;335:9443;3106:17694`: 0.5px gold border, 48px radius, ~19px tall. The design fills
 * it with a background image MoMorph could not export as a usable asset, so this renders a flat
 * translucent dark fill instead (documented inference, same reasoning as `.awards-artwork` in
 * `app/globals.css`).
 *
 * `label` is always one of the four confirmed titles from `computeHoaThiTier` — every Sunner has
 * a tier now (down to "New Hero" at 0 stars), so there's no "no badge" case to render around.
 */
export type KudosTitleBadgeProps = { label: HoaThiTitle };

export function KudosTitleBadge({ label }: KudosTitleBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full border-[0.5px] border-brand-yellow bg-black/40 px-2 py-0.5 text-[11px] leading-4 font-bold text-white [text-shadow:0_0.4px_1.5px_#000]">
      {label}
    </span>
  );
}
