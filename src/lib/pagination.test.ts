import { describe, expect, it } from "vitest";
import { buildPaginationItems, inferTotalPages, parsePageParam } from "./pagination";

describe("pagination helpers", () => {
  it("normalizes invalid page values", () => {
    expect(parsePageParam(undefined)).toBe(1);
    expect(parsePageParam("-2")).toBe(1);
    expect(parsePageParam("invalid")).toBe(1);
    expect(parsePageParam(["4", "5"])).toBe(4);
  });

  it("infers the last page from the API response", () => {
    expect(inferTotalPages({ count: 46, currentPage: 1, resultsCount: 20, hasNext: true })).toBe(3);
    expect(inferTotalPages({ count: 46, currentPage: 3, resultsCount: 6, hasNext: false })).toBe(3);
    expect(inferTotalPages({ count: 46, currentPage: 1, resultsCount: 20, hasNext: true, pageSize: 10 })).toBe(5);
  });

  it("keeps nearby pages and collapses distant ranges", () => {
    expect(buildPaginationItems(5, 10)).toEqual([
      1,
      "ellipsis-start",
      4,
      5,
      6,
      "ellipsis-end",
      10,
    ]);
    expect(buildPaginationItems(2, 4)).toEqual([1, 2, 3, 4]);
  });
});
