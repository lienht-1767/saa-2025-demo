/**
 * Shared failure-containment for the kudos read layer: every query result degrades to an empty
 * value with one `[kudos/read]` warn, so a single failed section never throws and never blanks
 * the whole board (phase-05 plan: "Never throws").
 */

export function degradeToEmptyList<T>(result: { data: readonly T[] | null; error: unknown }, context: string): T[] {
  if (result.error) {
    console.warn(`[kudos/read] ${context} query failed; degrading to an empty list.`);
    return [];
  }
  return [...(result.data ?? [])];
}

export function degradeToNull<T>(result: { data: T | null; error: unknown }, context: string): T | null {
  if (result.error) {
    console.warn(`[kudos/read] ${context} query failed; degrading to null.`);
    return null;
  }
  return result.data;
}

export function degradeCountToZero(result: { count: number | null; error: unknown }, context: string): number {
  if (result.error) {
    console.warn(`[kudos/read] ${context} query failed; degrading to 0.`);
    return 0;
  }
  return result.count ?? 0;
}
