import { twMerge } from "tailwind-merge";
import { formatRemainingTime } from "@/lib/utils/format";

export type CountdownProps = {
  /** Seconds left; `null` shows `fallback` instead. */
  seconds: number | null;
  /** Shown before the countdown starts, e.g. the test's full duration. */
  fallback?: string;
  /** Below this many seconds the time turns red and pulses. */
  urgentBelow?: number;
  label?: string;
  /** Its colour gives way to red once urgent. On an always-dark surface, add
      `dark` so the red is the light one. */
  className?: string;
};

/**
 * Displays time left as mm:ss in Persian digits. It has the `timer` role,
 * which screen readers do not announce on every tick.
 */
export default function Countdown({
  seconds,
  fallback = "",
  urgentBelow = 60,
  label = "زمان باقی‌مانده",
  className = "",
}: CountdownProps) {
  const urgent = seconds !== null && seconds <= urgentBelow;

  return (
    <p
      role="timer"
      aria-label={label}
      data-urgent={urgent || undefined}
      className={twMerge("tabular-nums", className, urgent && "animate-pulse text-destructive")}
    >
      {seconds === null ? fallback : formatRemainingTime(seconds)}
    </p>
  );
}
