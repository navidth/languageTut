import apiClient from "./apiClient";
import type { Skill } from "./skills";

export type Lesson = {
  id: number;
  course: number;
  skill: number;
  skill_detail: Skill;
  title: string;
  content: string;
  audio_url: string | null;
  video_url: string | null;
  attachment_url: string | null;
  order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type LessonRequest = {
  course: number;
  skill: number;
  title: string;
  content: string;
  audio_url?: string | null;
  video_url?: string | null;
  attachment_url?: string | null;
  order?: number;
  is_published?: boolean;
};

export type PaginatedLessons = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Lesson[];
};

export const lessonsApi = {
  list: async (page = 1) =>
    (await apiClient.get<PaginatedLessons>("/api/lessons/", { params: { page } })).data,
  get: async (id: number) =>
    (await apiClient.get<Lesson>(`/api/lessons/${id}/`)).data,
  create: async (data: LessonRequest) =>
    (await apiClient.post<Lesson>("/api/lessons/", data)).data,
  update: async (id: number, data: LessonRequest) =>
    (await apiClient.put<Lesson>(`/api/lessons/${id}/`, data)).data,
  patch: async (id: number, data: Partial<LessonRequest>) =>
    (await apiClient.patch<Lesson>(`/api/lessons/${id}/`, data)).data,
  remove: async (id: number) => {
    await apiClient.delete(`/api/lessons/${id}/`);
  },
};
