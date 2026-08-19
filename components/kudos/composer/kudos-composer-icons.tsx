import type { SVGProps } from "react";

/**
 * Toolbar-only glyphs for the composer's rich-text controls (`mms_C.1..C.6`, `MM_MEDIA_Plus`).
 * Same single-colour `fill="currentColor"` convention as `components/kudos/kudos-icons.tsx` —
 * kept local to `composer/` since these six + plus icons are not shared outside this dialog.
 */

export function IconFormatBold(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
      <path
        d="M7 5h6.5a3.75 3.75 0 0 1 2.7 6.36A4 4 0 0 1 14.5 19H7zm3 6h3.25a1.75 1.75 0 1 0 0-3.5H10zm0 5.5h3.75a2 2 0 1 0 0-4H10z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconFormatItalic(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
      <path d="M10 5h8v2h-2.6l-3 10H15v2H7v-2h2.6l3-10H10z" fill="currentColor" />
    </svg>
  );
}

export function IconFormatStrikethrough(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
      <path
        d="M4 11h16v2H4zm4.6-3.2C8.4 6.3 9.5 5 12 5c2 0 3.6 1 4.2 2.6l-1.9.7C14 7.4 13.2 7 12 7c-1.3 0-1.9.6-2 1.3zm7 8.3c.1.8-.5 1.9-2.1 1.9-1.4 0-2.4-.6-2.7-1.7l-1.9.6c.5 1.8 2.2 3.1 4.6 3.1 2.6 0 4.4-1.4 4.1-3.4z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconFormatNumberedList(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
      <path
        d="M8 5h12v2H8zm0 6h12v2H8zm0 6h12v2H8zM3 4h2v3h1v1H3V7h1V5H3zm0 8h2.5v.5H3.5v1H5V15H3v-1zm.5 5.5H5V19H3v-1h2v2.5H3v-1z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconFormatLink(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
      <path
        d="M10.6 13.4a1 1 0 0 1 0-1.4l3.4-3.4a1 1 0 1 1 1.4 1.4l-3.4 3.4a1 1 0 0 1-1.4 0M8.5 15.5 6.4 17.6a2.5 2.5 0 1 1-3.5-3.5l2.1-2.1a2.5 2.5 0 0 1 3.6 0l-1.4 1.4a.5.5 0 0 0-.7 0L4.3 15.5a.5.5 0 0 0 .7.7L7 14.1zm7-7 2.1-2.1a2.5 2.5 0 1 1 3.5 3.5l-2.1 2.1a2.5 2.5 0 0 1-3.6 0l1.4-1.4a.5.5 0 0 0 .7 0l2.1-2.1a.5.5 0 0 0-.7-.7L17 8.5z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconFormatQuote(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
      <path
        d="M7 8c-1.7 0-3 1.3-3 3v5h5v-5H7c0-1 1-2 2-2V8zm9 0c-1.7 0-3 1.3-3 3v5h5v-5h-2c0-1 1-2 2-2V8z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconPlus(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
      <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" fill="currentColor" />
    </svg>
  );
}
