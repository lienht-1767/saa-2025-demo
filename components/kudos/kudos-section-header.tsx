import type { ReactNode } from "react";

/**
 * Shared section header for HIGHLIGHT KUDOS / SPOTLIGHT BOARD / ALL KUDOS (nodes `2940:13452`,
 * `2940:13476`, `2940:14221`): a "Sun* Annual Awards 2025" caption over a 1px divider, then the
 * section title. Same type scale as `components/awards/awards-title-block.tsx`, but left-aligned
 * here (the Figma frames use `align-items: flex-start`) instead of centred.
 */
export type KudosSectionHeaderProps = {
  caption: string;
  title: string;
  /** Slot for filters/controls that sit on the same row as the title (e.g. the two dropdowns). */
  trailing?: ReactNode;
};

export function KudosSectionHeader({ caption, title, trailing }: KudosSectionHeaderProps) {
  return (
    <div className="flex w-full flex-col items-start gap-4">
      <p className="text-2xl leading-8 font-bold text-white">{caption}</p>
      <hr className="h-px w-full border-0 bg-divider" />
      <div className="flex w-full flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-3xl leading-tight font-bold tracking-[-0.25px] text-brand-yellow sm:text-4xl lg:text-[57px] lg:leading-16">
          {title}
        </h2>
        {trailing}
      </div>
    </div>
  );
}
