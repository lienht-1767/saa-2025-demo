"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { KudosComposerRecipientPicker, type RecipientOption } from "@/components/kudos/kudos-composer-recipient-picker";
import { KUDOS_IMAGE_OPTIONS } from "@/lib/kudos/composer-options";
import type { KudosComposerInput, KudosFilterOption } from "@/lib/kudos/types";

const TITLE_MAX_LENGTH = 120;

/**
 * Every dotted `field.key` error `sendKudos` can return (see the grammar documented on
 * `KudosComposerInput` in `lib/kudos/types.ts`). Anything else — including the legacy flat keys
 * still returned until phase 04 rewires `sendKudos`/`validateSendKudosInput` — falls back to
 * `errors.form.failed` instead of a broken lookup.
 */
const KNOWN_ERROR_KEYS = new Set([
  "recipientId.required",
  "recipientId.self",
  "title.required",
  "title.tooLong",
  "message.required",
  "message.tooLong",
  "hashtagIds.required",
  "hashtagIds.invalid",
  "imageUrls.maxImages",
  "anonymousName.required",
  "anonymousName.tooLong",
]);

export function KudosComposerDialog({ open, viewerId, hashtags, submitting, errorKey, onClose, onSubmit }: {
  open: boolean;
  viewerId: string;
  hashtags: readonly KudosFilterOption[];
  submitting: boolean;
  errorKey: string | null;
  onClose: () => void;
  onSubmit: (input: KudosComposerInput) => void;
}) {
  const t = useTranslations("kudosBoard.composer");
  const panelRef = useRef<HTMLDivElement>(null);
  const [recipient, setRecipient] = useState<RecipientOption | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [hashtagIds, setHashtagIds] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  // Anonymous send hides the sender in this UI only: `sender_id` is still written to `kudos` and
  // stays readable via PostgREST. Accepted for the internal SAA 2025 demo (clarifications.md,
  // round 2) — never let copy near this control promise stronger anonymity than that.
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousName, setAnonymousName] = useState("");

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && !submitting && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open, submitting]);
  if (!open) return null;

  const toggleLimited = (list: string[], value: string, setter: (next: string[]) => void) => {
    if (list.includes(value)) setter(list.filter((item) => item !== value));
    else if (list.length < 5) setter([...list, value]);
  };
  const resolvedError = errorKey && KNOWN_ERROR_KEYS.has(errorKey) ? errorKey : "form.failed";
  const trapFocus = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const controls = panelRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex='0']");
    if (!controls?.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  return (
    <div role="presentation" className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4" onMouseDown={(e) => e.target === e.currentTarget && !submitting && onClose()}>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="kudos-composer-title" tabIndex={-1} onKeyDown={trapFocus} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-accent-border bg-surface-dark p-6 shadow-2xl sm:p-8">
        <h2 id="kudos-composer-title" className="text-3xl font-bold text-brand-yellow">{t("title")}</h2>
        <form
          className="mt-6 flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!recipient) return;
            onSubmit({
              recipientId: recipient.id,
              title: title.trim(),
              message,
              hashtagIds,
              imageUrls,
              isAnonymous,
              // Presentational-only anonymity — see the `isAnonymous` state comment above.
              anonymousName: isAnonymous ? anonymousName.trim() : null,
            });
          }}
        >
          <label className="flex flex-col gap-2 text-sm font-bold text-white">{t("recipientLabel")}
            <KudosComposerRecipientPicker viewerId={viewerId} value={recipient} onChange={setRecipient} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-bold text-white">{t("titleLabel")}
            <input
              type="text"
              value={title}
              maxLength={TITLE_MAX_LENGTH}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("titlePlaceholder")}
              className="rounded-lg border border-accent-border bg-white/5 p-3 text-white placeholder:text-white/50 focus:outline-2 focus:outline-brand-yellow"
            />
            <span className="text-xs text-white/60">{t("titleHintExample")}</span>
            <span className="text-xs text-white/60">{t("titleHintUsage")}</span>
          </label>
          <label className="flex flex-col gap-2 text-sm font-bold text-white">{t("messageLabel")}
            <textarea value={message} maxLength={2000} rows={5} onChange={(e) => setMessage(e.target.value)} placeholder={t("messagePlaceholder")} className="rounded-lg border border-accent-border bg-white/5 p-4 text-white placeholder:text-white/50 focus:outline-2 focus:outline-brand-yellow" />
            <span className="self-end text-xs text-white/60">{message.length}/2000</span>
          </label>
          <fieldset><legend className="mb-2 text-sm font-bold text-white">{t("hashtagLabel")}</legend>
            <div className="flex flex-wrap gap-2">{hashtags.map((tag) => <button key={tag.id} type="button" aria-pressed={hashtagIds.includes(tag.id)} onClick={() => toggleLimited(hashtagIds, tag.id, setHashtagIds)} className="rounded-full border border-accent-border px-3 py-2 text-sm text-white aria-pressed:bg-brand-yellow aria-pressed:text-ink">{tag.label}</button>)}</div>
          </fieldset>
          <fieldset><legend className="mb-2 text-sm font-bold text-white">{t("imageLabel")}</legend>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">{KUDOS_IMAGE_OPTIONS.map((url) => <button key={url} type="button" aria-pressed={imageUrls.includes(url)} onClick={() => toggleLimited(imageUrls, url, setImageUrls)} className="overflow-hidden rounded-lg border-2 border-transparent aria-pressed:border-brand-yellow"><Image src={url} alt="" width={96} height={72} className="aspect-4/3 h-auto w-full object-cover" /></button>)}</div>
          </fieldset>
          <label className="flex items-center gap-2 text-sm font-bold text-white">
            <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="size-4 accent-brand-yellow" />
            {t("anonymousLabel")}
          </label>
          {isAnonymous && (
            <label className="flex flex-col gap-2 text-sm font-bold text-white">{t("anonymousNameLabel")}
              <input
                type="text"
                value={anonymousName}
                maxLength={TITLE_MAX_LENGTH}
                onChange={(e) => setAnonymousName(e.target.value)}
                placeholder={t("anonymousNamePlaceholder")}
                className="rounded-lg border border-accent-border bg-white/5 p-3 text-white placeholder:text-white/50 focus:outline-2 focus:outline-brand-yellow"
              />
            </label>
          )}
          {errorKey && <p role="alert" className="text-sm font-bold text-red-400">{t(`errors.${resolvedError}`)}</p>}
          <div className="flex justify-end gap-3"><button type="button" disabled={submitting} onClick={onClose} className="rounded-lg border border-accent-border px-5 py-3 font-bold text-white disabled:opacity-50">{t("cancel")}</button><button type="submit" disabled={submitting || !recipient || !title.trim() || !message.trim() || (isAnonymous && !anonymousName.trim())} className="rounded-lg bg-brand-yellow px-5 py-3 font-bold text-ink disabled:cursor-not-allowed disabled:opacity-50">{submitting ? t("sending") : t("submit")}</button></div>
        </form>
      </div>
    </div>
  );
}
