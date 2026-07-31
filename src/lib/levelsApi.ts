import apiClient from "./apiClient";
import type { Level } from "./courses";

export type LevelRequest = {
  code: string;
  title: string;
  order: number;
};

export type PaginatedLevels = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Level[];
};

export const levelsApi = {
  list: async (page = 1) =>
    (await apiClient.get<PaginatedLevels>("/api/levels/", { params: { page } })).data,
  get: async (id: number) =>
    (await apiClient.get<Level>(`/api/levels/${id}/`)).data,
  create: async (data: LevelRequest) =>
    (await apiClient.post<Level>("/api/levels/", data)).data,
  update: async (id: number, data: LevelRequest) =>
    (await apiClient.put<Level>(`/api/levels/${id}/`, data)).data,
  patch: async (id: number, data: Partial<LevelRequest>) =>
    (await apiClient.patch<Level>(`/api/levels/${id}/`, data)).data,
  remove: async (id: number) => {
    await apiClient.delete(`/api/levels/${id}/`);
  },
};
