/**
 * Site navigation model shared by the header (`mms_A1_Header`, 2167:9091) and the footer
 * (`mms_7_Footer`, 5001:14800). The two share three destinations; the footer adds a fourth.
 *
 * `labelKey` resolves under the `common.nav` next-intl namespace, so the link text is
 * translated rather than hard-coded from the Figma copy.
 */
export type NavLink = {
  /** Stable identifier — also the next-intl key under `common.nav`. */
  labelKey: "aboutSaa" | "awardInformation" | "sunKudos" | "generalStandards";
  href: string;
};

/** A1.2–A1.5 — three links, left-aligned next to the logo. */
export const HEADER_NAV_LINKS: readonly NavLink[] = [
  { labelKey: "aboutSaa", href: "/" },
  { labelKey: "awardInformation", href: "/awards" },
  { labelKey: "sunKudos", href: "/kudos" },
] as const;

/**
 * 7.2–7.5 — the header set plus "Tiêu chuẩn chung". The destination for that last one is not
 * settled in the design (see `clarifications.md` → Unresolved); it is parked on the `/awards`
 * stub as an anchor until the owning page exists.
 */
export const FOOTER_NAV_LINKS: readonly NavLink[] = [
  ...HEADER_NAV_LINKS,
  { labelKey: "generalStandards", href: "/awards#tieu-chuan-chung" },
] as const;

/** Account menu targets (A1.8). `/admin` is only offered to admins — TC ID-36..38. */
export const ACCOUNT_LINKS = {
  profile: "/profile",
  admin: "/admin",
} as const;
