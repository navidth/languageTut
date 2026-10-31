import type { CurrentLevel } from "@/types/level";

export const LEVEL_PROGRESS: Record<CurrentLevel, number> = {
  A1: 20,
  A2: 35,
  B1: 55,
  B2: 70,
  C1: 85,
  C2: 100,
};

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
