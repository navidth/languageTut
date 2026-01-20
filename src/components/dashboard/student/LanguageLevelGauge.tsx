type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

const levelMap: Record<Level, number> = {
  A1: 20,
  A2: 35,
  B1: 55,
  B2: 70,
  C1: 85,
  C2: 100,
};

export function LanguageLevelGauge({
  level = 'A2',
}: {
  level: Level;
}) {
  const percentage = levelMap[level];
  const radius = 90;
  const circumference = Math.PI * radius; // half circle
  const strokeDashoffset =
    circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <svg
        width="220"
        height="120"
        viewBox="0 0 220 120"
        className="block"
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
          stroke="var(--primary)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center text */}
      <div className="-mt-12 text-center">
        <div className="text-3xl font-bold text-foreground">
          {level}
        </div>
        <div className="text-sm text-muted-foreground">
          سطح فعلی زبان
        </div>
      </div>
    </div>
  );
}
