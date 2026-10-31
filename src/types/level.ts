export type CurrentLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type Level = {
  id: number;
  code: CurrentLevelCode;
  title: string;
  order: number;
};

export type CurrentLevelCode = "PT" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
