/**
 * Renders a kudos post's ISO timestamp as the design's `HH:mm - MM/DD/YYYY` string
 * (e.g. "10:00 - 10/30/2025", spec B.* / C.*). Uses UTC fields so the output is stable
 * regardless of the server/browser's local timezone.
 */
export function formatPostTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`formatPostTime: unparsable timestamp "${isoTimestamp}"`);
  }

  const pad = (value: number) => String(value).padStart(2, "0");
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const year = date.getUTCFullYear();

  return `${hours}:${minutes} - ${month}/${day}/${year}`;
}
