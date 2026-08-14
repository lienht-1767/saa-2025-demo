import { beforeEach, describe, expect, it, vi } from "vitest";

const cookiesMock = vi.fn();
const createClientMock = vi.fn();

vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("@/lib/supabase/server-client", () => ({
  createSupabaseServerClient: createClientMock,
}));

const { getCurrentProfile } = await import("@/lib/auth/profile");

describe("getCurrentProfile", () => {
  beforeEach(() => {
    cookiesMock.mockReset();
    createClientMock.mockReset();
  });

  it("short-circuits guests before constructing a Supabase client", async () => {
    cookiesMock.mockResolvedValue({ getAll: () => [{ name: "NEXT_LOCALE", value: "vi" }] });

    await expect(getCurrentProfile()).resolves.toBeNull();
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("uses the validated user and maps an admin profile", async () => {
    cookiesMock.mockResolvedValue({
      getAll: () => [{ name: "sb-demo-auth-token", value: "opaque" }],
    });
    const profileQuery = {
      select: vi.fn(),
      eq: vi.fn(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          id: "user-1",
          email: "admin@example.com",
          full_name: "Admin Sunner",
          avatar_url: null,
          role: "admin",
        },
        error: null,
      }),
    };
    profileQuery.select.mockReturnValue(profileQuery);
    profileQuery.eq.mockReturnValue(profileQuery);
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1", email: "admin@example.com", user_metadata: {} } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue(profileQuery),
    });

    await expect(getCurrentProfile()).resolves.toMatchObject({
      userId: "user-1",
      email: "admin@example.com",
      fullName: "Admin Sunner",
      role: "admin",
    });
  });

  it("degrades a missing profile to the least-privileged member role", async () => {
    cookiesMock.mockResolvedValue({
      getAll: () => [{ name: "sb-demo-auth-token.0", value: "opaque" }],
    });
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-2",
              email: "member@example.com",
              user_metadata: { full_name: "Member Sunner" },
            },
          },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue(query),
    });

    await expect(getCurrentProfile()).resolves.toMatchObject({
      userId: "user-2",
      fullName: "Member Sunner",
      role: "member",
    });
  });
});
