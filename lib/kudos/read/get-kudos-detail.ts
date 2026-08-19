import { sanitizeKudosHtml } from "@/lib/kudos/sanitize-kudos-html";
import { toAnonymousPersonRef, toPersonRef } from "@/lib/kudos/read/map-board-data";
import type { KudosPersonRef } from "@/lib/kudos/types";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type DetailRow = {
  id: string;
  message: string;
  created_at: string;
  like_count: number;
  title: string | null;
  is_anonymous: boolean;
  anonymous_name: string | null;
  sender: Parameters<typeof toPersonRef>[0];
  recipient: Parameters<typeof toPersonRef>[0];
};

export type KudosDetail = {
  id: string;
  /** Sanitized rich-text HTML (`sanitizeKudosHtml`) — render with `dangerouslySetInnerHTML` only. */
  messageHtml: string;
  createdAt: string;
  likeCount: number;
  /** "Danh hiệu" — `null` when the kudos carries none. */
  title: string | null;
  sender: KudosPersonRef;
  recipient: KudosPersonRef;
};

export async function getKudosDetail(id: string): Promise<KudosDetail | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const profile = "id, full_name, avatar_url, kudos_received_count, department:departments(name)";
    const { data, error } = await supabase
      .from("kudos")
      .select(
        `id, message, created_at, like_count, title, is_anonymous, anonymous_name, ` +
          `sender:profiles!kudos_sender_id_fkey(${profile}), recipient:profiles!kudos_recipient_id_fkey(${profile})`,
      )
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    const row = data as unknown as DetailRow;
    return {
      id: row.id,
      // Sanitized again on read — legacy rows predate the sanitizer (see map-board-data.ts).
      messageHtml: sanitizeKudosHtml(row.message),
      createdAt: row.created_at,
      likeCount: row.like_count,
      title: row.title,
      // Anonymity is presentational only — sender_id stays stored/PostgREST-readable regardless.
      // See `toAnonymousPersonRef`'s doc comment in map-board-data.ts.
      sender: row.is_anonymous ? toAnonymousPersonRef(row.anonymous_name) : toPersonRef(row.sender),
      recipient: toPersonRef(row.recipient),
    };
  } catch {
    return null;
  }
}
