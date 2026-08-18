import { beforeEach, describe, expect, it, vi } from "vitest";

const cookiesMock = vi.fn();
const createClientMock = vi.fn();

vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("@/lib/supabase/server-client", () => ({
  createSupabaseServerClient: createClientMock,
}));

const { getCurrentProfile } = await import("@/lib/auth/profile");

function buildProfileQuery(result: { data: unknown; error: unknown }) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  return query;
}

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

  it("never selects email or role from profiles — those columns are granted to nobody", async () => {
    cookiesMock.mockResolvedValue({
      getAll: () => [{ name: "sb-demo-auth-token", value: "opaque" }],
    });
    const profileQuery = buildProfileQuery({
      data: { id: "user-1", full_name: "Admin Sunner", avatar_url: null },
      error: null,
    });
    const rpc = vi.fn().mockResolvedValue({ data: "admin", error: null });
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1", email: "admin@example.com", user_metadata: {} } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue(profileQuery),
      rpc,
    });

    await getCurrentProfile();

    expect(profileQuery.select).toHaveBeenCalledWith("id,full_name,avatar_url");
    const selectArg = profileQuery.select.mock.calls[0][0] as string;
    expect(selectArg).not.toMatch(/\bemail\b/);
    expect(selectArg).not.toMatch(/\brole\b/);
  });

  it("row present, RPC returns admin → role admin, email from auth.getUser()", async () => {
    cookiesMock.mockResolvedValue({
      getAll: () => [{ name: "sb-demo-auth-token", value: "opaque" }],
    });
    const profileQuery = buildProfileQuery({
      data: { id: "user-1", full_name: "Admin Sunner", avatar_url: null },
      error: null,
    });
    const rpc = vi.fn().mockResolvedValue({ data: "admin", error: null });
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1", email: "admin@example.com", user_metadata: {} } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue(profileQuery),
      rpc,
    });

    await expect(getCurrentProfile()).resolves.toMatchObject({
      userId: "user-1",
      email: "admin@example.com",
      fullName: "Admin Sunner",
      role: "admin",
    });
    expect(rpc).toHaveBeenCalledWith("current_user_role");
  });

  it("row present, RPC errors → degrades to member, never admin", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    cookiesMock.mockResolvedValue({
      getAll: () => [{ name: "sb-demo-auth-token", value: "opaque" }],
    });
    const profileQuery = buildProfileQuery({
      data: { id: "user-1", full_name: "Admin Sunner", avatar_url: null },
      error: null,
    });
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: "permission denied" } });
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1", email: "admin@example.com", user_metadata: {} } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue(profileQuery),
      rpc,
    });

    await expect(getCurrentProfile()).resolves.toMatchObject({
      userId: "user-1",
      role: "member",
    });
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("row absent → metadata fallback still returns a profile, role still from the RPC", async () => {
    cookiesMock.mockResolvedValue({
      getAll: () => [{ name: "sb-demo-auth-token.0", value: "opaque" }],
    });
    const profileQuery = buildProfileQuery({ data: null, error: null });
    const rpc = vi.fn().mockResolvedValue({ data: "admin", error: null });
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
      from: vi.fn().mockReturnValue(profileQuery),
      rpc,
    });

    await expect(getCurrentProfile()).resolves.toMatchObject({
      userId: "user-2",
      email: "member@example.com",
      fullName: "Member Sunner",
      role: "admin",
    });
  });

  it("auth.getUser() errors → resolves to null", async () => {
    cookiesMock.mockResolvedValue({
      getAll: () => [{ name: "sb-demo-auth-token", value: "opaque" }],
    });
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: "invalid session" },
        }),
      },
      from: vi.fn(),
      rpc: vi.fn(),
    });

    await expect(getCurrentProfile()).resolves.toBeNull();
  });
});
