import { cookies } from "next/headers";

import { hasSupabaseAuthCookie } from "@/lib/auth/session-cookie";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export type UserRole = "member" | "admin";

export type SessionProfile = {
  userId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
};

export type NotificationRow = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

type ProfileDatabaseRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

type NotificationDatabaseRow = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

/**
 * `profiles.email`/`profiles.role` are granted to nobody through PostgREST — see
 * `supabase/migrations/20260817090100_create_profiles.sql` and `clarifications.md` § Session
 * 2026-08-17 (vòng 3). Do not add either column back to the select below; a `42501` from
 * PostgREST is the intended failure mode if someone tries.
 *
 * `email` is sourced from `auth.getUser()` (already fetched above); `role` is sourced from the
 * `current_user_role()` RPC, which fails closed to `"member"` — see `resolveRole`.
 */
const PROFILE_SELECT_COLUMNS = "id,full_name,avatar_url";

/** Reduces the `current_user_role()` RPC result to a role, defaulting to the least-privileged
 * `"member"` on any error or unexpected shape. A privilege escalation must never come from a
 * degraded read, so this never returns `"admin"` unless the RPC explicitly said so. */
function resolveRole(result: { data: unknown; error: { message: string } | null }): UserRole {
  if (result.error) {
    console.warn("[auth/profile] current_user_role() RPC failed; using member fallback.");
    return "member";
  }
  return result.data === "admin" ? "admin" : "member";
}

/** Validates the request user, then reads their own RLS-protected profile. Never throws. */
export async function getCurrentProfile(): Promise<SessionProfile | null> {
  try {
    const cookieStore = await cookies();
    if (!hasSupabaseAuthCookie(cookieStore.getAll().map(({ name }) => name))) return null;

    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const user = authData.user;
    if (authError || !user) return null;

    const email = user.email ?? "";

    const [{ data, error }, roleResult] = await Promise.all([
      supabase
        .from("profiles")
        .select(PROFILE_SELECT_COLUMNS)
        .eq("id", user.id)
        .maybeSingle<ProfileDatabaseRow>(),
      supabase.rpc("current_user_role"),
    ]);
    const role = resolveRole(roleResult);

    if (error || !data) {
      if (error) console.warn("[auth/profile] Profile query failed; using metadata fallback.");
      return {
        userId: user.id,
        email,
        fullName:
          typeof user.user_metadata.full_name === "string"
            ? user.user_metadata.full_name
            : typeof user.user_metadata.name === "string"
              ? user.user_metadata.name
              : null,
        avatarUrl:
          typeof user.user_metadata.avatar_url === "string"
            ? user.user_metadata.avatar_url
            : typeof user.user_metadata.picture === "string"
              ? user.user_metadata.picture
              : null,
        role,
      };
    }

    return {
      userId: data.id,
      email,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      role,
    };
  } catch {
    console.warn("[auth/profile] Unable to resolve the current profile.");
    return null;
  }
}

/** Reads only the validated user's rows; RLS is the security boundary and this filter is an optimisation. */
export async function getRecentNotifications(
  userId: string,
  limit = 10,
): Promise<{ unreadCount: number; rows: NotificationRow[] }> {
  try {
    const supabase = await createSupabaseServerClient();
    const [recentResult, unreadResult] = await Promise.all([
      supabase
        .from("notifications")
        .select("id,title,body,link,read_at,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .is("read_at", null),
    ]);

    if (recentResult.error || unreadResult.error) {
      console.warn("[auth/profile] Notification query failed; using an empty feed.");
      return { unreadCount: 0, rows: [] };
    }

    const rows = ((recentResult.data ?? []) as NotificationDatabaseRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      link: row.link,
      readAt: row.read_at,
      createdAt: row.created_at,
    }));

    return { unreadCount: unreadResult.count ?? 0, rows };
  } catch {
    console.warn("[auth/profile] Unable to read notifications; using an empty feed.");
    return { unreadCount: 0, rows: [] };
  }
}
