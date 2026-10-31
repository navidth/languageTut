import type { CurrentLevel } from "@/types/level";
import { LEVEL_PROGRESS } from "@/constants/levels";

export function LanguageLevelGauge({
  level = 'A2',
}: {
  level: CurrentLevel;
}) {
  const percentage = LEVEL_PROGRESS[level];
  const radius = 90;
  const circumference = Math.PI * radius; // half circle
  const strokeDashoffset =
    circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Shrinks with narrow cards instead of spilling out of them. */}
      <div className="relative w-full max-w-55 pb-2">
      <svg
        viewBox="0 0 220 120"
        className="block h-auto w-full"
        aria-hidden="true"
      >
        {/* Background arc */}
        <path
          d="M20 110 A90 90 0 0 1 200 110"
          fill="none"
          stroke="var(--border)"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Progress arc */}
        <path
          d="M20 110 A90 90 0 0 1 200 110"
          fill="none"
          stroke="var(--brand-accent)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-x-0 bottom-0 text-center">
        <div className="text-3xl font-bold text-foreground">
          {level}
        </div>
        <div className="text-sm text-muted-foreground">
          سطح فعلی زبان
        </div>
      </div>
      </div>
    </div>
  );
}
