"use client";

import Image from "next/image";
import { useState } from "react";

import { KudosLightbox } from "@/components/kudos/kudos-lightbox";
import type { KudosFeedAttachment } from "@/lib/kudos/types";

/**
 * `C.3.6_Image đính kèm` (node `256:5176`): up to 5 square thumbnails in a left-aligned row.
 * Clicking one opens the full-size `KudosLightbox` (spec: "Click ảnh: mở full ảnh lớn").
 */
export type KudosFeedAttachmentsProps = { attachments: readonly KudosFeedAttachment[] };

const MAX_ATTACHMENTS = 5;

export function KudosFeedAttachments({ attachments }: KudosFeedAttachmentsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const visible = attachments.slice(0, MAX_ATTACHMENTS);

  if (visible.length === 0) return null;

  return (
    <>
      <div className="flex w-full flex-wrap items-center gap-2">
        {visible.map((attachment, index) => (
          <button
            key={attachment.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="size-20 shrink-0 overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
          >
            <Image src={attachment.url} alt={attachment.alt} width={80} height={80} className="size-full object-cover" />
          </button>
        ))}
      </div>

      {openIndex !== null && visible[openIndex] && (
        <KudosLightbox attachment={visible[openIndex]} onClose={() => setOpenIndex(null)} />
      )}
    </>
  );
}
