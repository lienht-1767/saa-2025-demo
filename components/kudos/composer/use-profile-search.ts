"use client";

import { useEffect, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export type ProfileSearchOption = { id: string; name: string; avatarUrl: string | null };

/**
 * Debounced `profiles` search shared by the recipient picker (`kudos-composer-recipient-picker.tsx`)
 * and the `@`-mention list (`kudos-composer-mention-list.tsx`). Extracted verbatim from the
 * recipient picker's original inline effect (query shape, 250ms debounce, `active` cleanup flag)
 * so the two call sites cannot drift apart — see phase 07 Key Insights.
 */
/**
 * `query: null` (the mention list before an `@` is typed) skips the fetch entirely instead of
 * running an unfiltered top-10 lookup nobody will see.
 */
export function useProfileSearch(query: string | null, excludeId: string): ProfileSearchOption[] {
  const [options, setOptions] = useState<ProfileSearchOption[]>([]);

  useEffect(() => {
    if (query === null) return;
    let active = true;
    const timer = window.setTimeout(async () => {
      const supabase = createSupabaseBrowserClient();
      let request = supabase.from("profiles").select("id, full_name, avatar_url").neq("id", excludeId).limit(10);
      const trimmed = query.trim();
      if (trimmed) request = request.ilike("full_name", `%${trimmed}%`);
      const { data } = await request;
      if (active) setOptions((data ?? []).map((row) => ({ id: row.id, name: row.full_name ?? "Sunner", avatarUrl: row.avatar_url })));
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, excludeId]);

  return query === null ? [] : options;
}
