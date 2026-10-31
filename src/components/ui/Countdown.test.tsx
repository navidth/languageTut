import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Countdown from "@/components/ui/Countdown";
import { useCountdown } from "@/hooks/useCountdown";

function Timer({ deadline }: { deadline: number | null }) {
  const remaining = useCountdown(deadline);
  return <Countdown seconds={remaining === null ? null : Math.ceil(remaining / 1000)} fallback="۲۰ دقیقه" />;
}

describe("Countdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-28T10:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts down every second in Persian digits", () => {
    render(<Timer deadline={Date.now() + 90_000} />);
    expect(screen.getByRole("timer", { name: "زمان باقی‌مانده" })).toHaveTextContent("۰۱:۳۰");

    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(screen.getByRole("timer")).toHaveTextContent("۰۱:۲۹");
  });

  it("stops at zero", () => {
    render(<Timer deadline={Date.now() + 2_000} />);

    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(screen.getByRole("timer")).toHaveTextContent("۰۰:۰۰");
  });

  it("shows the fallback without a deadline", () => {
    render(<Timer deadline={null} />);

    expect(screen.getByRole("timer")).toHaveTextContent("۲۰ دقیقه");
  });

  it("turns urgent in the last minute", () => {
    render(<Timer deadline={Date.now() + 61_000} />);
    expect(screen.getByRole("timer")).not.toHaveAttribute("data-urgent");

    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(screen.getByRole("timer")).toHaveAttribute("data-urgent", "true");
    expect(screen.getByRole("timer")).toHaveClass("text-destructive");
  });
});
