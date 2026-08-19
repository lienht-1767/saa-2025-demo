"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { KudosComposerFieldLabel } from "@/components/kudos/composer/kudos-composer-field-label";
import { KudosComposerImagePicker } from "@/components/kudos/composer/kudos-composer-image-picker";
import { IconPlus } from "@/components/kudos/composer/kudos-composer-icons";

const MAX_IMAGES = 5;

/**
 * `mms_F_Frame 537` (node `I520:11647;520:9896`): "Image" label, an 80x80 thumbnail grid (18px
 * radius, `--accent-border`) each with a red circular `x` badge (`#D4271D` — `--badge-danger`,
 * matches the design exactly), and the "+ Image / Tối đa 5" trigger. At five images the trigger
 * is **hidden** (not disabled) — the design/behaviour the hashtag field deliberately does not
 * mirror; see phase 08 Key Insights.
 */
export function KudosComposerImageField({
  urls,
  onChange,
}: {
  urls: readonly string[];
  onChange: (next: string[]) => void;
}) {
  const t = useTranslations("kudosBoard.composer");
  const [pickerOpen, setPickerOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const atMax = urls.length >= MAX_IMAGES;

  return (
    /* mm:I520:11647;520:9896 */
    <div className="flex flex-wrap items-center gap-4">
      <div className="shrink-0">
        <KudosComposerFieldLabel label={t("imageLabel")} />
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-4">
        {urls.map((url, index) => (
          <div key={url} className="relative size-20 shrink-0 overflow-hidden rounded-[18px] border border-accent-border bg-white">
            <Image src={url} alt="" width={80} height={80} className="size-full rounded border border-brand-yellow object-cover" />
            <button
              type="button"
              aria-label={t("imageRemoveLabel", { index: index + 1 })}
              onClick={() => onChange(urls.filter((existing) => existing !== url))}
              className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-badge-danger text-white"
            >
              <span aria-hidden className="text-xs leading-none">
                ×
              </span>
            </button>
          </div>
        ))}
        {!atMax && (
          <div className="relative">
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setPickerOpen((open) => !open)}
              className="flex items-center gap-1 rounded-lg border border-accent-border bg-white px-2 py-1 text-ink"
            >
              <IconPlus className="size-6" />
              <span className="flex flex-col text-left text-[11px] leading-4 font-bold tracking-[0.5px] text-kudos-muted">
                <span>{t("imageAddButton")}</span>
                <span>{t("maxCount")}</span>
              </span>
            </button>
            {pickerOpen && (
              <KudosComposerImagePicker excludeUrls={urls} onSelect={(url) => onChange([...urls, url])} onClose={() => setPickerOpen(false)} triggerRef={triggerRef} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
