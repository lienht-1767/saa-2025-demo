"use server";

import { revalidatePath } from "next/cache";

import { requireViewer, type SendKudosActionResult } from "@/lib/kudos/actions/action-result";
import { validateSendKudosInput } from "@/lib/kudos/actions/send-kudos-validation";
import type { KudosComposerInput } from "@/lib/kudos/types";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function sendKudos(input: KudosComposerInput): Promise<SendKudosActionResult> {
  try {
    const viewer = await requireViewer();
    if (!viewer) return { status: "unauthenticated" };
    const fieldErrors = validateSendKudosInput(input, viewer.userId);
    if (Object.keys(fieldErrors).length > 0) return { status: "validation-error", fieldErrors };

    const supabase = await createSupabaseServerClient();
    const recipient = await supabase
      .from("profiles")
      .select("department_id")
      .eq("id", input.recipientId)
      .maybeSingle();
    if (recipient.error || !recipient.data) return { status: "validation-error", fieldErrors: { recipientId: "required" } };

    const created = await supabase
      .from("kudos")
      .insert({
        sender_id: viewer.userId,
        recipient_id: input.recipientId,
        department_id: recipient.data.department_id,
        message: input.message.trim(),
      })
      .select("id")
      .single();
    if (created.error || !created.data) {
      console.warn("[kudos/actions] Unable to create kudos.");
      return { status: created.error?.code === "42501" ? "validation-error" : "failed" };
    }

    const childResults = await Promise.all([
      input.hashtagIds.length
        ? supabase.from("kudos_hashtags").insert(input.hashtagIds.map((hashtagId) => ({ kudos_id: created.data.id, hashtag_id: hashtagId })))
        : Promise.resolve({ error: null }),
      input.imageUrls.length
        ? supabase.from("kudos_images").insert(input.imageUrls.map((url, position) => ({ kudos_id: created.data.id, url, position })))
        : Promise.resolve({ error: null }),
    ]);
    revalidatePath("/kudos");
    const partial = childResults.some((result) => result.error);
    if (partial) console.warn("[kudos/actions] Kudos created with one or more missing attachments.");
    return { status: partial ? "partial" : "sent", kudosId: created.data.id };
  } catch {
    console.warn("[kudos/actions] Send kudos failed unexpectedly.");
    return { status: "failed" };
  }
}
