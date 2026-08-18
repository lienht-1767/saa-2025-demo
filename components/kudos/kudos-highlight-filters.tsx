"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { KudosFilterDropdown } from "@/components/kudos/kudos-filter-dropdown";
import type { KudosFilterOption } from "@/lib/kudos/types";

/**
 * `B.1_header` "Buttons" row (node `2940:13458`) — the Hashtag and Phòng ban filter dropdowns
 * side by side, 8px apart. Selecting either notifies the parent so it can refetch the highlight
 * carousel and all-kudos feed (spec B.1: "lọc nội dung tương ứng (cả phần highlight kudos và all
 * kudos), cập nhật carousel và đặt pagination về 1").
 */
export type KudosHighlightFiltersProps = {
  hashtagOptions: readonly KudosFilterOption[];
  departmentOptions: readonly KudosFilterOption[];
  selectedHashtagId: string | null;
  selectedDepartmentId: string | null;
  onFilterChange?: (filter: { hashtagId: string | null; departmentId: string | null }) => void;
};

export function KudosHighlightFilters({
  hashtagOptions,
  departmentOptions,
  selectedHashtagId,
  selectedDepartmentId,
  onFilterChange,
}: KudosHighlightFiltersProps) {
  const t = useTranslations("kudosBoard.highlight");
  const propKey = `${selectedHashtagId ?? ""}|${selectedDepartmentId ?? ""}`;
  const [syncedPropKey, setSyncedPropKey] = useState(propKey);
  const [selection, setSelection] = useState({
    hashtagId: selectedHashtagId,
    departmentId: selectedDepartmentId,
  });

  // Keep the selected labels responsive while the server navigation is pending,
  // then reconcile them with back/forward navigation or a new URL filter pair.
  if (propKey !== syncedPropKey) {
    setSyncedPropKey(propKey);
    setSelection({ hashtagId: selectedHashtagId, departmentId: selectedDepartmentId });
  }

  return (
    /* mm:2940:13458 */
    <div className="flex items-center gap-2">
      <KudosFilterDropdown
        label={t("hashtagFilter")}
        options={hashtagOptions}
        selectedId={selection.hashtagId}
        triggerClassName="w-[136px]"
        onSelect={(nextId) => {
          const next = { hashtagId: nextId, departmentId: selection.departmentId };
          setSelection(next);
          onFilterChange?.(next);
        }}
      />
      <KudosFilterDropdown
        label={t("departmentFilter")}
        options={departmentOptions}
        selectedId={selection.departmentId}
        triggerClassName="w-[158px]"
        onSelect={(nextId) => {
          const next = { hashtagId: selection.hashtagId, departmentId: nextId };
          setSelection(next);
          onFilterChange?.(next);
        }}
      />
    </div>
  );
}
