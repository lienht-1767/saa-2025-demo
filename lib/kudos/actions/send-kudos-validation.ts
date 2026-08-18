import { isAllowedKudosImage } from "@/lib/kudos/composer-options";
import type { KudosComposerInput } from "@/lib/kudos/types";
import { isUuid } from "@/lib/kudos/uuid";

export function validateSendKudosInput(input: KudosComposerInput, senderId: string): Record<string, string> {
  const errors: Record<string, string> = {};
  const message = input.message.trim();
  if (!message) errors.message = "required";
  else if (message.length > 2000) errors.message = "tooLong";
  if (!isUuid(input.recipientId)) errors.recipientId = "required";
  else if (input.recipientId === senderId) errors.recipientId = "self";
  if (input.hashtagIds.length > 5 || input.hashtagIds.some((id) => !isUuid(id))) errors.hashtagIds = "invalid";
  if (input.imageUrls.length > 5 || input.imageUrls.some((url) => !isAllowedKudosImage(url))) errors.imageUrls = "maxImages";
  return errors;
}
