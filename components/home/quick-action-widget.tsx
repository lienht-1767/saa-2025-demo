"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { IconPen } from "@/components/ui/icons";
import { useDismissOnOutside } from "@/lib/hooks/use-dismiss-on-outside";

/**
 * `mms_6_Widget Button` (5022:15169).
 *
 * Figma: a 106x64 pill, 100px radius, #FFEA9E fill, 16px padding, shadow
 * `0 4px 4px rgba(0,0,0,.25), 0 0 6px #FAE287`. Inside, 8px apart: the 24x24 pen glyph
 * (`MM_MEDIA_Pen`), a "/" separator at 24px/32px 700 #00101A, and the 24x24 Kudos mark
 * (`MM_MEDIA_Kudos Logo`). The design pins it to the right edge; the spec calls for it to stay
 * fixed bottom-right, which is what this does.
 *
 * The spec lists no quick actions, so `actions` defaults to empty and the menu shows its empty
 * state. Esc, a click outside, and the trigger itself all close it — TC ID-30..35.
 */
export type QuickAction = {
  id: string;
  label: string;
  href: string;
};

export type QuickActionWidgetProps = {
  actions?: readonly QuickAction[];
};

export function QuickActionWidget({ actions = [] }: QuickActionWidgetProps) {
  const t = useTranslations("home.widget");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useDismissOnOutside(open, containerRef, close);

  return (
    <div ref={containerRef} className="fixed right-4 bottom-6 z-50 md:right-5">
      {open && (
        <div
          role="menu"
          aria-label={t("label")}
          className="absolute right-0 bottom-full mb-3 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg bg-surface-dark py-2 shadow-lg ring-1 ring-white/15"
        >
          {actions.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-white/70">{t("empty")}</p>
          ) : (
            <ul>
              {actions.map((action) => (
                <li key={action.id} role="none">
                  <Link
                    href={action.href}
                    role="menuitem"
                    onClick={close}
                    className="block px-4 py-2.5 text-sm text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-yellow motion-reduce:transition-none"
                  >
                    {action.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* mm:I5022:15169;214:3839 */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
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
    </div>
  );
}
