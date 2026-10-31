"use client";

import { useSyncExternalStore } from "react";
import { hasStoredSession } from "@/lib/services/apiClient";
import { useAppSelector } from "@/store/hooks";
import type { SessionState } from "@/types/auth";

const subscribe = () => () => undefined;
// The server cannot see the stored tokens, so the answer is unknown there.
const getServerSnapshot = () => null;

/**
 * Resolves the session without a hydration mismatch: the first client render
 * matches the server (`unknown`), then the stored tokens decide. Pages can
 * show a placeholder while it is `unknown`, so signed-in users never see a
 * flash of the sign-in prompt and anonymous visitors trigger no private calls.
 */
export function useSessionState(): SessionState {
  const status = useAppSelector((state) => state.auth.status);
  const hasUser = useAppSelector((state) => state.auth.user !== null);
  const storedSession = useSyncExternalStore<boolean | null>(
    subscribe,
    hasStoredSession,
    getServerSnapshot,
  );

  if (status === "authenticated" && hasUser) return "authenticated";
  if (storedSession === null) return "unknown";
  if (storedSession && status !== "error") return "restoring";
  return "anonymous";
}

/** True once requests are known to carry the user's credentials. */
export function hasActiveSession(session: SessionState) {
  return session === "authenticated" || session === "restoring";
}
