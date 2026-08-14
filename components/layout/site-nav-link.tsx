import Link from "next/link";

/**
 * One navigation link, shared by the header (A1.2–A1.5) and the footer (7.2–7.5).
 *
 * The design ships three variants of the same component set (186:1426):
 *   normal    — white label, 4px radius, no fill                  (A1.5 / I2167:9091;186:1593)
 *   hover     — 10% brand-yellow fill + the glow text-shadow      (7.3 / I5001:14800;342:1411)
 *   selected  — brand-yellow label + 1px brand-yellow underline   (A1.2 / I2167:9091;186:1579)
 * Padding is a flat 16px in every variant; only the type scale differs between the two bars.
 */
export type SiteNavLinkProps = {
  href: string;
  label: string;
  /** Renders the selected variant — underline plus brand-yellow label. */
  selected?: boolean;
  /** `sm` = header (14px/20px), `md` = footer (16px/24px). */
  size?: "sm" | "md";
};

const BASE =
  "inline-flex items-center gap-1 p-4 text-center font-bold whitespace-nowrap transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow";

const SELECTED =
  "border-b border-brand-yellow text-brand-yellow [text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287]";

const IDLE =
  "rounded text-white hover:bg-brand-yellow/10 hover:[text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287]";

export function SiteNavLink({ href, label, selected = false, size = "sm" }: SiteNavLinkProps) {
  const typography =
    size === "sm" ? "text-sm leading-5 tracking-[0.1px]" : "text-base leading-6 tracking-[0.15px]";

  return (
    <Link
      href={href}
      aria-current={selected ? "page" : undefined}
      className={`${BASE} ${typography} ${selected ? SELECTED : IDLE}`}
    >
      {label}
    </Link>
  );
}
