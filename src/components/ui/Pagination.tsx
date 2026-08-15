"use client";

import Link from "next/link";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { buildPaginationItems, inferTotalPages } from "@/lib/pagination";

type QueryValue = string | string[] | number | boolean | null | undefined;

type PaginationProps = {
  currentPage: number;
  count: number;
  resultsCount: number;
  next: string | null;
  previous: string | null;
  pageSize?: number;
  siblingCount?: number;
  basePath?: string;
  pageParam?: string;
  query?: Record<string, QueryValue>;
  onPageChange?: (page: number) => void;
  loading?: boolean;
  ariaLabel?: string;
  className?: string;
};

function buildHref(
  basePath: string,
  page: number,
  pageParam: string,
  query: Record<string, QueryValue>,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value == null || key === pageParam) continue;
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, String(item)));
    } else {
      params.set(key, String(value));
    }
  }

  if (page > 1) params.set(pageParam, String(page));
  const search = params.toString();
  return search ? `${basePath}?${search}` : basePath;
}

export default function Pagination({
  currentPage,
  count,
  resultsCount,
  next,
  previous,
  pageSize,
  siblingCount = 1,
  basePath,
  pageParam = "page",
  query = {},
  onPageChange,
  loading = false,
  ariaLabel = "صفحه‌بندی",
  className = "",
}: PaginationProps) {
  const safeCurrentPage = Math.max(1, currentPage);
  const hasNext = Boolean(next);
  const hasPrevious = Boolean(previous) && safeCurrentPage > 1;
  const totalPages = inferTotalPages({
    count,
    currentPage: safeCurrentPage,
    resultsCount,
    hasNext,
    pageSize,
  });

  if (totalPages <= 1 && !hasNext && !hasPrevious) return null;

  const items = buildPaginationItems(safeCurrentPage, totalPages, siblingCount);
  const previousPage = Math.max(1, safeCurrentPage - 1);
  const nextPage = safeCurrentPage + 1;

  const controlClass = "inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-bold transition";
  const inactiveClass = "border-border bg-card text-foreground hover:border-brand-accent hover:bg-accent-soft";
  const disabledClass = "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-50";

  function renderControl(page: number, label: string, content: React.ReactNode, enabled: boolean) {
    const className = `${controlClass} ${enabled && !loading ? inactiveClass : disabledClass}`;

    if (basePath && enabled && !loading) {
      return (
        <Link href={buildHref(basePath, page, pageParam, query)} className={className} aria-label={label}>
          {content}
        </Link>
      );
    }

    return (
      <button
        type="button"
        disabled={!enabled || loading}
        onClick={() => enabled && onPageChange?.(page)}
        className={className}
        aria-label={label}
      >
        {content}
      </button>
    );
  }

  return (
    <nav className={`mt-8 flex flex-col items-center gap-3 ${className}`} aria-label={ariaLabel} aria-busy={loading}>
      <div className="flex flex-wrap items-center justify-center gap-2" dir="rtl">
        {renderControl(
          previousPage,
          "صفحه قبل",
          <><HiChevronRight className="size-4" aria-hidden="true" /><span className="hidden sm:inline">قبلی</span></>,
          hasPrevious,
        )}

        {items.map((item) => {
          if (typeof item !== "number") {
            return (
              <span key={item} className="grid min-h-10 min-w-8 place-items-center text-muted-foreground" aria-hidden="true">
                …
              </span>
            );
          }

          const active = item === safeCurrentPage;
          const pageClass = `${controlClass} ${active ? "border-brand-accent bg-brand-accent text-brand-primary shadow-sm" : inactiveClass}`;

          if (basePath && !active) {
            return (
              <Link key={item} href={buildHref(basePath, item, pageParam, query)} className={pageClass} aria-label={`صفحه ${item.toLocaleString("fa-IR")}`}>
                {item.toLocaleString("fa-IR")}
              </Link>
            );
          }

          return (
            <button
              key={item}
              type="button"
              disabled={active || loading}
              onClick={() => !active && onPageChange?.(item)}
              className={pageClass}
              aria-label={`صفحه ${item.toLocaleString("fa-IR")}`}
              aria-current={active ? "page" : undefined}
            >
              {item.toLocaleString("fa-IR")}
            </button>
          );
        })}

        {renderControl(
          nextPage,
          "صفحه بعد",
          <><span className="hidden sm:inline">بعدی</span><HiChevronLeft className="size-4" aria-hidden="true" /></>,
          hasNext,
        )}
      </div>

      <p className="text-xs text-muted-foreground" role="status">
        صفحه {safeCurrentPage.toLocaleString("fa-IR")} از {totalPages.toLocaleString("fa-IR")} · {count.toLocaleString("fa-IR")} مورد
      </p>
    </nav>
  );
}
