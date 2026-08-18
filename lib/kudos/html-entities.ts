/**
 * A small, intentionally non-exhaustive HTML-entity decoder shared by `sanitize-kudos-html.ts`
 * (to defeat scheme obfuscation in `href` values, e.g. `&#106;avascript:`) and
 * `strip-kudos-html.ts` (to produce readable plain text). Not a general entity table — only
 * numeric refs and the handful of named entities an attacker or a rich-text editor would
 * plausibly emit.
 */

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

export function decodeHtmlEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (whole, body: string) => {
    if (body[0] === "#") {
      const isHex = body[1]?.toLowerCase() === "x";
      const codePoint = isHex ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      if (!Number.isFinite(codePoint) || codePoint < 0 || codePoint > 0x10ffff) return whole;
      try {
        return String.fromCodePoint(codePoint);
      } catch {
        return whole;
      }
    }
    const named = NAMED_ENTITIES[body.toLowerCase()];
    return named ?? whole;
  });
}
