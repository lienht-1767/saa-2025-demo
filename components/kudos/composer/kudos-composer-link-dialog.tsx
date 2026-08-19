"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { IconFormatLink } from "@/components/kudos/composer/kudos-composer-icons";
import { IconClose } from "@/components/kudos/kudos-icons";

/**
 * `Add link box` — MoMorph screen `OyDLDuSGEa` (Figma `1002:12682`).
 *
 * Card: 752x388, 40px padding, 32px gap, 24px radius on `--kudos-card` (#FFF8E1).
 * Title `Thêm đường dẫn` at 32/40 700. Two label+field rows (`I1002:12682;1002:12501` and
 * `…;1002:12652`), each 56px tall with the label at 22/28 700 and the field flex-1, white,
 * 1px `--accent-border`, 8px radius, 16px/24px padding. Footer (`…;1002:12543`) is 24px apart:
 * `Hủy` (16/40 padding, 10% brand-yellow fill, `--accent-border`, 4px radius, close glyph) and
 * `Lưu` (flex-1, 60px tall, solid brand-yellow, 8px radius, link glyph).
 *
 * Validation follows spec B.2/C.2: text 1–100 characters and not whitespace only; URL 5–2048
 * characters and `http(s)` — checked on save, and the URL also on blur.
 */
export const LINK_TEXT_MAX = 100;
export const LINK_URL_MIN = 5;
export const LINK_URL_MAX = 2048;

const HTTP_URL_PATTERN = /^https?:\/\/\S+$/i;

/**
 * Mounted only while the dialog is open, so every open starts from a fresh, empty form without an
 * effect resetting state (which the `react-hooks/set-state-in-effect` rule rightly rejects).
 */
export type KudosComposerLinkDialogProps = {
  /** Pre-fills the Text field with whatever the editor selection held. */
  initialText?: string;
  onCancel: () => void;
  onSubmit: (link: { text: string; url: string }) => void;
};

export function KudosComposerLinkDialog({ initialText = "", onCancel, onSubmit }: KudosComposerLinkDialogProps) {
  const t = useTranslations("kudosBoard.composer");
  const [text, setText] = useState(initialText);
  const [url, setUrl] = useState("");
  const [textError, setTextError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const textId = useId();
  const urlId = useId();
  const titleId = useId();
  const textRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    textRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  const validateUrl = (value: string) =>
    !HTTP_URL_PATTERN.test(value.trim()) || value.trim().length < LINK_URL_MIN || value.trim().length > LINK_URL_MAX
      ? t("linkInvalid")
      : null;

  const validateText = (value: string) =>
    value.trim().length === 0 || value.trim().length > LINK_TEXT_MAX ? t("linkTextInvalid") : null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTextError = validateText(text);
    const nextUrlError = validateUrl(url);
    setTextError(nextTextError);
    setUrlError(nextUrlError);
    if (nextTextError || nextUrlError) return;
    onSubmit({ text: text.trim(), url: url.trim() });
  }

  const fieldClass =
    "h-14 min-w-0 flex-1 rounded-lg border border-accent-border bg-white px-6 py-4 text-base text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";
  const labelClass = "w-[123px] shrink-0 text-[22px] leading-7 font-bold text-ink";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      {/* mm:1002:12682 */}
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex w-full max-w-[752px] flex-col gap-8 rounded-3xl bg-kudos-card p-6 md:p-10"
      >
        {/* mm:I1002:12682;1002:12500 */}
        <h2 id={titleId} className="text-2xl leading-10 font-bold text-ink md:text-[32px]">
          {t("linkDialogTitle")}
        </h2>

        {/* mm:I1002:12682;1002:12501 */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <label htmlFor={textId} className={labelClass}>
            {t("linkTextLabel")}
          </label>
          <input
            ref={textRef}
            id={textId}
            value={text}
            maxLength={LINK_TEXT_MAX}
            onChange={(event) => setText(event.target.value)}
            onBlur={(event) => setTextError(validateText(event.target.value))}
            aria-invalid={textError ? true : undefined}
            aria-describedby={textError ? `${textId}-error` : undefined}
            className={fieldClass}
          />
        </div>
        {textError && (
          <p id={`${textId}-error`} role="alert" className="-mt-6 text-sm font-bold text-kudos-required-mark">
            {textError}
          </p>
        )}

        {/* mm:I1002:12682;1002:12652 */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <label htmlFor={urlId} className={labelClass}>
            {t("linkUrlLabel")}
          </label>
          <input
            id={urlId}
            type="url"
            inputMode="url"
            value={url}
            maxLength={LINK_URL_MAX}
            placeholder={t("linkPromptMessage")}
            onChange={(event) => setUrl(event.target.value)}
            onBlur={(event) => setUrlError(validateUrl(event.target.value))}
            aria-invalid={urlError ? true : undefined}
            aria-describedby={urlError ? `${urlId}-error` : undefined}
            className={fieldClass}
          />
        </div>
        {urlError && (
          <p id={`${urlId}-error`} role="alert" className="-mt-6 text-sm font-bold text-kudos-required-mark">
            {urlError}
          </p>
        )}

        {/* mm:I1002:12682;1002:12543 */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-stretch">
          {/* mm:I1002:12682;1002:12544 */}
          <button
            type="button"
            onClick={onCancel}
            className="flex cursor-pointer items-center justify-center gap-2 rounded border border-accent-border bg-brand-yellow/10 px-10 py-4 text-base leading-6 font-bold tracking-[0.15px] text-ink transition-colors duration-200 hover:bg-brand-yellow/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transition-none"
          >
            {t("cancel")}
            <IconClose className="size-6 shrink-0" />
          </button>
          {/* mm:I1002:12682;1002:12545 */}
          <button
            type="submit"
            className="flex h-15 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-yellow p-4 text-[22px] leading-7 font-bold text-ink transition-opacity duration-200 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transition-none"
          >
            {t("linkSave")}
            <IconFormatLink className="size-6 shrink-0" />
          </button>
        </div>
      </form>
    </div>
  );
}
