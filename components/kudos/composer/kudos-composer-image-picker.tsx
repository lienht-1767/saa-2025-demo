"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { KUDOS_IMAGE_OPTIONS } from "@/lib/kudos/composer-options";

/**
 * Picker over the repo-owned `KUDOS_IMAGE_OPTIONS` (clarifications decision 4 — no file upload,
 * no Supabase Storage bucket). Opened by "+ Image"; already-attached images are excluded.
 */
export function KudosComposerImagePicker({
  excludeUrls,
  onSelect,
  onClose,
  triggerRef,
}: {
  excludeUrls: readonly string[];
  onSelect: (url: string) => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const t = useTranslations("kudosBoard.composer");
  const menuRef = useRef<HTMLDivElement>(null);
  const options = KUDOS_IMAGE_OPTIONS.filter((url) => !excludeUrls.includes(url));

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current?.contains(event.target as Node) || triggerRef.current?.contains(event.target as Node)) return;
      onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, triggerRef]);

  return (
    <div ref={menuRef} role="dialog" aria-label={t("imagePickerTitle")} className="absolute bottom-full left-0 z-30 mb-2 grid w-72 grid-cols-3 gap-2 rounded-lg border border-accent-border bg-white p-3 shadow-xl">
      {options.map((url) => (
        <button
          key={url}
          type="button"
          onClick={() => {
            onSelect(url);
            onClose();
            triggerRef.current?.focus();
          }}
          className="overflow-hidden rounded-lg border border-accent-border"
        >
          <Image src={url} alt="" width={80} height={80} className="aspect-square h-auto w-full object-cover" />
        </button>
      ))}
    </div>
  );
}
