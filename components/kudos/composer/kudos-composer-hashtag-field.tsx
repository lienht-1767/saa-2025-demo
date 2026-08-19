"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { KudosComposerFieldLabel } from "@/components/kudos/composer/kudos-composer-field-label";
import { KudosComposerHashtagMenu } from "@/components/kudos/composer/kudos-composer-hashtag-menu";
import { IconClose } from "@/components/kudos/kudos-icons";
import { IconPlus } from "@/components/kudos/composer/kudos-composer-icons";
import type { KudosFilterOption } from "@/lib/kudos/types";

const MAX_HASHTAGS = 5;

/**
 * `mms_E_Frame 536` (node `I520:11647;520:9890`): "Hashtag *" label, chosen chips with an `x`
 * remove button each, and the "+ Hashtag / Tối đa 5" trigger. At five chips the trigger is
 * **disabled** with a "Tối đa 5" tooltip (clarifications' resolution of the design/ID-16 conflict
 * — see phase 08 Key Insights); the image field instead hides its trigger at five.
 */
export function KudosComposerHashtagField({
  catalog,
  selectedIds,
  onChange,
}: {
  catalog: readonly KudosFilterOption[];
  selectedIds: readonly string[];
  onChange: (next: string[]) => void;
}) {
  const t = useTranslations("kudosBoard.composer");
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = catalog.filter((tag) => selectedIds.includes(tag.id));
  const available = catalog.filter((tag) => !selectedIds.includes(tag.id));
  const atMax = selectedIds.length >= MAX_HASHTAGS;

  return (
    /* mm:I520:11647;520:9890 */
    <div className="flex flex-wrap items-center gap-4">
      <div className="shrink-0">
        <KudosComposerFieldLabel label={t("hashtagLabel")} required />
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {selected.map((tag) => (
          <span key={tag.id} className="flex items-center gap-2 rounded-lg border border-accent-border bg-white py-1 pr-2 pl-3 font-bold text-ink">
            {tag.label}
            <button type="button" aria-label={t("hashtagRemoveLabel", { name: tag.label })} onClick={() => onChange(selectedIds.filter((id) => id !== tag.id))}>
              <IconClose className="size-4" />
            </button>
          </span>
        ))}
        <div className="relative">
          <button
            ref={triggerRef}
            type="button"
            disabled={atMax}
            title={atMax ? t("maxCount") : undefined}
            aria-disabled={atMax}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-1 rounded-lg border border-accent-border bg-white px-2 py-1 text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconPlus className="size-6" />
            <span className="flex flex-col text-left text-[11px] leading-4 font-bold tracking-[0.5px] text-kudos-muted">
              <span>{t("hashtagAddButton")}</span>
              <span>{t("maxCount")}</span>
            </span>
          </button>
          {menuOpen && !atMax && (
            <KudosComposerHashtagMenu options={available} onSelect={(id) => onChange([...selectedIds, id])} onClose={() => setMenuOpen(false)} triggerRef={triggerRef} />
          )}
        </div>
      </div>
    </div>
  );
}
