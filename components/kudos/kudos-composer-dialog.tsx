"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { KudosComposerAnonymousField } from "@/components/kudos/composer/kudos-composer-anonymous-field";
import { normalizeComposerHtml } from "@/components/kudos/composer/composer-html-normalize";
import { KudosComposerEditor } from "@/components/kudos/composer/kudos-composer-editor";
import { KudosComposerHashtagField } from "@/components/kudos/composer/kudos-composer-hashtag-field";
import { KudosComposerImageField } from "@/components/kudos/composer/kudos-composer-image-field";
import { KudosComposerRecipientField } from "@/components/kudos/composer/kudos-composer-recipient-field";
import { KudosComposerTitleField } from "@/components/kudos/composer/kudos-composer-title-field";
import { KudosComposerToolbar } from "@/components/kudos/composer/kudos-composer-toolbar";
import { useComposerFormatCommands } from "@/components/kudos/composer/use-composer-format-commands";
import type { RecipientOption } from "@/components/kudos/kudos-composer-recipient-picker";
import type { KudosComposerInput, KudosFilterOption } from "@/lib/kudos/types";

const TITLE_MAX_LENGTH = 120;

/**
 * Every dotted `field.key` error `sendKudos` can return (see the grammar documented on
 * `KudosComposerInput` in `lib/kudos/types.ts`). Anything else falls back to `errors.form.failed`
 * instead of a broken lookup.
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

/**
 * `Viết KUDO` (node `520:11647`, screen `ihQ26W78P2`): the cream (`--kudos-card`, `#FFF8E1`
 * measured on this frame) composer modal — 752px, 40px padding, 24px radius, 32px section gap.
 * This shell owns every field's state (phase 06 Key Insights: one owner, so `canSubmit` never
 * scatters across sections) and composes the `components/kudos/composer/*` sections built in
 * phases 06–08.
 */
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
  const editorRef = useRef<HTMLDivElement>(null);
  const commands = useComposerFormatCommands(editorRef);
  const [recipient, setRecipient] = useState<RecipientOption | null>(null);
  const [title, setTitle] = useState("");
  const [messageHasText, setMessageHasText] = useState(false);
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

  const canSubmit = !!recipient && !!title.trim() && messageHasText && hashtagIds.length >= 1 && (!isAnonymous || !!anonymousName.trim());
  const resolvedError = errorKey && KNOWN_ERROR_KEYS.has(errorKey) ? errorKey : "form.failed";
  const trapFocus = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const controls = panelRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [contenteditable='true'], [tabindex='0']");
    if (!controls?.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  return (
    <div role="presentation" className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4" onMouseDown={(e) => e.target === e.currentTarget && !submitting && onClose()}>
      {/* mm:520:11647 */}
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="kudos-composer-title" tabIndex={-1} onKeyDown={trapFocus} className="flex max-h-[90vh] w-full max-w-[752px] flex-col gap-8 overflow-y-auto rounded-[24px] bg-kudos-card p-10 shadow-2xl">
        <h2 id="kudos-composer-title" className="text-center text-3xl leading-10 font-bold text-ink">{t("title")}</h2>
        <form
          className="flex flex-col gap-8"
          onSubmit={(event) => {
            event.preventDefault();
            if (!recipient || !canSubmit) return;
            onSubmit({
              recipientId: recipient.id,
              title: title.trim(),
              // Read-at-submit safety net: every toolbar command and paste already normalizes the
              // live editor node, but running the same pure normalization once more here means the
              // submitted markup is correct even if some path is missed — see
              // `composer-html-normalize.ts`.
              message: normalizeComposerHtml(editorRef.current?.innerHTML ?? ""),
              hashtagIds,
              imageUrls,
              isAnonymous,
              // Presentational-only anonymity — see the `isAnonymous` state comment above.
              anonymousName: isAnonymous ? anonymousName.trim() : null,
            });
          }}
        >
          <KudosComposerRecipientField viewerId={viewerId} value={recipient} onChange={setRecipient} />
          <KudosComposerTitleField value={title} onChange={(next) => setTitle(next.slice(0, TITLE_MAX_LENGTH))} />
          <div className="flex flex-col gap-1">
            <KudosComposerToolbar
              commands={{ ...commands.state, toggleBold: commands.toggleBold, toggleItalic: commands.toggleItalic, toggleStrike: commands.toggleStrike, toggleList: commands.toggleList, toggleQuote: commands.toggleQuote }}
              onInsertLink={commands.insertLink}
            />
            <KudosComposerEditor editorRef={editorRef} viewerId={viewerId} onHasTextChange={setMessageHasText} onAfterChange={commands.refreshState} />
            <span className="self-end text-base leading-6 font-bold tracking-[0.5px] text-ink">{t("messageHint")}</span>
          </div>
          <KudosComposerHashtagField catalog={hashtags} selectedIds={hashtagIds} onChange={setHashtagIds} />
          <KudosComposerImageField urls={imageUrls} onChange={setImageUrls} />
          <KudosComposerAnonymousField checked={isAnonymous} name={anonymousName} onCheckedChange={setIsAnonymous} onNameChange={setAnonymousName} />
          {errorKey && <p role="alert" className="text-sm font-bold text-badge-danger">{t(`errors.${resolvedError}`)}</p>}
          <div className="flex justify-end gap-4">
            <button type="button" disabled={submitting} onClick={onClose} className="rounded border border-accent-border bg-brand-yellow/10 px-10 py-4 font-bold text-ink disabled:opacity-50">
              {t("cancel")} ✕
            </button>
            <button type="submit" disabled={submitting || !canSubmit} className="min-w-[502px] rounded-lg bg-brand-yellow px-4 py-4 text-center font-bold text-ink disabled:cursor-not-allowed disabled:opacity-50">
              {submitting ? t("sending") : `${t("submit")} ▷`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
