"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import { IconClose } from "@/components/kudos/kudos-icons";
import type { KudosFeedAttachment } from "@/lib/kudos/types";

/** Full-size viewer for a kudos post's attachment gallery (spec C.3.6: "Click ảnh: mở full ảnh lớn"). */
export type KudosLightboxProps = {
  attachment: KudosFeedAttachment;
  onClose: () => void;
};

export function KudosLightbox({ attachment, onClose }: KudosLightboxProps) {
  const t = useTranslations("kudosBoard.common");
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={attachment.alt}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
      onClick={onClose}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label={t("closeLightbox")}
        className="absolute top-6 right-6 flex size-10 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
      >
        <IconClose className="size-6" />
      </button>
      <Image
        src={attachment.url}
        alt={attachment.alt}
        width={1200}
        height={900}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[85vh] w-auto max-w-[90vw] rounded-lg object-contain"
      />
    </div>
  );
}
