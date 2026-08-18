"use server";

import { getCurrentProfile, type SessionProfile } from "@/lib/auth/profile";

export type LikeActionResult = {
  status: "liked" | "unliked" | "unauthenticated" | "not-allowed" | "failed";
  likeCount?: number;
};

export type SendKudosActionResult = {
  status: "sent" | "partial" | "validation-error" | "unauthenticated" | "failed";
  kudosId?: string;
  fieldErrors?: Record<string, string>;
};

export async function requireViewer(): Promise<SessionProfile | null> {
  return getCurrentProfile();
}
