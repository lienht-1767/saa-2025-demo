"use client";

import { useRef, useState, type Dispatch, type SetStateAction } from "react";

import { sendKudos } from "@/lib/kudos/actions/send-kudos";
import { toggleLike } from "@/lib/kudos/actions/toggle-like";
import type { KudosBoardData, KudosComposerInput } from "@/lib/kudos/types";

function patchLike(data: KudosBoardData, postId: string, patch: { liked: boolean; count?: number; pending: boolean }) {
  const update = <T extends { id: string; likedByViewer: boolean; likeCount: number }>(item: T): T =>
    item.id === postId
      ? { ...item, likedByViewer: patch.liked, likeCount: patch.count ?? item.likeCount, likePending: patch.pending }
      : item;
  return {
    ...data,
    highlight: { ...data.highlight, cards: data.highlight.cards.map(update) },
    feed: { ...data.feed, posts: data.feed.posts.map(update) },
  };
}

export function useKudosActions({
  isAuthenticated,
  setBoardData,
  requireLogin,
  onSent,
}: {
  isAuthenticated: boolean;
  setBoardData: Dispatch<SetStateAction<KudosBoardData>>;
  requireLogin: () => void;
  onSent: () => Promise<void>;
}) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerSubmitting, setComposerSubmitting] = useState(false);
  const [composerError, setComposerError] = useState<string | null>(null);
  const [sentNotice, setSentNotice] = useState<"sent" | "partial" | null>(null);
  const [actionError, setActionError] = useState<"failed" | "not-allowed" | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const openComposer = () => {
    if (!isAuthenticated) return requireLogin();
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setComposerError(null);
    setComposerOpen(true);
  };

  const submitKudos = async (input: KudosComposerInput) => {
    setComposerSubmitting(true);
    setComposerError(null);
    const result = await sendKudos(input);
    setComposerSubmitting(false);
    if (result.status === "unauthenticated") return requireLogin();
    if (result.status === "sent" || result.status === "partial") {
      setComposerOpen(false);
      window.setTimeout(() => openerRef.current?.focus(), 0);
      setSentNotice(result.status);
      window.setTimeout(() => setSentNotice(null), 4500);
      await onSent();
      return;
    }
    const firstError = result.fieldErrors ? Object.values(result.fieldErrors)[0] : null;
    setComposerError(firstError ?? "failed");
  };

  const toggle = async (postId: string, nextLiked: boolean) => {
    if (!isAuthenticated) return requireLogin();
    let previousCount = 0;
    setBoardData((current) => {
      const currentCard = [...current.highlight.cards, ...current.feed.posts].find((item) => item.id === postId);
      previousCount = currentCard?.likeCount ?? 0;
      return patchLike(current, postId, { liked: nextLiked, count: Math.max(0, previousCount + (nextLiked ? 1 : -1)), pending: true });
    });
    const result = await toggleLike(postId);
    if (result.status === "unauthenticated") {
      setBoardData((current) => patchLike(current, postId, { liked: !nextLiked, count: previousCount, pending: false }));
      return requireLogin();
    }
    if (result.status === "liked" || result.status === "unliked") {
      setBoardData((current) => patchLike(current, postId, { liked: result.status === "liked", count: result.likeCount, pending: false }));
      return;
    }
    setBoardData((current) => patchLike(current, postId, { liked: !nextLiked, count: previousCount, pending: false }));
    setActionError(result.status === "not-allowed" ? "not-allowed" : "failed");
    window.setTimeout(() => setActionError(null), 3500);
  };

  return {
    composerOpen,
    composerSubmitting,
    composerError,
    sentNotice,
    actionError,
    openComposer,
    closeComposer: () => {
      if (composerSubmitting) return;
      setComposerOpen(false);
      window.setTimeout(() => openerRef.current?.focus(), 0);
    },
    submitKudos,
    toggle,
  };
}
