"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { KudosAvatar } from "@/components/kudos/kudos-avatar";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export type RecipientOption = { id: string; name: string; avatarUrl: string | null };

export function KudosComposerRecipientPicker({
  viewerId,
  value,
  onChange,
}: {
  viewerId: string;
  value: RecipientOption | null;
  onChange: (recipient: RecipientOption | null) => void;
}) {
  const t = useTranslations("kudosBoard.composer");
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<RecipientOption[]>([]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      const supabase = createSupabaseBrowserClient();
      let request = supabase.from("profiles").select("id, full_name, avatar_url").neq("id", viewerId).limit(10);
      if (query.trim()) request = request.ilike("full_name", `%${query.trim()}%`);
      const { data } = await request;
      if (active) setOptions((data ?? []).map((row) => ({ id: row.id, name: row.full_name ?? "Sunner", avatarUrl: row.avatar_url })));
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, viewerId]);

  return (
    <div className="relative">
      <input
        type="search"
        value={value ? value.name : query}
        onChange={(event) => {
          onChange(null);
          setQuery(event.target.value);
        }}
        placeholder={t("recipientPlaceholder")}
        className="h-12 w-full rounded-lg border border-accent-border bg-white/5 px-4 text-white placeholder:text-white/50 focus:outline-2 focus:outline-brand-yellow"
        aria-autocomplete="list"
      />
      {!value && options.length > 0 && (
        <ul className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-lg border border-accent-border bg-surface-dark p-2 shadow-xl">
          {options.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => onChange(option)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-white hover:bg-white/10"
              >
                <KudosAvatar name={option.name} avatarUrl={option.avatarUrl} size={36} />
                <span>{option.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
