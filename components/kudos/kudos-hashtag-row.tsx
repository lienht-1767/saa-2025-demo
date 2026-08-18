"use client";

import { useTranslations } from "next-intl";

import { splitVisibleHashtags } from "@/lib/kudos/visible-hashtags";

/**
 * `B.4.3_Hashtag` / `C.3.7_Hash tag` (node `335:9458` / `256:5158`) — a single-line hashtag row,
 * capped at 5 tags with an overflow "…", rendered in the design's own red
 * (`rgba(212, 39, 29, 1)` — the same hex as the existing `--badge-danger` token, reused rather
 * than duplicated). Clicking a tag re-filters the board (spec B.4.3/D.4), which needs a backend
 * refetch, so it stays an optional no-op callback.
 */
export type KudosHashtagRowProps = {
  hashtags: readonly string[];
  onSelectHashtag?: (hashtag: string) => void;
};

export function KudosHashtagRow({ hashtags, onSelectHashtag }: KudosHashtagRowProps) {
  const t = useTranslations("kudosBoard.common");
  const { visible, overflowCount } = splitVisibleHashtags(hashtags);

  if (visible.length === 0) return null;

  return (
    /* mm:335:9458 */
    <div className="flex w-full items-center gap-2 overflow-hidden text-base leading-6 font-bold tracking-[0.5px] text-badge-danger">
      {visible.map((hashtag) => (
        <button
          key={hashtag}
          type="button"
          onClick={() => onSelectHashtag?.(hashtag)}
          className="shrink-0 rounded hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
        >
          {hashtag}
        </button>
      ))}
      {overflowCount > 0 && (
        <span aria-label={t("hashtagOverflow", { count: overflowCount })} className="shrink-0">
          …
        </span>
      )}
    </div>
  );
}
