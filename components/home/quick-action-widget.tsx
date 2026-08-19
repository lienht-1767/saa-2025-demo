"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { IconClose } from "@/components/kudos/kudos-icons";
import { IconPen } from "@/components/ui/icons";
import { useDismissOnOutside } from "@/lib/hooks/use-dismiss-on-outside";

/**
 * `mms_6_Widget Button` — collapsed on MoMorph `_hphd32jN2` (Figma `313:9138`), expanded on
 * `Sv7DFwBw1h` (`313:9140`).
 *
 * Collapsed: a 106x64 pill, 100px radius, #FFEA9E fill, 16px padding, shadow
 * `0 4px 4px rgba(0,0,0,.25), 0 0 6px #FAE287`. Inside, 8px apart: the 24x24 pen glyph
 * (`MM_MEDIA_Pen`), a "/" separator at 24px/32px 700 #00101A, and the 24x24 Kudos mark
 * (`MM_MEDIA_Kudos Logo`).
 *
 * Expanded (`313:9140`): a right-aligned 20px-gap column replacing the pill with three controls —
 * `A_Button thể lệ` (149x64, 4px radius, brand-yellow, logo glyph + "Thể lệ" at 24/32 700),
 * `B_Button viết kudos` (214x64, same treatment, pen glyph + "Viết KUDOS"), and
 * `C_Button huỷ` (56x56, 100px radius, #D4271D, white close glyph) which collapses the group.
 * Esc and a click outside also collapse it — TC ID-30..35.
 *
 * `rulesHref` is optional because the "Thể lệ" screen (MoMorph `b1Filzi9i6`) has no route yet;
 * without it the control renders `aria-disabled`, the same treatment the composer toolbar gives
 * its "Tiêu chuẩn cộng đồng" link.
 */
export type QuickActionWidgetProps = {
  /** Destination for `B_Button viết kudos`. The board hosts the composer dialog. */
  composerHref?: string;
  /** Destination for `A_Button thể lệ`. Omit while the rules screen is unbuilt. */
  rulesHref?: string;
};

const ACTION_CLASS =
  "flex h-16 items-center gap-2 rounded bg-brand-yellow px-4 text-2xl leading-8 font-bold whitespace-nowrap text-ink shadow-[0_4px_4px_0_rgba(0,0,0,0.25),0_0_6px_0_#FAE287] transition-shadow duration-200 hover:shadow-[0_6px_10px_0_rgba(0,0,0,0.35),0_0_10px_0_#FAE287] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow motion-reduce:transition-none";

export function QuickActionWidget({ composerHref = "/kudos", rulesHref }: QuickActionWidgetProps) {
  const t = useTranslations("home.widget");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useDismissOnOutside(open, containerRef, close);

  return (
    <div ref={containerRef} className="fixed right-4 bottom-6 z-50 md:right-5">
      {open ? (
        /* mm:313:9140 */
        <div role="group" aria-label={t("label")} className="flex flex-col items-end gap-5">
          {/* mm:I313:9140;214:3799 */}
          {rulesHref ? (
            <Link href={rulesHref} onClick={close} className={ACTION_CLASS}>
              <Image src="/images/home/kudos-logo.svg" alt="" aria-hidden width={24} height={24} className="size-6 shrink-0" />
              {t("rules")}
            </Link>
          ) : (
            <span aria-disabled="true" className={`${ACTION_CLASS} cursor-not-allowed opacity-60`}>
              <Image src="/images/home/kudos-logo.svg" alt="" aria-hidden width={24} height={24} className="size-6 shrink-0" />
              {t("rules")}
            </span>
          )}

          {/* mm:I313:9140;214:3732 */}
          <Link href={composerHref} onClick={close} className={ACTION_CLASS}>
            <IconPen className="shrink-0" />
            {t("writeKudos")}
          </Link>

          {/* mm:I313:9140;214:3827 */}
          <button
            type="button"
            onClick={close}
            aria-label={t("close")}
            aria-expanded
            className="flex size-14 cursor-pointer items-center justify-center rounded-full bg-badge-danger text-white shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] transition-transform duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none motion-reduce:hover:scale-100"
          >
            <IconClose className="size-6 shrink-0" />
          </button>
        </div>
      ) : (
        /* mm:I5022:15169;214:3839 */
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          aria-label={t("label")}
          className="flex h-16 w-[106px] cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-yellow p-4 text-ink shadow-[0_4px_4px_0_rgba(0,0,0,0.25),0_0_6px_0_#FAE287] transition-transform duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow motion-reduce:transition-none motion-reduce:hover:scale-100"
        >
          {/* mm:I5022:15169;214:3839;186:1935 */}
          <span className="flex items-center gap-2">
            <IconPen className="shrink-0" />
            <span className="text-2xl leading-8 font-bold">/</span>
          </span>
          {/* mm:I5022:15169;214:3839;186:1766 */}
          <Image
            src="/images/home/icon-kudos-mark.svg"
            alt=""
            aria-hidden
            width={24}
            height={24}
            className="size-6 shrink-0"
          />
        </button>
      )}
    </div>
  );
}
