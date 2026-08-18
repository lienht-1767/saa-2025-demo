"use client";

import { useEffect, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export type KudosRealtimeStatus = "live" | "reconnecting";
export const KUDOS_REFRESH_DEBOUNCE_MS = 600;
export const KUDOS_FALLBACK_POLL_MS = 30_000;

/** One bounded refetch per event burst; polling only runs while Supabase reports a broken channel. */
export function useKudosRealtime(onRefresh: () => void | Promise<void>) {
  const [status, setStatus] = useState<KudosRealtimeStatus>("live");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    let pollTimer: ReturnType<typeof setInterval> | undefined;
    const refresh = () => void Promise.resolve(onRefresh()).catch(() => setStatus("reconnecting"));
    const scheduleRefresh = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(refresh, KUDOS_REFRESH_DEBOUNCE_MS);
    };
    const setReconnecting = () => {
      setStatus("reconnecting");
      if (!pollTimer) pollTimer = setInterval(refresh, KUDOS_FALLBACK_POLL_MS);
    };
    const setLive = () => {
      setStatus("live");
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = undefined;
    };

    // Likes fan out as UPDATEs of kudos.like_count through the database trigger, so a second
    // kudos_likes subscription would duplicate events and complicate DELETE payload handling.
    const channel = supabase
      .channel("kudos-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "kudos" }, scheduleRefresh)
      .subscribe((nextStatus) => {
        if (nextStatus === "SUBSCRIBED") setLive();
        else if (nextStatus === "CHANNEL_ERROR" || nextStatus === "TIMED_OUT" || nextStatus === "CLOSED") setReconnecting();
      });

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (pollTimer) clearInterval(pollTimer);
      void supabase.removeChannel(channel);
    };
  }, [onRefresh]);

  return status;
}
