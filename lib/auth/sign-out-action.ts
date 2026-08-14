"use server";

import { redirect } from "next/navigation";

import { LOGIN_ROUTE } from "@/lib/auth/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function signOutAction() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    console.warn("[auth/sign-out] Supabase sign-out failed; redirecting to login.");
  }

  // redirect() throws by design, so it must remain outside the recovery block above.
  redirect(LOGIN_ROUTE);
}
