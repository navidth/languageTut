import apiClient from "./apiClient";
import type { Skill } from "./skills";

export type Level = {
  id: number;
  code: CurrentLevelCode;
  title: string;
  order: number;
};

export type CurrentLevelCode = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type Course = {
  id: number;
  title: string;
  level: number;
  level_detail: Level;
  description: string;
  price: number;
  is_free: boolean;
  has_access: boolean;
  is_active: boolean;
  lessons_count: number;
  created_at: string;
  updated_at: string;
};

export type CoursePayload = {
  title: string;
  level: number;
  description?: string;
  price?: number;
  is_active?: boolean;
};

export type PaginatedCourses = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Course[];
};

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

export type PaginatedLessons = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Lesson[];
};

export const coursesApi = {
  list: async (page = 1) =>
    (await apiClient.get<PaginatedCourses>("/api/courses/", { params: { page } })).data,
  get: async (id: number) =>
    (await apiClient.get<Course>(`/api/courses/${id}/`)).data,
  update: async (id: number, data: CoursePayload) =>
    (await apiClient.put<Course>(`/api/courses/${id}/`, data)).data,
  patch: async (id: number, data: Partial<CoursePayload>) =>
    (await apiClient.patch<Course>(`/api/courses/${id}/`, data)).data,
  remove: async (id: number) => {
    await apiClient.delete(`/api/courses/${id}/`);
  },
  lessons: async (id: number, page = 1) =>
    (
      await apiClient.get<PaginatedLessons>(`/api/courses/${id}/lessons/`, {
        params: { page },
      })
    ).data,
};
