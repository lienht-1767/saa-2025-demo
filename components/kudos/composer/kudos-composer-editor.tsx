"use client";

import { type RefObject, useState } from "react";
import { useTranslations } from "next-intl";

import { detectMentionQuery, insertMentionAtCaret } from "@/components/kudos/composer/composer-mention";
import { normalizeElementTree } from "@/components/kudos/composer/composer-html-normalize";
import { KudosComposerMentionList } from "@/components/kudos/composer/kudos-composer-mention-list";
import { useProfileSearch, type ProfileSearchOption } from "@/components/kudos/composer/use-profile-search";

/**
 * `mms_D_text filed` (node `I520:11647;520:9886`): the contentEditable body under the toolbar.
 * **Uncontrolled by design** (phase 07 Key Insights) — React state never drives `innerHTML` on
 * every keystroke, which would destroy the caret. Only a `hasText` boolean crosses into React;
 * the shell reads `editorRef.current.innerHTML` directly at submit time.
 */
export function KudosComposerEditor({
  editorRef,
  viewerId,
  onHasTextChange,
  onAfterChange,
}: {
  editorRef: RefObject<HTMLDivElement | null>;
  viewerId: string;
  onHasTextChange: (hasText: boolean) => void;
  onAfterChange?: () => void;
}) {
  const t = useTranslations("kudosBoard.composer");
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const options = useProfileSearch(mentionQuery, viewerId);

  const processChange = () => {
    const el = editorRef.current;
    onHasTextChange(!!el && (el.textContent ?? "").trim().length > 0);
    const query = detectMentionQuery();
    setMentionQuery(query);
    setActiveIndex(0);
    onAfterChange?.();
  };

  const selectMention = (option: ProfileSearchOption) => {
    insertMentionAtCaret(option.name);
    setMentionQuery(null);
    processChange();
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    // Belt-and-suspenders: `insertText` should only ever produce plain text, but some engines'
    // fallback paste handling has been known to carry formatting through anyway — the same
    // allowlist normalization the toolbar commands run keeps that case harmless too.
    if (editorRef.current) normalizeElementTree(editorRef.current);
    processChange();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (mentionQuery === null) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(options.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      if (options[activeIndex]) {
        event.preventDefault();
        selectMention(options[activeIndex]);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      setMentionQuery(null);
    }
  };

  return (
    /* mm:I520:11647;520:9886 */
    <div className="relative w-full">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={t("messageLabel")}
        aria-required="true"
        data-placeholder={t("messagePlaceholder")}
        onInput={processChange}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        className="min-h-[200px] w-full rounded-b-lg border-x border-b border-accent-border bg-white p-6 text-base leading-6 font-bold tracking-[0.15px] text-ink outline-none empty:before:text-kudos-muted empty:before:content-[attr(data-placeholder)]"
      />
      {mentionQuery !== null && (
        <KudosComposerMentionList options={options} activeIndex={activeIndex} onSelect={selectMention} onHover={setActiveIndex} />
      )}
    </div>
  );
}
