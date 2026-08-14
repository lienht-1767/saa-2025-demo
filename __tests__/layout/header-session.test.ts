import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentProfileMock = vi.fn();
const getRecentNotificationsMock = vi.fn();
const dateTimeMock = vi.fn(() => "14/08/2026");

vi.mock("@/lib/auth/profile", () => ({
  getCurrentProfile: getCurrentProfileMock,
  getRecentNotifications: getRecentNotificationsMock,
}));
vi.mock("next-intl/server", () => ({
  getFormatter: async () => ({ dateTime: dateTimeMock }),
}));

const { getHeaderSession, toSafeInternalHref } = await import("@/lib/layout/header-session");

describe("getHeaderSession", () => {
  beforeEach(() => {
    getCurrentProfileMock.mockReset();
    getRecentNotificationsMock.mockReset();
    dateTimeMock.mockClear();
  });

  it("returns an anonymous header bag without reading notifications", async () => {
    getCurrentProfileMock.mockResolvedValue(null);

    await expect(getHeaderSession()).resolves.toEqual({
      isAuthenticated: false,
      isAdmin: false,
      displayName: undefined,
      unreadNotificationCount: 0,
      notifications: [],
    });
    expect(getRecentNotificationsMock).not.toHaveBeenCalled();
  });

  it("maps profile, role and notification rows for the shared header", async () => {
    getCurrentProfileMock.mockResolvedValue({
      userId: "user-1",
      email: "admin@example.com",
      fullName: "Admin Sunner",
      avatarUrl: null,
      role: "admin",
    });
    getRecentNotificationsMock.mockResolvedValue({
      unreadCount: 1,
      rows: [
        {
          id: "notification-1",
          title: "Nomination opened",
          body: null,
          link: null,
          readAt: null,
          createdAt: "2026-08-14T00:00:00.000Z",
        },
      ],
    });

    await expect(getHeaderSession()).resolves.toMatchObject({
      isAuthenticated: true,
      isAdmin: true,
      displayName: "Admin Sunner",
      unreadNotificationCount: 1,
      notifications: [{ id: "notification-1", title: "Nomination opened", read: false }],
    });
  });
});

describe("toSafeInternalHref", () => {
  it("accepts app-relative paths and rejects external or protocol-relative destinations", () => {
    expect(toSafeInternalHref("/awards#top-talent")).toBe("/awards#top-talent");
    expect(toSafeInternalHref("//evil.example/path")).toBeUndefined();
    expect(toSafeInternalHref("/\\evil.example/path")).toBeUndefined();
    expect(toSafeInternalHref("/%2e%2e//evil.example")).toBeUndefined();
    expect(toSafeInternalHref("javascript:alert(1)")).toBeUndefined();
    expect(toSafeInternalHref(null)).toBeUndefined();
  });
});
