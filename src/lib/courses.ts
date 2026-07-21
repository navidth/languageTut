import apiClient from "./apiClient";

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
  title: string;
  content: string;
  audio_url: string | null;
  video_url: string | null;
  attachment_url: string | null;
  order: number;
  is_published: boolean;
};

export const coursesApi = {
  list: async (page = 1) =>
    (await apiClient.get<PaginatedCourses>("/api/courses/", { params: { page } })).data,
  get: async (id: number) =>
    (await apiClient.get<Course>(`/api/courses/${id}/`)).data,
  create: async (data: CoursePayload) =>
    (await apiClient.post<Course>("/api/courses/", data)).data,
  update: async (id: number, data: CoursePayload) =>
    (await apiClient.put<Course>(`/api/courses/${id}/`, data)).data,
  patch: async (id: number, data: Partial<CoursePayload>) =>
    (await apiClient.patch<Course>(`/api/courses/${id}/`, data)).data,
  remove: async (id: number) => {
    await apiClient.delete(`/api/courses/${id}/`);
  },
  lessons: async (id: number) =>
    (await apiClient.get<Lesson[]>(`/api/courses/${id}/lessons/`)).data,
};
