"use client";

import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { formatRemainingTime } from "@/lib/format";

/**
 * Milliseconds left until `deadline` (a timestamp), refreshed every second;
 * `null` while there is no deadline, and on the server, so the first client
 * render matches it. Never below zero.
 */
export function useCountdown(deadline: number | null, intervalMs = 1000) {
  // Only the clock is state; the time left is derived from it on render.
  const [now, setNow] = useState<number | null>(null);
  const active = deadline !== null && Number.isFinite(deadline);

  useEffect(() => {
    if (!active) return;
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(timer);
  }, [active, intervalMs]);

  if (!active || now === null) return null;
  return Math.max(0, deadline - now);
}

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
