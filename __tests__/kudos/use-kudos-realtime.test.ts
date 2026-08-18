import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { handlers, statusHandlers, removeChannel } = vi.hoisted(() => ({ handlers: [] as Array<() => void>, statusHandlers: [] as Array<(status: string) => void>, removeChannel: vi.fn() }));
const channel = { on: vi.fn((_event, _filter, handler) => { handlers.push(handler); return channel; }), subscribe: vi.fn((handler) => { statusHandlers.push(handler); return channel; }) };
vi.mock("@/lib/supabase/browser-client", () => ({ createSupabaseBrowserClient: () => ({ channel: () => channel, removeChannel }) }));

import { KUDOS_FALLBACK_POLL_MS, KUDOS_REFRESH_DEBOUNCE_MS, useKudosRealtime } from "@/lib/kudos/realtime/use-kudos-realtime";

describe("useKudosRealtime", () => {
  beforeEach(() => { vi.useFakeTimers(); handlers.length = 0; statusHandlers.length = 0; removeChannel.mockReset(); channel.on.mockClear(); channel.subscribe.mockClear(); });
  afterEach(() => vi.useRealTimers());
  it("debounces event bursts and removes its channel", async () => {
    const refresh = vi.fn();
    const { unmount } = renderHook(() => useKudosRealtime(refresh));
    act(() => { handlers[0]?.(); handlers[0]?.(); vi.advanceTimersByTime(KUDOS_REFRESH_DEBOUNCE_MS); });
    expect(refresh).toHaveBeenCalledTimes(1);
    unmount();
    expect(removeChannel).toHaveBeenCalledWith(channel);
  });
  it("polls while reconnecting and stops after subscription recovers", () => {
    const refresh = vi.fn();
    const { result } = renderHook(() => useKudosRealtime(refresh));
    act(() => statusHandlers[0]?.("CHANNEL_ERROR"));
    expect(result.current).toBe("reconnecting");
    act(() => vi.advanceTimersByTime(KUDOS_FALLBACK_POLL_MS));
    expect(refresh).toHaveBeenCalledTimes(1);
    act(() => statusHandlers[0]?.("SUBSCRIBED"));
    expect(result.current).toBe("live");
  });
});
