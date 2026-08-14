import { getFormatter } from "next-intl/server";

import type { NotificationItem } from "@/components/layout/notification-bell";
import { getCurrentProfile, getRecentNotifications } from "@/lib/auth/profile";

export type HeaderSession = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  displayName: string | undefined;
  unreadNotificationCount: number;
  notifications: readonly NotificationItem[];
};

const GUEST_HEADER: HeaderSession = {
  isAuthenticated: false,
  isAdmin: false,
  displayName: undefined,
  unreadNotificationCount: 0,
  notifications: [],
};

export async function getHeaderSession(): Promise<HeaderSession> {
  const profile = await getCurrentProfile();
  if (!profile) return GUEST_HEADER;

  const [{ unreadCount, rows }, formatter] = await Promise.all([
    getRecentNotifications(profile.userId),
    getFormatter(),
  ]);

  return {
    isAuthenticated: true,
    isAdmin: profile.role === "admin",
    displayName: profile.fullName ?? profile.email,
    unreadNotificationCount: unreadCount,
    notifications: rows.map((row) => ({
      id: row.id,
      title: row.title,
      timestamp: formatter.dateTime(new Date(row.createdAt), {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      read: row.readAt !== null,
      href: toSafeInternalHref(row.link),
    })),
  };
}

export function toSafeInternalHref(value: string | null): string | undefined {
  if (!value?.startsWith("/") || /[\\\u0000-\u001f\u007f]/.test(value)) return undefined;

  try {
    const trustedOrigin = "https://saa.internal";
    const parsed = new URL(value, trustedOrigin);
    if (parsed.origin !== trustedOrigin || parsed.pathname.startsWith("//")) return undefined;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return undefined;
  }
}
