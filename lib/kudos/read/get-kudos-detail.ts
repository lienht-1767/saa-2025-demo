import { toPersonRef } from "@/lib/kudos/read/map-board-data";
import type { KudosPersonRef } from "@/lib/kudos/types";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type DetailRow = {
  id: string;
  message: string;
  created_at: string;
  like_count: number;
  sender: Parameters<typeof toPersonRef>[0];
  recipient: Parameters<typeof toPersonRef>[0];
};

export type KudosDetail = {
  id: string;
  message: string;
  createdAt: string;
  likeCount: number;
  sender: KudosPersonRef;
  recipient: KudosPersonRef;
};

export async function getKudosDetail(id: string): Promise<KudosDetail | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const profile = "id, full_name, avatar_url, kudos_received_count, department:departments(name)";
    const { data, error } = await supabase
      .from("kudos")
      .select(`id, message, created_at, like_count, sender:profiles!kudos_sender_id_fkey(${profile}), recipient:profiles!kudos_recipient_id_fkey(${profile})`)
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    const row = data as unknown as DetailRow;
    return { id: row.id, message: row.message, createdAt: row.created_at, likeCount: row.like_count, sender: toPersonRef(row.sender), recipient: toPersonRef(row.recipient) };
  } catch {
    return null;
  }
}
