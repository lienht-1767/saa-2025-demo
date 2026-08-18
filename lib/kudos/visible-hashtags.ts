const MAX_VISIBLE_HASHTAGS = 5;

export type VisibleHashtags = { visible: string[]; overflowCount: number };

/** Caps a kudos post's hashtag row at 5 chips, per spec B and C ("hashtag row, max 5, overflow …"). */
export function splitVisibleHashtags(hashtags: readonly string[]): VisibleHashtags {
  return {
    visible: hashtags.slice(0, MAX_VISIBLE_HASHTAGS),
    overflowCount: Math.max(0, hashtags.length - MAX_VISIBLE_HASHTAGS),
  };
}
