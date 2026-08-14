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
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
};

type NotificationDatabaseRow = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

/** Validates the request user, then reads their own RLS-protected profile. Never throws. */
export async function getCurrentProfile(): Promise<SessionProfile | null> {
  try {
    const cookieStore = await cookies();
    if (!hasSupabaseAuthCookie(cookieStore.getAll().map(({ name }) => name))) return null;

    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const user = authData.user;
    if (authError || !user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,full_name,avatar_url,role")
      .eq("id", user.id)
      .maybeSingle<ProfileDatabaseRow>();

    if (error || !data) {
      if (error) console.warn("[auth/profile] Profile query failed; using member fallback.");
      return {
        userId: user.id,
        email: user.email ?? "",
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
        role: "member",
      };
    }

    return {
      userId: data.id,
      email: data.email,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      role: data.role,
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
