import { describe, expect, it } from "vitest";
import { isCacheFresh } from "@/lib/utils/cache";

describe("isCacheFresh", () => {
  it("distinguishes fresh, stale, and missing timestamps", () => {
    expect(isCacheFresh(9_500, 1_000, 10_000)).toBe(true);
    expect(isCacheFresh(9_000, 1_000, 10_000)).toBe(false);
    expect(isCacheFresh(null, 1_000, 10_000)).toBe(false);
  });
});
