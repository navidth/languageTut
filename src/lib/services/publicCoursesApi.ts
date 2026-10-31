import { BACKEND_BASE_URL, PUBLIC_REVALIDATE_SECONDS } from "@/constants/api";
import type { Course, PaginatedCourses, PaginatedLessons } from "@/types/course";

// Server reads for the public course pages and the sitemap. They use `fetch`
// rather than the axios client, so Next caches each answer and refreshes it
// in the background. They carry no user, so `has_access` is always false.

function read(path: string, revalidate = PUBLIC_REVALIDATE_SECONDS) {
  return fetch(`${BACKEND_BASE_URL}${path}`, { next: { revalidate } });
}

export const publicCoursesApi = {
  list: async (page = 1, revalidate?: number): Promise<PaginatedCourses> => {
    const response = await read(`/api/courses/?page=${page}`, revalidate);
    if (!response.ok) throw new Error("دریافت دوره‌ها از سرور ناموفق بود.");
    return response.json();
  },
  /** `null` when the course does not exist. */
  get: async (id: string): Promise<Course | null> => {
    const response = await read(`/api/courses/${id}/`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("دریافت اطلاعات دوره ناموفق بود.");
    return response.json();
  },
  /** `null` when the lessons are not public. */
  lessons: async (id: string, page = 1): Promise<PaginatedLessons | null> => {
    const response = await read(`/api/courses/${id}/lessons/?page=${page}`);
    if (response.status === 401 || response.status === 403) return null;
    if (!response.ok) throw new Error("دریافت درس‌های دوره از سرور ناموفق بود.");
    return response.json();
  },
};
