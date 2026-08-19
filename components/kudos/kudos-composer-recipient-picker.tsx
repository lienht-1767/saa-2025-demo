"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { KudosAvatar } from "@/components/kudos/kudos-avatar";
import { IconChevronDown } from "@/components/kudos/kudos-icons";
import { useProfileSearch } from "@/components/kudos/composer/use-profile-search";

export type RecipientOption = { id: string; name: string; avatarUrl: string | null };

/**
 * `mms_B.2_Search` (node `I520:11647;520:9873`): 56px white input, 1px `--accent-border`,
 * 8px radius, "Tìm kiếm" placeholder and a trailing caret (`MM_MEDIA_Down`). The `profiles`
 * search itself now lives in `use-profile-search.ts` (phase 07 extraction) — this component only
 * renders the field and the result listbox.
 */
export function KudosComposerRecipientPicker({
  viewerId,
  value,
  onChange,
}: {
  viewerId: string;
  value: RecipientOption | null;
  onChange: (recipient: RecipientOption | null) => void;
}) {
  const t = useTranslations("kudosBoard.composer");
  const [query, setQuery] = useState("");
  const options = useProfileSearch(query, viewerId);
  const open = !value && options.length > 0;

  return (
    /* mm:I520:11647;520:9873 */
    <div className="relative">
      <div className="flex h-14 w-full items-center justify-between gap-2 rounded-lg border border-accent-border bg-white px-6">
        <input
          type="search"
          value={value ? value.name : query}
          onChange={(event) => {
            onChange(null);
            setQuery(event.target.value);
          }}
          placeholder={t("recipientPlaceholder")}
          className="w-full bg-transparent text-base leading-6 font-bold tracking-[0.15px] text-ink placeholder:text-kudos-muted focus:outline-none"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="kudos-composer-recipient-listbox"
          role="combobox"
        />
        <IconChevronDown aria-hidden className="size-6 shrink-0 text-ink" />
      </div>
      {open && (
        <ul id="kudos-composer-recipient-listbox" role="listbox" className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-lg border border-accent-border bg-white p-2 shadow-xl">
          {options.map((option) => (
            <li key={option.id} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => onChange(option)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-ink hover:bg-kudos-card"
              >
                <KudosAvatar name={option.name} avatarUrl={option.avatarUrl} size={36} />
                <span className="font-bold">{option.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
