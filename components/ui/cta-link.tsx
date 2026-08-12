import Link from "next/link";

import { IconArrowUpRight } from "@/components/ui/icons";

/**
 * The button-shaped link used across the homepage, from component set 186:1426.
 *
 * filled   — `mms_B3.1_Button-IC About` (2167:9063): #FFEA9E fill, #00101A label.
 * outlined — `mms_B3.2_Button-IC Kudos` (2167:9064): 1px #998C5F border over a 10% yellow fill.
 * `lg` reproduces the hero pair (padding 16px 24px, 8px radius, 22px/28px label); `md` the
 * Sun* Kudos call to action (`mms_D2.1_Button-IC`, 16px padding, 4px radius, 16px/24px label).
 *
 * The exported `MM_MEDIA_Up` glyph is a white-filled SVG; inlined here it inherits the label
 * colour so it stays legible on the yellow fill.
 */
export type CtaLinkProps = {
  href: string;
  label: string;
  variant?: "filled" | "outlined";
  size?: "lg" | "md";
};

const BASE =
  "inline-flex items-center gap-2 font-bold whitespace-nowrap transition-[background-color,box-shadow,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow motion-reduce:transition-none";

const VARIANTS = {
  filled: "bg-brand-yellow text-ink hover:bg-[#fff2c2] hover:shadow-[0_0_12px_0_#FAE287]",
  outlined:
    "border border-accent-border bg-brand-yellow/10 text-white hover:bg-brand-yellow/20 hover:border-brand-yellow",
} as const;

const SIZES = {
  lg: "rounded-lg px-6 py-4 text-[22px] leading-7",
  md: "rounded p-4 text-base leading-6 tracking-[0.15px]",
} as const;

export function CtaLink({ href, label, variant = "filled", size = "lg" }: CtaLinkProps) {
  return (
    <Link href={href} className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]}`}>
      {label}
      <IconArrowUpRight className="shrink-0" />
    </Link>
  );
}
