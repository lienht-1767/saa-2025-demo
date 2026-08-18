"use server";

import { requireViewer, type LikeActionResult } from "@/lib/kudos/actions/action-result";
import { isUuid } from "@/lib/kudos/uuid";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

async function currentLikeCount(kudosId: string): Promise<number | undefined> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("kudos").select("like_count").eq("id", kudosId).maybeSingle();
  return typeof data?.like_count === "number" ? data.like_count : undefined;
}

export async function toggleLike(kudosId: string): Promise<LikeActionResult> {
  try {
    if (!isUuid(kudosId)) return { status: "failed" };
    const viewer = await requireViewer();
    if (!viewer) return { status: "unauthenticated" };

    const supabase = await createSupabaseServerClient();
    const insert = await supabase.from("kudos_likes").insert({ kudos_id: kudosId, user_id: viewer.userId });

    if (!insert.error) return { status: "liked", likeCount: await currentLikeCount(kudosId) };
    if (insert.error.code === "42501") return { status: "not-allowed" };
    if (insert.error.code !== "23505") {
      console.warn("[kudos/actions] Unable to like kudos.");
      return { status: "failed" };
    }

    const removed = await supabase
      .from("kudos_likes")
      .delete()
      .eq("kudos_id", kudosId)
      .eq("user_id", viewer.userId);
    if (removed.error) {
      console.warn("[kudos/actions] Unable to remove kudos like.");
      return { status: "failed" };
    }
    return { status: "unliked", likeCount: await currentLikeCount(kudosId) };
  } catch {
    console.warn("[kudos/actions] Like toggle failed unexpectedly.");
    return { status: "failed" };
  }
}
