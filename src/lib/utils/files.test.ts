import { describe, expect, it } from "vitest";
import { formatFileSize, parseContentDispositionFilename } from "@/lib/utils/files";

describe("parseContentDispositionFilename", () => {
  it("reads a quoted file name", () => {
    expect(
      parseContentDispositionFilename('attachment; filename="essay.pdf"'),
    ).toBe("essay.pdf");
  });

  it("reads an unquoted file name", () => {
    expect(parseContentDispositionFilename("attachment; filename=essay.pdf")).toBe(
      "essay.pdf",
    );
  });

  it("prefers the UTF-8 encoded name", () => {
    const header =
      "attachment; filename=\"fallback.pdf\"; filename*=UTF-8''%D8%AA%DA%A9%D9%84%DB%8C%D9%81.pdf";

    expect(parseContentDispositionFilename(header)).toBe("تکلیف.pdf");
  });

  it("returns null when the header carries no name", () => {
    expect(parseContentDispositionFilename("inline")).toBeNull();
    expect(parseContentDispositionFilename(undefined)).toBeNull();
  });
});

describe("formatFileSize", () => {
  it("picks a readable unit", () => {
    expect(formatFileSize(0)).toBe("۰ بایت");
    expect(formatFileSize(512)).toBe("۵۱۲ بایت");
    expect(formatFileSize(2048)).toBe("۲ کیلوبایت");
    expect(formatFileSize(5 * 1024 * 1024)).toBe("۵ مگابایت");
  });

  it("falls back for unknown sizes", () => {
    expect(formatFileSize(null)).toBe("—");
    expect(formatFileSize(Number.NaN)).toBe("—");
  });
});
