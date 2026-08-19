"use client";

import { useTranslations } from "next-intl";

// Must match ANONYMOUS_NAME_MAX_LENGTH in lib/kudos/actions/send-kudos-validation.ts and the
// kudos_anonymous_name_length DB constraint (both 60) — a looser input cap would let the user
// type past a limit the server then rejects.
const NAME_MAX_LENGTH = 60;

/**
 * `mms_G_Gửi ẩn danh` (node `I520:11647;520:14099`): checkbox + conditionally rendered name
 * input. Anonymity here is presentational only — `sender_id` is still written to `kudos` and
 * stays readable via PostgREST (clarifications.md, round 2); this component never implies
 * stronger anonymity than that in its copy.
 *
 * The name field is conditionally **rendered**, not merely hidden, so it drops out of the tab
 * order when unchecked, and unchecking clears the value so a stale name can never be submitted
 * (test cases ID-43/44).
 */
export function KudosComposerAnonymousField({
  checked,
  name,
  onCheckedChange,
  onNameChange,
}: {
  checked: boolean;
  name: string;
  onCheckedChange: (next: boolean) => void;
  onNameChange: (next: string) => void;
}) {
  const t = useTranslations("kudosBoard.composer");

  return (
    /* mm:I520:11647;520:14099 */
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-4 text-[22px] leading-7 font-bold text-ink">
        <input
          type="checkbox"
          checked={checked}
          aria-controls="kudos-composer-anonymous-name"
          aria-expanded={checked}
          onChange={(event) => {
            onCheckedChange(event.target.checked);
            if (!event.target.checked) onNameChange("");
          }}
          className="size-6 rounded border border-kudos-muted accent-brand-yellow"
        />
        {t("anonymousLabel")}
      </label>
      {checked && (
        <input
          id="kudos-composer-anonymous-name"
          type="text"
          value={name}
          maxLength={NAME_MAX_LENGTH}
          aria-required="true"
          onChange={(event) => onNameChange(event.target.value)}
          placeholder={t("anonymousNamePlaceholder")}
          className="h-14 w-full max-w-md rounded-lg border border-accent-border bg-white px-6 text-base leading-6 font-bold tracking-[0.15px] text-ink placeholder:text-kudos-muted focus:outline-2 focus:outline-brand-yellow"
        />
      )}
    </div>
  );
}
