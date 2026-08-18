import type { SVGProps } from "react";

/**
 * Single-colour icons for `/kudos`, inlined with `fill="currentColor"` so the call site sets
 * colour from context — same convention as `components/ui/icons.tsx`. MoMorph's frame export only
 * gave bounding boxes for these glyphs (no path data for `MM_MEDIA_Search`, `MM_MEDIA_Left`, etc.),
 * so the strokes below are this repo's own reasonable line-icon renderings at the evidenced 24x24
 * box, not traced from the design.
 */

export function IconSearch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
      <path
        d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 5L20.49 19zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconChevronDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
      <path d="M7 10l5 5 5-5z" fill="currentColor" />
    </svg>
  );
}

export function IconChevronLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
      <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor" />
    </svg>
  );
}

export function IconChevronRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
      <path d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z" fill="currentColor" />
    </svg>
  );
}

export function IconHeart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
      <path
        d="M12 21s-7.5-4.75-10-9.5C.6 8.2 2.4 5 5.75 5 8 5 10 6.3 12 8.5 14 6.3 16 5 18.25 5 21.6 5 23.4 8.2 22 11.5 19.5 16.25 12 21 12 21"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconCopyLink(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
      <path
        d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconArrowDetail(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
      <path d="M8.59 5.59 10 4l8 8-8 8-1.41-1.41L15.17 12z" fill="currentColor" />
    </svg>
  );
}

export function IconGift(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
      <path
        d="M20 7h-2.18a3 3 0 0 0 .18-1 3 3 0 0 0-5.5-1.65L12 5l-.5-.65A3 3 0 0 0 6 5a3 3 0 0 0 .18 2H4a2 2 0 0 0-2 2v2h20V9a2 2 0 0 0-2-2M9 3a1.5 1.5 0 0 1 1.3.75L11.19 5H9a1 1 0 0 1 0-2m6 4h-2.19l.89-1.25A1.5 1.5 0 1 1 15 7M2 13v6a2 2 0 0 0 2 2h6v-8zm11 8h6a2 2 0 0 0 2-2v-6h-8z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconZoomIn(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
      <path
        d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 5L20.49 19zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9M10 7v2h2v-2H10v2H8v-2h2V5h-2v2z"
        fill="currentColor"
      />
      <path d="M9 6h1v3h-1z" fill="currentColor" />
      <path d="M7.5 8h4v1h-4z" fill="currentColor" />
    </svg>
  );
}

export function IconZoomOut(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
      <path
        d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 5L20.49 19zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9"
        fill="currentColor"
      />
      <path d="M7.5 8h4v1h-4z" fill="currentColor" />
    </svg>
  );
}

export function IconPanZoom(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
      <path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconClose(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
      <path d="M18.3 5.71 12 12.01l-6.3-6.3-1.4 1.42 6.29 6.29-6.3 6.3 1.42 1.42 6.29-6.3 6.3 6.3 1.41-1.42-6.3-6.3 6.3-6.29z" fill="currentColor" />
    </svg>
  );
}
