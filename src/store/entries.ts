import { isCacheFresh } from "@/lib/utils/cache";
import type { ApiErrorInfo, Paginated } from "@/types/api";
import type { DetailEntry, PageEntry, RequestStatus } from "@/types/store";

// Shared state transitions for cached items and pages, so every slice
// records loading, success and failure the same way.

/** Keeps the cached data while a refresh runs. */
export function pendingEntry<T>(entry: DetailEntry<T> | undefined): DetailEntry<T> {
  return {
    data: entry?.data ?? null,
    status: "loading",
    error: null,
    errorKind: null,
    lastFetched: entry?.lastFetched ?? null,
  };
}

export function loadedEntry<T>(data: T, fetchedAt = Date.now()): DetailEntry<T> {
  return { data, status: "succeeded", error: null, errorKind: null, lastFetched: fetchedAt };
}

/** Keeps the last good data, so a failed refresh does not blank the page. */
export function failedEntry<T>(
  entry: DetailEntry<T> | undefined,
  info: ApiErrorInfo | undefined,
  fallback: string,
): DetailEntry<T> {
  return {
    data: entry?.data ?? null,
    status: "failed",
    error: info?.message ?? fallback,
    errorKind: info?.kind ?? "unknown",
    lastFetched: entry?.lastFetched ?? null,
  };
}

export function pendingPage<T>(entry: PageEntry<T> | undefined): PageEntry<T> {
  return {
    data: entry?.data ?? null,
    status: "loading",
    error: null,
    lastFetched: entry?.lastFetched ?? null,
  };
}

export function loadedPage<T>(data: Paginated<T>, fetchedAt = Date.now()): PageEntry<T> {
  return { data, status: "succeeded", error: null, lastFetched: fetchedAt };
}

export function failedPage<T>(entry: PageEntry<T> | undefined, error: string): PageEntry<T> {
  return {
    data: entry?.data ?? null,
    status: "failed",
    error,
    lastFetched: entry?.lastFetched ?? null,
  };
}

/**
 * A thunk `condition`: skip while the same request runs, and while the cache
 * is fresh unless `force` asks for a refresh.
 */
export function shouldFetch(
  entry: { status: RequestStatus; lastFetched: number | null } | undefined,
  force?: boolean,
) {
  if (entry?.status === "loading") return false;
  return Boolean(force) || !isCacheFresh(entry?.lastFetched);
}

/** Marks every entry in a map stale, so its next read refetches. */
export function markStale(entries: Record<number, { lastFetched: number | null }>) {
  for (const entry of Object.values(entries)) entry.lastFetched = null;
}
