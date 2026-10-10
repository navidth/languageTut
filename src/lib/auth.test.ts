import { describe, expect, it } from "vitest";
import { normalizeIranianMobile } from "./auth";

describe("normalizeIranianMobile", () => {
  it.each([
    ["09123456789", "09123456789"],
    ["9123456789", "09123456789"],
    ["+98 912 345 6789", "09123456789"],
    ["00989123456789", "09123456789"],
    ["۰۹۱۲-۳۴۵-۶۷۸۹", "09123456789"],
    ["٠٩١٢٣٤٥٦٧٨٩", "09123456789"],
  ])("accepts %s", (value, expected) => {
    expect(normalizeIranianMobile(value)).toBe(expected);
  });

  it.each(["", "12345", "0812345678", "091234567890", "learner@example.com"])(
    "rejects %s",
    (value) => {
      expect(normalizeIranianMobile(value)).toBeNull();
    },
  );
});
