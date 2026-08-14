import Image from "next/image";

import { AWARD_BACKDROP, type AwardCardData } from "@/lib/home/awards";

/**
 * The 336x336 `MM_MEDIA_Award BG` backdrop + wordmark (`Picture-Award`, component 81:2443),
 * without the "Chi tiết" link that `components/home/award-card.tsx` adds for the homepage grid.
 * Kept as its own component rather than reusing that one because every `/awards` row needs the
 * artwork with no CTA — the two call sites' JSX would otherwise diverge on exactly that link.
 */
export type AwardArtworkProps = {
  wordmark: AwardCardData["wordmark"];
};

export function AwardArtwork({ wordmark }: AwardArtworkProps) {
  return (
    /* mm:81:2443 */
    <div className="relative flex aspect-square w-full max-w-[336px] shrink-0 items-center justify-center overflow-hidden rounded-2xl mix-blend-screen shadow-[0_4px_4px_0_rgba(0,0,0,0.25),0_0_6px_0_#FAE287] ring-1 ring-brand-yellow/60">
      <Image
        src={AWARD_BACKDROP.src}
        alt=""
        aria-hidden
        width={AWARD_BACKDROP.size}
        height={AWARD_BACKDROP.size}
        className="absolute inset-0 size-full object-cover"
      />
      <Image
        src={wordmark.src}
        alt=""
        aria-hidden
        width={wordmark.width}
        height={wordmark.height}
        style={{ width: `${(wordmark.width / AWARD_BACKDROP.size) * 100}%` }}
        className="relative h-auto"
      />
    </div>
  );
}
