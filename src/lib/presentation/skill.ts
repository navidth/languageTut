import type { SkillName } from "@/types/skill";
import { skillLabels } from "@/constants/skills";

export function formatSkillName(name: string | null | undefined, fallback = "درس") {
  return name && name in skillLabels
    ? skillLabels[name as SkillName]
    : name || fallback;
}
