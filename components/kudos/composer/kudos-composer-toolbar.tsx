"use client";

import { useTranslations } from "next-intl";

import {
  IconFormatBold,
  IconFormatItalic,
  IconFormatLink,
  IconFormatNumberedList,
  IconFormatQuote,
  IconFormatStrikethrough,
} from "@/components/kudos/composer/kudos-composer-icons";
import type { ComposerFormatState } from "@/components/kudos/composer/use-composer-format-commands";

const HTTP_URL_PATTERN = /^https?:\/\//i;

/**
 * `mms_C_Chức năng` (node `I520:11647;520:9877`): six format buttons sharing one 40px, 1px
 * `--accent-border` row (only the first/last corners round, matching the editor box below), plus
 * the right-aligned red underlined "Tiêu chuẩn cộng đồng" link (`3053:11619`, `#E46060`). That
 * link has no destination route yet (clarifications.md) — rendered `aria-disabled`, not a live `<a>`.
 */
export function KudosComposerToolbar({
  commands,
  onInsertLink,
}: {
  commands: ComposerFormatState & {
    toggleBold: () => void;
    toggleItalic: () => void;
    toggleStrike: () => void;
    toggleList: () => void;
    toggleQuote: () => void;
  };
  onInsertLink: (url: string) => void;
}) {
  const t = useTranslations("kudosBoard.composer");

  const buttonClass = "flex h-10 items-center justify-center gap-2 border border-accent-border px-4 text-ink";

  const promptForLink = () => {
    const input = window.prompt(t("linkPromptMessage"));
    if (input === null) return;
    const url = input.trim();
    if (!HTTP_URL_PATTERN.test(url)) {
      window.alert(t("linkInvalid"));
      return;
    }
    onInsertLink(url);
  };

  return (
    /* mm:I520:11647;520:9877 */
    <div className="flex w-full items-center justify-end rounded-t-lg border-x border-t border-accent-border">
      <button type="button" aria-pressed={commands.bold} aria-label={t("toolbarBold")} onClick={commands.toggleBold} className={`${buttonClass} rounded-tl-lg`}>
        <IconFormatBold className="size-6" />
      </button>
      <button type="button" aria-pressed={commands.italic} aria-label={t("toolbarItalic")} onClick={commands.toggleItalic} className={buttonClass}>
        <IconFormatItalic className="size-6" />
      </button>
      <button type="button" aria-pressed={commands.strike} aria-label={t("toolbarStrike")} onClick={commands.toggleStrike} className={buttonClass}>
        <IconFormatStrikethrough className="size-6" />
      </button>
      <button type="button" aria-pressed={commands.list} aria-label={t("toolbarList")} onClick={commands.toggleList} className={buttonClass}>
        <IconFormatNumberedList className="size-6" />
      </button>
      <button type="button" aria-label={t("toolbarLink")} onClick={promptForLink} className={buttonClass}>
        <IconFormatLink className="size-6" />
      </button>
      <button type="button" aria-label={t("toolbarQuote")} onClick={commands.toggleQuote} className={buttonClass}>
        <IconFormatQuote className="size-6" />
      </button>
      <div className={`${buttonClass} flex-1 rounded-tr-lg`}>
        <a
          href="#"
          aria-disabled="true"
          tabIndex={-1}
          onClick={(event) => event.preventDefault()}
          className="text-base leading-6 font-bold tracking-[0.15px] text-kudos-composer-link underline"
        >
          {t("communityStandards")}
        </a>
      </div>
    </div>
  );
}
