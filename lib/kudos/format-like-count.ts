/** vi-VN groups thousands with a dot ("1.000"), matching the design's highlight-card heart count. */
const FORMATTER = new Intl.NumberFormat("vi-VN");

export function formatLikeCount(count: number): string {
  if (count < 0) throw new RangeError("formatLikeCount: count must not be negative");
  return FORMATTER.format(count);
}
