import { useTranslations } from "next-intl";

import type { CopyLinkStatus } from "@/lib/kudos/use-copy-link";

/**
 * Transient confirmation next to a "Copy Link" button — spec B.4.4/C.4.2: "hiện toast xác nhận
 * 'Link copied — ready to share!'". Rendered per-action-row rather than as one global toast
 * manager, since any of several cards on the page can trigger it independently (YAGNI: no shared
 * toast queue needed for a single-line confirmation).
 */
export type KudosCopyToastProps = { status: CopyLinkStatus };

export function KudosCopyToast({ status }: KudosCopyToastProps) {
  const t = useTranslations("kudosBoard.actions");

  if (status === "idle") return null;

  return (
    <span role="status" aria-live="polite" className={status === "error" ? "text-badge-danger" : "text-brand-yellow"}>
      {status === "error" ? t("copyLinkError") : t("copyLinkToast")}
    </span>
  );
}
