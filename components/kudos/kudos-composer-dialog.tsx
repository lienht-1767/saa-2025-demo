"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { KudosComposerRecipientPicker, type RecipientOption } from "@/components/kudos/kudos-composer-recipient-picker";
import { KUDOS_IMAGE_OPTIONS } from "@/lib/kudos/composer-options";
import type { KudosComposerInput, KudosFilterOption } from "@/lib/kudos/types";

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
  const [message, setMessage] = useState("");
  const [hashtagIds, setHashtagIds] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

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
  const resolvedError = errorKey === "tooLong" || errorKey === "maxImages" || errorKey === "required" ? errorKey : "failed";
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
        <form className="mt-6 flex flex-col gap-5" onSubmit={(event) => { event.preventDefault(); if (recipient) onSubmit({ recipientId: recipient.id, message, hashtagIds, imageUrls }); }}>
          <label className="flex flex-col gap-2 text-sm font-bold text-white">{t("recipientLabel")}
            <KudosComposerRecipientPicker viewerId={viewerId} value={recipient} onChange={setRecipient} />
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
          {errorKey && <p role="alert" className="text-sm font-bold text-red-400">{t(`errors.${resolvedError}`)}</p>}
          <div className="flex justify-end gap-3"><button type="button" disabled={submitting} onClick={onClose} className="rounded-lg border border-accent-border px-5 py-3 font-bold text-white disabled:opacity-50">{t("cancel")}</button><button type="submit" disabled={submitting || !recipient || !message.trim()} className="rounded-lg bg-brand-yellow px-5 py-3 font-bold text-ink disabled:cursor-not-allowed disabled:opacity-50">{submitting ? t("sending") : t("submit")}</button></div>
        </form>
      </div>
    </div>
  );
}
