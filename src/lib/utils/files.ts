import { FILE_SIZE_UNITS } from "@/constants/files";


export function formatFileSize(bytes: number | null | undefined) {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes < 0) return "—";

  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < FILE_SIZE_UNITS.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const formatted = value.toLocaleString("fa-IR", {
    maximumFractionDigits: unitIndex === 0 ? 0 : 1,
  });
  return `${formatted} ${FILE_SIZE_UNITS[unitIndex]}`;
}

/** Extracts the file name from a `Content-Disposition` response header. */
export function parseContentDispositionFilename(header: unknown): string | null {
  if (typeof header !== "string" || !header.trim()) return null;

  const encoded = /filename\*\s*=\s*[\w-]+''([^;]+)/i.exec(header);
  if (encoded?.[1]) {
    try {
      return decodeURIComponent(encoded[1].trim().replace(/^"|"$/g, ""));
    } catch {
      // Fall through to the plain `filename=` parameter.
    }
  }

  const plain = /filename\s*=\s*("([^"]*)"|[^;]+)/i.exec(header);
  const value = (plain?.[2] ?? plain?.[1])?.trim();
  return value || null;
}

/** Saves an already-downloaded blob through a temporary object URL. */
export function saveBlob(blob: Blob, fileName: string) {
  if (typeof window === "undefined") return;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
