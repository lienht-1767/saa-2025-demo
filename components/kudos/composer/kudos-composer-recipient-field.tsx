"use client";

import { useTranslations } from "next-intl";

import { KudosComposerFieldLabel } from "@/components/kudos/composer/kudos-composer-field-label";
import { KudosComposerRecipientPicker, type RecipientOption } from "@/components/kudos/kudos-composer-recipient-picker";

/**
 * `mms_B_Chọn người nhận` (node `I520:11647;520:9871`): the "Người nhận *" label placed beside
 * the search field, per the design's row layout (label left, 514px-wide search flex-grow right).
 */
export function KudosComposerRecipientField({
  viewerId,
  value,
  onChange,
}: {
  viewerId: string;
  value: RecipientOption | null;
  onChange: (recipient: RecipientOption | null) => void;
}) {
  const t = useTranslations("kudosBoard.composer");

  return (
    /* mm:I520:11647;520:9871 */
    <div className="flex items-center gap-4">
      <div className="shrink-0">
        <KudosComposerFieldLabel label={t("recipientLabel")} required />
      </div>
      <div className="flex-1">
        <KudosComposerRecipientPicker viewerId={viewerId} value={value} onChange={onChange} />
      </div>
    </div>
  );
}
