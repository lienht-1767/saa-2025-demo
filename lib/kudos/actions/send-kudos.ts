"use server";

import { revalidatePath } from "next/cache";

import { requireViewer, type SendKudosActionResult } from "@/lib/kudos/actions/action-result";
import { validateSendKudosInput } from "@/lib/kudos/actions/send-kudos-validation";
import { sanitizeKudosHtml } from "@/lib/kudos/sanitize-kudos-html";
import type { KudosComposerInput } from "@/lib/kudos/types";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function sendKudos(input: KudosComposerInput): Promise<SendKudosActionResult> {
  try {
    const viewer = await requireViewer();
    if (!viewer) return { status: "unauthenticated" };

    // Sanitize once, then validate and store the SAME sanitized value — see
    // `validateSendKudosInput`'s doc comment for why the order matters (an all-markup message
    // must sanitize to empty and fail as "required", not slip through on its raw length).
    const sanitizedMessage = sanitizeKudosHtml(input.message);
    const sanitizedInput: KudosComposerInput = { ...input, message: sanitizedMessage };
    const fieldErrors = validateSendKudosInput(sanitizedInput, viewer.userId);
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
        title: input.title.trim(),
        message: sanitizedMessage,
        // Server never trusts the client on this: force null here regardless of what the
        // payload's anonymousName carried when isAnonymous is false.
        is_anonymous: input.isAnonymous,
        anonymous_name: input.isAnonymous ? input.anonymousName!.trim() : null,
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
