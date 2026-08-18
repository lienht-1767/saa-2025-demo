/**
 * The kudos board's hashtag/department filters (BR-005: combined with AND). Pure — no Supabase
 * import here — so `parseBoardFilters`/`serialiseBoardFilters` round-trip through a Next.js
 * `searchParams` object without touching the network.
 */
export type KudosBoardFilters = {
  hashtagId: string | null;
  departmentId: string | null;
};

/** A Next.js Server Component's `searchParams` shape (each value may be absent or repeated). */
export type BoardSearchParams = Record<string, string | string[] | undefined>;

function normalizeParam(value: string | string[] | undefined | null): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" && raw.length > 0 ? raw : null;
}

/** Reads `hashtagId`/`departmentId` from either a `URLSearchParams` or a plain searchParams object. */
export function parseBoardFilters(searchParams: URLSearchParams | BoardSearchParams): KudosBoardFilters {
  const read = (key: string): string | null =>
    searchParams instanceof URLSearchParams
      ? searchParams.get(key)
      : normalizeParam(searchParams[key]);

  return {
    hashtagId: read("hashtagId"),
    departmentId: read("departmentId"),
  };
}

/** Inverse of `parseBoardFilters`, for building the URL a filter change or refresh navigates to. */
export function serialiseBoardFilters(filters: KudosBoardFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.hashtagId) params.set("hashtagId", filters.hashtagId);
  if (filters.departmentId) params.set("departmentId", filters.departmentId);
  return params;
}
