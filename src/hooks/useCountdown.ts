import { useEffect, useState } from "react";

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
