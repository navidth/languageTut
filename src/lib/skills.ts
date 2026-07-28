import apiClient from "./apiClient";

export const SKILL_NAMES = [
  "listening",
  "reading",
  "writing",
  "speaking",
] as const;

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

export type PaginatedSkills = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Skill[];
};

export const skillsApi = {
  list: async (page = 1) =>
    (
      await apiClient.get<PaginatedSkills>("/api/skills/", {
        params: { page },
      })
    ).data,

  get: async (id: number) =>
    (await apiClient.get<Skill>(`/api/skills/${id}/`)).data,

  create: async (data: SkillRequest) =>
    (await apiClient.post<Skill>("/api/skills/", data)).data,

  update: async (id: number, data: SkillRequest) =>
    (await apiClient.put<Skill>(`/api/skills/${id}/`, data)).data,

  patch: async (id: number, data: PatchedSkillRequest) =>
    (await apiClient.patch<Skill>(`/api/skills/${id}/`, data)).data,

  remove: async (id: number) => {
    await apiClient.delete(`/api/skills/${id}/`);
  },
};
