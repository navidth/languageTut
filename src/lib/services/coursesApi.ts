import apiClient from "@/lib/services/apiClient";
import type { Course, PaginatedCourses, PaginatedLessons } from "@/types/course";
import type { PurchaseResponse } from "@/types/student";

export const coursesApi = {
  list: async (page = 1) =>
    (await apiClient.get<PaginatedCourses>("/api/courses/", { params: { page } })).data,
  /** `has_access` in the answer depends on the signed-in user. */
  get: async (id: number) =>
    (await apiClient.get<Course>(`/api/courses/${id}/`)).data,
  lessons: async (id: number, page = 1) =>
    (
      await apiClient.get<PaginatedLessons>(`/api/courses/${id}/lessons/`, {
        params: { page },
      })
    ).data,
  /** Enrolls in a free course, or returns a ZarinPal `payment_url` for a paid one. */
  purchase: async (id: number) =>
    (await apiClient.post<PurchaseResponse>(`/api/payments/courses/${id}/purchase/`, {})).data,
};
