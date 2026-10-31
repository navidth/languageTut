import { DEFAULT_CACHE_TTL } from "@/constants/api";


export function isCacheFresh(
  fetchedAt: number | null | undefined,
  ttl = DEFAULT_CACHE_TTL,
  now = Date.now(),
) {
  return typeof fetchedAt === "number" && now - fetchedAt < ttl;
}
