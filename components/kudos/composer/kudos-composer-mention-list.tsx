"use client";

import { useTranslations } from "next-intl";

import { KudosAvatar } from "@/components/kudos/kudos-avatar";
import type { ProfileSearchOption } from "@/components/kudos/composer/use-profile-search";

/**
 * `@`-mention popover (spec D/D.1). Purely presentational — `kudos-composer-editor.tsx` owns the
 * query detection, the fetch (`use-profile-search.ts`) and the Arrow Up/Down highlight index, so
 * this file only renders the listbox and reports clicks/hovers back up.
 */
export function KudosComposerMentionList({
  options,
  activeIndex,
  onSelect,
  onHover,
}: {
  options: readonly ProfileSearchOption[];
  activeIndex: number;
  onSelect: (option: ProfileSearchOption) => void;
  onHover: (index: number) => void;
}) {
  const t = useTranslations("kudosBoard.composer");

  return (
    <ul
      id="kudos-composer-mention-list"
      role="listbox"
      className="absolute bottom-full left-0 z-30 mb-1 max-h-48 w-72 overflow-y-auto rounded-lg border border-accent-border bg-white p-2 shadow-xl"
    >
      {options.length === 0 && <li className="px-3 py-2 text-sm text-kudos-muted">{t("mentionEmpty")}</li>}
      {options.map((option, index) => (
        <li key={option.id} id={`kudos-mention-option-${option.id}`} role="option" aria-selected={index === activeIndex}>
          <button
            type="button"
            onMouseEnter={() => onHover(index)}
            onMouseDown={(event) => {
              event.preventDefault();
              onSelect(option);
            }}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-ink ${index === activeIndex ? "bg-kudos-card" : ""}`}
          >
            <KudosAvatar name={option.name} avatarUrl={option.avatarUrl} size={28} />
            <span className="font-bold">{option.name}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
