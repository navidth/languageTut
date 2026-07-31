import apiClient from "./apiClient";
import type { Skill } from "./skills";

export type PracticeTest = {
  id: number;
  course: number;
  level: string;
  skill: number;
  skill_detail: Skill;
  title: string;
  description: string;
  duration_minutes: number;
  is_published: boolean;
  questions_count: number;
  created_at: string;
  updated_at: string;
};

export type PracticeTestRequest = {
  course: number;
  skill: number;
  title: string;
  description?: string;
  duration_minutes: number;
  is_published?: boolean;
};

export type PaginatedPracticeTests = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PracticeTest[];
};

export const practiceTestsApi = {
  list: async (page = 1) =>
    (await apiClient.get<PaginatedPracticeTests>("/api/practice-tests/", { params: { page } })).data,
  get: async (id: number) =>
    (await apiClient.get<PracticeTest>(`/api/practice-tests/${id}/`)).data,
  create: async (data: PracticeTestRequest) =>
    (await apiClient.post<PracticeTest>("/api/practice-tests/", data)).data,
  update: async (id: number, data: PracticeTestRequest) =>
    (await apiClient.put<PracticeTest>(`/api/practice-tests/${id}/`, data)).data,
  patch: async (id: number, data: Partial<PracticeTestRequest>) =>
    (await apiClient.patch<PracticeTest>(`/api/practice-tests/${id}/`, data)).data,
  remove: async (id: number) => {
    await apiClient.delete(`/api/practice-tests/${id}/`);
  },
};
