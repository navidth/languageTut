import apiClient from "@/lib/services/apiClient";
import type { PaginatedSkills, Skill, SkillRequest, PatchedSkillRequest } from "@/types/skill";

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

  patch: async (id: number, data: PatchedSkillRequest) =>
    (await apiClient.patch<Skill>(`/api/skills/${id}/`, data)).data,

  remove: async (id: number) => {
    await apiClient.delete(`/api/skills/${id}/`);
  },
};
