"use client";

import { useTranslations } from "next-intl";

import { KudosComposerFieldLabel } from "@/components/kudos/composer/kudos-composer-field-label";

const TITLE_MAX_LENGTH = 120;

/**
 * "Danh hiệu *" field (`Frame 552`, node `I520:11647;1688:10448`). Not present in the specs CSV —
 * implemented from the Figma image per clarifications.md: text input + two grey hint lines below.
 */
export function KudosComposerTitleField({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const t = useTranslations("kudosBoard.composer");

  return (
    /* mm:I520:11647;1688:10448 */
    <div className="flex items-center gap-4">
      <div className="w-[139px] shrink-0">
        <KudosComposerFieldLabel htmlFor="kudos-composer-title" label={t("titleLabel")} required />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <input
          id="kudos-composer-title"
          type="text"
          value={value}
          maxLength={TITLE_MAX_LENGTH}
          aria-required="true"
          onChange={(event) => onChange(event.target.value)}
          placeholder={t("titlePlaceholder")}
          className="h-14 w-full rounded-lg border border-accent-border bg-white px-6 text-base leading-6 font-bold tracking-[0.15px] text-ink placeholder:text-kudos-muted focus:outline-2 focus:outline-brand-yellow"
        />
        <span className="text-base leading-6 font-bold tracking-[0.15px] text-kudos-muted">{t("titleHintExample")}</span>
        <span className="text-base leading-6 font-bold tracking-[0.15px] text-kudos-muted">{t("titleHintUsage")}</span>
      </div>
    </div>
  );
}
