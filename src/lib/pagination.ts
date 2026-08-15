export type PaginationItem = number | "ellipsis-start" | "ellipsis-end";

export function parsePageParam(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const page = Number.parseInt(rawValue ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function inferTotalPages({
  count,
  currentPage,
  resultsCount,
  hasNext,
  pageSize,
}: {
  count: number;
  currentPage: number;
  resultsCount: number;
  hasNext: boolean;
  pageSize?: number;
}) {
  if (count <= 0) return 0;
  if (pageSize && pageSize > 0) return Math.max(1, Math.ceil(count / pageSize));
  if (hasNext) {
    return resultsCount > 0
      ? Math.max(currentPage + 1, Math.ceil(count / resultsCount))
      : currentPage + 1;
  }
  if (currentPage > 1) return currentPage;
  return 1;
}

export function buildPaginationItems(
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
): PaginationItem[] {
  if (totalPages <= 0) return [];
  if (totalPages <= 2 * siblingCount + 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(2, currentPage - siblingCount);
  const end = Math.min(totalPages - 1, currentPage + siblingCount);
  const items: PaginationItem[] = [1];

  if (start > 2) items.push("ellipsis-start");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < totalPages - 1) items.push("ellipsis-end");
  items.push(totalPages);

  return items;
}
