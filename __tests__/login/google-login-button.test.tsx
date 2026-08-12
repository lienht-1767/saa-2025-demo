import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";

import vi_messages from "@/messages/vi.json";

const signInWithOAuth = vi.fn();
const createSupabaseBrowserClient = vi.fn(() => ({ auth: { signInWithOAuth } }));

vi.mock("@/lib/supabase/browser-client", () => ({
  createSupabaseBrowserClient,
}));

vi.mock("@/lib/supabase/env", () => ({
  getSupabaseEnv: () => ({
    supabaseUrl: "http://127.0.0.1:54321",
    supabaseAnonKey: "anon-key",
  }),
}));

const { GoogleLoginButton } = await import("@/components/login/google-login-button");

const OAUTH_URL = "http://127.0.0.1:54321/auth/v1/authorize?provider=google";

/** The auth server answers — the happy path. */
function authServerUp() {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
}

/** `supabase start` was never run: the request fails at the transport layer. */
function authServerDown() {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
}

let assign: ReturnType<typeof vi.fn>;

function renderButton(props: { initialError?: boolean } = {}) {
  return render(
    <NextIntlClientProvider locale="vi" messages={vi_messages}>
      <GoogleLoginButton {...props} />
    </NextIntlClientProvider>,
  );
}

describe("GoogleLoginButton", () => {
  beforeEach(() => {
    signInWithOAuth.mockReset();
    createSupabaseBrowserClient.mockClear();
    createSupabaseBrowserClient.mockImplementation(() => ({ auth: { signInWithOAuth } }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    // jsdom refuses a real navigation; replace the assign hook instead.
    assign = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, origin: "http://localhost:3000", assign },
    });
    authServerUp();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders the design label and the Google icon (test case 6ae76d15)", () => {
    renderButton();

    expect(screen.getByRole("button", { name: /LOGIN With Google/ })).toBeInTheDocument();
    expect(document.querySelector('img[src*="google.svg"]')).toBeTruthy();
  });

  it("starts the Google OAuth flow on click (test case 60bc5bbb)", async () => {
    // Never resolves — the real flow navigates away, so the promise never settles.
    signInWithOAuth.mockReturnValue(new Promise(() => {}));
    renderButton();

    await userEvent.click(screen.getByRole("button", { name: /LOGIN With Google/ }));

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/auth/callback",
        skipBrowserRedirect: true,
      },
    });
  });

  it("disables itself and shows a loader while authenticating (test case 37eae882)", async () => {
    signInWithOAuth.mockReturnValue(new Promise(() => {}));
    renderButton();

    await userEvent.click(screen.getByRole("button", { name: /LOGIN With Google/ }));

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeDisabled();
    });
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  // edge-cases.md: repeated clicks must not open two OAuth flows.
  it("fires only once when clicked repeatedly", async () => {
    signInWithOAuth.mockReturnValue(new Promise(() => {}));
    renderButton();

    const button = screen.getByRole("button", { name: /LOGIN With Google/ });
    await userEvent.click(button);
    await userEvent.click(button);
    await userEvent.click(button);

    expect(signInWithOAuth).toHaveBeenCalledTimes(1);
  });

  it("shows the design error copy when Supabase returns an error", async () => {
    signInWithOAuth.mockResolvedValue({ error: { message: "provider not configured" } });
    renderButton();

    await userEvent.click(screen.getByRole("button", { name: /LOGIN With Google/ }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Đăng nhập không thành công. Vui lòng thử lại.",
      );
    });
  });

  // edge-cases.md: "Supabase local chưa chạy → thông báo lỗi thân thiện".
  // Without the reachability probe the browser navigates to a dead host and the user gets a
  // raw connection-error page instead of the designed message.
  it("shows the error copy and does NOT navigate when the auth server is unreachable", async () => {
    signInWithOAuth.mockResolvedValue({ data: { url: OAUTH_URL }, error: null });
    authServerDown();
    renderButton();

    await userEvent.click(screen.getByRole("button", { name: /LOGIN With Google/ }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Đăng nhập không thành công. Vui lòng thử lại.",
      );
    });
    expect(assign).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /LOGIN With Google/ })).toBeEnabled();
  });

  it("navigates to the provider URL once the auth server answers", async () => {
    signInWithOAuth.mockResolvedValue({ data: { url: OAUTH_URL }, error: null });
    renderButton();

    await userEvent.click(screen.getByRole("button", { name: /LOGIN With Google/ }));

    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith(OAUTH_URL);
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows the error copy when the callback redirected back with ?error=auth", () => {
    renderButton({ initialError: true });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Đăng nhập không thành công. Vui lòng thử lại.",
    );
  });

  it("re-enables after a failure so the user can retry", async () => {
    signInWithOAuth.mockResolvedValue({ error: { message: "boom" } });
    renderButton();

    await userEvent.click(screen.getByRole("button", { name: /LOGIN With Google/ }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /LOGIN With Google/ })).toBeEnabled();
    });
  });

  it("stays rendered and shows a friendly error when Supabase config is missing", async () => {
    createSupabaseBrowserClient.mockImplementationOnce(() => {
      throw new Error("Missing environment variables NEXT_PUBLIC_SUPABASE_URL");
    });
    renderButton();

    await userEvent.click(screen.getByRole("button", { name: /LOGIN With Google/ }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Đăng nhập không thành công. Vui lòng thử lại.",
    );
    expect(screen.getByRole("button", { name: /LOGIN With Google/ })).toBeEnabled();
  });
});
