/**
 * Produces a comparison key for Vietnamese names. Besides stripping combining
 * marks, `đ` needs an explicit replacement because Unicode does not decompose it.
 */
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLocaleLowerCase("vi")
    .replace(/\s+/g, " ")
    .trim();
}
