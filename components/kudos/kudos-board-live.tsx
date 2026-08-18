"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { KudosBoard } from "@/components/kudos/kudos-board";
import { KudosComposerDialog } from "@/components/kudos/kudos-composer-dialog";
import { KudosRealtimeStatus } from "@/components/kudos/kudos-realtime-status";
import { LOGIN_ROUTE } from "@/lib/auth/routes";
import { loadMoreFeed } from "@/lib/kudos/actions/load-more-feed";
import { refreshBoardData } from "@/lib/kudos/actions/refresh-board-data";
import { serialiseBoardFilters, type KudosBoardFilters } from "@/lib/kudos/read/board-filters";
import { useKudosRealtime } from "@/lib/kudos/realtime/use-kudos-realtime";
import { normalizeSearchText } from "@/lib/kudos/normalize-search-text";
import type { KudosBoardCallbacks, KudosBoardData } from "@/lib/kudos/types";
import { useKudosActions } from "@/lib/kudos/use-kudos-actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export type KudosBoardLiveProps = {
  data: KudosBoardData;
  isAuthenticated: boolean;
  viewerId: string | null;
  filters: KudosBoardFilters;
};

function buildKudosPath(filters: KudosBoardFilters): string {
  const query = serialiseBoardFilters(filters).toString();
  return query ? `/kudos?${query}` : "/kudos";
}

/**
 * `"use client"` wrapper mounted by `app/kudos/page.tsx` — the single place that turns the
 * Server Component's data + session into `KudosBoard`'s presentational props and callbacks.
 *
 * Deliberately thin (plan Non-functional: "no data shaping"): every callback either navigates
 * (guest → `/login`, filter/profile/detail navigation) or defers to `loadMoreFeed`. This file is
 * extended again by phase 07 (real `onToggleLike`/`onOpenKudosComposer`/`onSubmitKudos` mutations)
 * and phase 08 (realtime updates) — both add to the callback map and effects below rather than
 * restructuring this component, which is why state and callbacks are kept as flat, separate
 * pieces instead of folded into one big reducer.
 */
export function KudosBoardLive({ data, isAuthenticated, viewerId, filters }: KudosBoardLiveProps) {
  const router = useRouter();
  const t = useTranslations("kudosBoard.sidebar");
  const composerT = useTranslations("kudosBoard.composer");
  const actionsT = useTranslations("kudosBoard.actions");
  const filterKey = `${filters.hashtagId ?? ""}|${filters.departmentId ?? ""}`;

  const [boardData, setBoardData] = useState(data);
  const [syncedFilterKey, setSyncedFilterKey] = useState(filterKey);
  const [secretBoxStubOpen, setSecretBoxStubOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Resync during render (React's documented "adjust state when a prop changes" pattern, not an
  // effect) keyed on the filter pair, not on every `data` prop identity change — a same-filter
  // re-render must not clobber feed pages already appended locally by `onLoadMore`.
  if (filterKey !== syncedFilterKey) {
    setSyncedFilterKey(filterKey);
    setBoardData(data);
  }

  const requireLogin = useCallback(() => router.push(LOGIN_ROUTE), [router]);

  function requireAuth(action: () => void) {
    if (!isAuthenticated) {
      requireLogin();
      return;
    }
    action();
  }

  const refresh = useCallback(async () => {
    const fresh = await refreshBoardData(filters);
    setBoardData((current) => ({
      ...fresh,
      highlight: current.highlight,
      feed: {
        ...fresh.feed,
        posts: fresh.feed.posts.map((post) => {
          const pending = current.feed.posts.find((item) => item.id === post.id && item.likePending);
          return pending ?? post;
        }),
      },
    }));
  }, [filters]);
  const realtimeStatus = useKudosRealtime(refresh);
  const actions = useKudosActions({ isAuthenticated, setBoardData, requireLogin, onSent: refresh });

  function navigateWithFilters(next: KudosBoardFilters) {
    router.replace(buildKudosPath(next), { scroll: false });
  }

  const callbacks: KudosBoardCallbacks = {
    onFilterChange: (filter) => navigateWithFilters(filter),
    onSelectHashtag: (hashtag) => {
      const match = boardData.highlight.hashtagFilters.find((option) => option.label === hashtag);
      if (!match) return; // no catalog entry for this chip's text — nothing to filter by
      navigateWithFilters({ hashtagId: match.id, departmentId: filters.departmentId });
    },
    onLoadMore: () => {
      if (loadingMore) return;
      setLoadingMore(true);
      void (async () => {
        try {
          const offset = boardData.feed.posts.length;
          const { posts, hasMore } = await loadMoreFeed({ filters, offset });
          setBoardData((current) => ({
            ...current,
            feed: { ...current.feed, posts: [...current.feed.posts, ...posts], hasMore },
          }));
        } finally {
          setLoadingMore(false);
        }
      })();
    },
    onOpenProfile: (personId) => requireAuth(() => router.push(`/profile/${personId}`)),
    onOpenKudosDetail: (postId) => requireAuth(() => router.push(`/kudos/${postId}`)),
    onToggleLike: actions.toggle,
    onOpenKudosComposer: actions.openComposer,
    onSearchProfile: async (query) => {
      if (!isAuthenticated) {
        requireLogin();
        return;
      }

      try {
        const supabase = createSupabaseBrowserClient();
        const { data: directMatches, error: directError } = await supabase
          .from("profiles")
          .select("id")
          .ilike("full_name", `%${query.trim()}%`)
          .limit(1);
        if (directError) return "error";
        if (directMatches?.[0]) {
          router.push(`/profile/${directMatches[0].id}`);
          return;
        }

        // PostgreSQL ILIKE is accent-sensitive. Fall back to the public profile
        // catalog so searches such as "nguyen" still match "Nguyễn".
        const { data: profiles, error: catalogError } = await supabase
          .from("profiles")
          .select("id, full_name")
          .order("full_name", { ascending: true })
          .limit(500);
        if (catalogError) return "error";

        const normalizedQuery = normalizeSearchText(query);
        const match = profiles?.find((profile) =>
          normalizeSearchText(profile.full_name).includes(normalizedQuery),
        );
        if (!match) return "not-found";
        router.push(`/profile/${match.id}`);
      } catch {
        return "error";
      }
    },
    onOpenSecretBox: () => requireAuth(() => setSecretBoxStubOpen(true)),
  };

  return (
    <>
      <KudosBoard key={filterKey} data={boardData} callbacks={callbacks} filters={filters} />
      <KudosRealtimeStatus reconnecting={realtimeStatus === "reconnecting"} />
      {viewerId && actions.composerOpen && (
        <KudosComposerDialog
          open={actions.composerOpen}
          viewerId={viewerId}
          hashtags={boardData.highlight.hashtagFilters}
          submitting={actions.composerSubmitting}
          errorKey={actions.composerError}
          onClose={actions.closeComposer}
          onSubmit={actions.submitKudos}
        />
      )}
      {actions.sentNotice && <p role="status" className="fixed inset-x-0 bottom-6 z-[80] mx-auto w-fit rounded-lg bg-brand-yellow px-6 py-3 font-bold text-ink shadow-xl">{composerT(actions.sentNotice === "partial" ? "partialToast" : "successToast")}</p>}
      {actions.actionError && <p role="alert" className="fixed inset-x-0 bottom-6 z-[80] mx-auto w-fit rounded-lg bg-red-700 px-6 py-3 font-bold text-white shadow-xl">{actionsT(actions.actionError === "not-allowed" ? "selfLikeError" : "likeError")}</p>}
      {secretBoxStubOpen && (
        <p
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 bottom-6 z-50 mx-auto w-fit rounded-lg border border-accent-border bg-kudos-sidebar-surface px-6 py-3 text-sm font-bold text-brand-yellow shadow-lg"
        >
          {t("secretBoxStub")}
        </p>
      )}
    </>
  );
}
