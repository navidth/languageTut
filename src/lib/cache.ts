export const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

export function isCacheFresh(
  fetchedAt: number | null | undefined,
  ttl = DEFAULT_CACHE_TTL,
  now = Date.now(),
) {
  return typeof fetchedAt === "number" && now - fetchedAt < ttl;
}
