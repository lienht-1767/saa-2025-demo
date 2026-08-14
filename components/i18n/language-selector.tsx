"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";

import { setLocale } from "@/lib/i18n/actions";
import { LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/config";
import { useMenuKeyboardNavigation } from "@/lib/hooks/use-menu-keyboard-navigation";

/**
 * Header language switcher — flag + code + chevron, opening a menu of the supported locales.
 *
 * Design: `mms_A.2_Language` (I662:14391;186:1601). Selecting a locale writes the
 * NEXT_LOCALE cookie through a Server Action, which revalidates the layout so every
 * server-rendered string re-renders in the new language.
 */
export function LanguageSelector() {
  const t = useTranslations("common");
  const activeLocale = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const close = useCallback(() => setOpen(false), []);
  const handleMenuKeyDown = useMenuKeyboardNavigation(open, menuRef, triggerRef, close);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [open]);

  function handleSelect(locale: Locale) {
    setOpen(false);
    if (locale === activeLocale) return;

    startTransition(async () => {
      await setLocale(locale);
    });
  }

  const active = LOCALE_LABELS[activeLocale];

  return (
    <div ref={containerRef} className="relative h-14 w-[108px] shrink-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={isPending}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("languageLabel")}
        className="flex h-full w-full cursor-pointer items-center justify-center gap-1 rounded-md text-base font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-60"
      >
        <Image src={active.flag} alt="" width={24} height={24} aria-hidden />
        <span>{active.code}</span>
        <Image
          src="/images/login/chevron-down.svg"
          alt=""
          width={20}
          height={20}
          aria-hidden
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          ref={menuRef}
          role="menu"
          aria-label={t("chooseLanguage")}
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 z-50 mt-2 min-w-40 overflow-hidden rounded-lg bg-surface-dark py-1 shadow-lg ring-1 ring-white/15"
        >
          {SUPPORTED_LOCALES.map((locale) => {
            const label = LOCALE_LABELS[locale];
            const isActive = locale === activeLocale;

            return (
              <li key={locale} role="none">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActive}
                  onClick={() => handleSelect(locale)}
                  className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-white transition-colors hover:bg-white/10 ${
                    isActive ? "font-semibold" : "font-normal"
                  }`}
                >
                  <Image src={label.flag} alt="" width={20} height={14} aria-hidden />
                  <span>{label.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
