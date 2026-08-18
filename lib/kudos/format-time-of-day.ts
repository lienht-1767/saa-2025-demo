/**
 * Renders an ISO timestamp as `HH:mm`, matching the time prefix on the SPOTLIGHT ticker lines
 * visible in evidence/momorph-screen-MaZUn5xHXZ.png (e.g. "08:30 Nguyễn Bá Chức đã nhận được một
 * Kudos mới"). Uses UTC fields for the same stability reason as `format-post-time.ts`.
 */
export function formatTimeOfDay(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`formatTimeOfDay: unparsable timestamp "${isoTimestamp}"`);
  }

  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}
