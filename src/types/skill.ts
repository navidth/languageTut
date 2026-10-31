import type { SKILL_NAMES } from "@/constants/skills";
import type { Paginated } from "@/types/api";

export type SkillName = (typeof SKILL_NAMES)[number];

export type Skill = {
  id: number;
  name: SkillName;
  order: number;
};

export type SkillRequest = {
  name: SkillName;
  order: number;
};

export type PatchedSkillRequest = Partial<SkillRequest>;

export type PaginatedSkills = Paginated<Skill>;
