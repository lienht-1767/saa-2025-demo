/**
 * The six award cards of `mms_C2_Award list` (5005:14974).
 *
 * Copy is not held here — `titleKey`/`descriptionKey` resolve under the `home.awards.items`
 * next-intl namespace. What lives here is the design binding: the wordmark artwork exported
 * from each `Awards-Name` node, its intrinsic size, and the slug the `/awards` page will
 * anchor on. Swapping this array for a CMS/API source later touches no component.
 */
export type AwardCardData = {
  /** URL fragment on `/awards` the card's "Chi tiết" link points at. */
  slug: string;
  /** next-intl key under `home.awards.items`. */
  key:
    | "topTalent"
    | "topProject"
    | "topProjectLeader"
    | "bestManager"
    | "signatureCreator"
    | "mvp";
  /** Wordmark rendered over the shared award backdrop. */
  wordmark: { src: string; width: number; height: number };
  /** Figma node of the card instance, kept for traceability against the design. */
  nodeId: string;
};

/** Shared card backdrop — `MM_MEDIA_Award BG` (I2167:9075;214:1019;81:2442), 336x336. */
export const AWARD_BACKDROP = {
  src: "/images/home/award-bg.webp",
  size: 336,
} as const;

export const AWARD_CARDS: readonly AwardCardData[] = [
  {
    slug: "top-talent",
    key: "topTalent",
    wordmark: { src: "/images/home/award-top-talent.png", width: 222, height: 36 },
    nodeId: "2167:9075",
  },
  {
    slug: "top-project",
    key: "topProject",
    wordmark: { src: "/images/home/award-top-project.png", width: 232, height: 35 },
    nodeId: "2167:9076",
  },
  {
    slug: "top-project-leader",
    key: "topProjectLeader",
    wordmark: { src: "/images/home/award-top-project-leader.png", width: 232, height: 64 },
    nodeId: "2167:9077",
  },
  {
    slug: "best-manager",
    key: "bestManager",
    wordmark: { src: "/images/home/award-best-manager.png", width: 232, height: 30 },
    nodeId: "2167:9079",
  },
  {
    slug: "signature-2025-creator",
    key: "signatureCreator",
    wordmark: { src: "/images/home/award-signature-creator.png", width: 232, height: 54 },
    nodeId: "2167:9080",
  },
  {
    slug: "mvp",
    key: "mvp",
    wordmark: { src: "/images/home/award-mvp.png", width: 116, height: 52 },
    nodeId: "2167:9081",
  },
] as const;
