/** Repository-owned images that may be attached to a kudos. Remote URLs are rejected server-side. */
export const KUDOS_IMAGE_OPTIONS = [
  "/images/home/award-best-manager.png",
  "/images/home/award-mvp.png",
  "/images/home/award-signature-creator.png",
  "/images/home/award-top-project-leader.png",
  "/images/home/award-top-project.png",
  "/images/home/award-top-talent.png",
] as const;

export function isAllowedKudosImage(url: string): boolean {
  return (KUDOS_IMAGE_OPTIONS as readonly string[]).includes(url);
}
