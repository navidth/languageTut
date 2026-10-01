export function formatRemainingTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  const formatPart = (value: number) =>
    value.toLocaleString("fa-IR", {
      minimumIntegerDigits: 2,
      useGrouping: false,
    });
  return `${formatPart(minutes)}:${formatPart(seconds)}`;
}

/** Parses the decimal strings the API uses for scores and percentages. */
export function parseDecimal(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatDecimal(
  value: string | number | null | undefined,
  fallback = "—",
) {
  const parsed = parseDecimal(value);
  return parsed === null
    ? fallback
    : parsed.toLocaleString("fa-IR", { maximumFractionDigits: 2 });
}
