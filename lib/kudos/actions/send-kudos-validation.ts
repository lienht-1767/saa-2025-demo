import { isAllowedKudosImage } from "@/lib/kudos/composer-options";
import { stripKudosHtml } from "@/lib/kudos/strip-kudos-html";
import type { KudosComposerInput } from "@/lib/kudos/types";
import { isUuid } from "@/lib/kudos/uuid";

const TITLE_MAX_LENGTH = 120;
const MESSAGE_STRIPPED_MAX_LENGTH = 2000;
const MESSAGE_RAW_MAX_LENGTH = 20_000;
const ANONYMOUS_NAME_MAX_LENGTH = 60;
const MAX_HASHTAGS = 5;
const MAX_IMAGES = 5;

/**
 * Pure validator for `sendKudos` (plan 260819-0351-viet-kudo-composer, phase 04). `input.message`
 * MUST already be the sanitized HTML by the time it reaches here — the caller (`sendKudos`)
 * sanitizes once and passes the same value into both this validator and the insert, so the value
 * validated is byte-identical to the value stored. Validating raw HTML instead would let an
 * all-markup message (e.g. `<script>x</script>`) sanitize to empty and still pass a naive
 * "non-empty" check on the raw string.
 */
export function validateSendKudosInput(input: KudosComposerInput, senderId: string): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!isUuid(input.recipientId)) errors.recipientId = "required";
  else if (input.recipientId === senderId) errors.recipientId = "self";

  const title = input.title.trim();
  if (!title) errors.title = "required";
  else if (title.length > TITLE_MAX_LENGTH) errors.title = "tooLong";

  // `input.message` is the already-sanitized HTML (see doc comment above). The 2000-char limit
  // applies to the stripped, human-authored text, not the markup — otherwise legitimate rich text
  // could be rejected purely for its tag overhead. A separate, generous cap on the raw HTML length
  // keeps storage bounded regardless of how much markup surrounds a short message. Raw length is
  // checked before stripping: `stripKudosHtml` itself refuses (returns "") any input over its own
  // length ceiling, which would otherwise misreport an oversized message as "required".
  if (input.message.length > MESSAGE_RAW_MAX_LENGTH) {
    errors.message = "tooLong";
  } else {
    const strippedMessage = stripKudosHtml(input.message);
    if (!strippedMessage) errors.message = "required";
    else if (strippedMessage.length > MESSAGE_STRIPPED_MAX_LENGTH) errors.message = "tooLong";
  }

  if (input.hashtagIds.length === 0) errors.hashtagIds = "required";
  else if (input.hashtagIds.length > MAX_HASHTAGS || input.hashtagIds.some((id) => !isUuid(id))) {
    errors.hashtagIds = "invalid";
  }

  if (input.imageUrls.length > MAX_IMAGES || input.imageUrls.some((url) => !isAllowedKudosImage(url))) {
    errors.imageUrls = "maxImages";
  }

  if (input.isAnonymous) {
    const anonymousName = input.anonymousName?.trim() ?? "";
    if (!anonymousName) errors.anonymousName = "required";
    else if (anonymousName.length > ANONYMOUS_NAME_MAX_LENGTH) errors.anonymousName = "tooLong";
  }

  return errors;
}
