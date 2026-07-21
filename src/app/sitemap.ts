import type { MetadataRoute } from "next";
import { BACKEND_BASE_URL } from "@/lib/apiClient";
import type { PaginatedCourses } from "@/lib/courses";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const fixed: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/courses`, changeFrequency: "daily", priority: 0.9 },
  ];
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/courses/`, { next: { revalidate: 3600 } });
    if (!response.ok) return fixed;
    const data: PaginatedCourses = await response.json();
    return fixed.concat(data.results.map((course) => ({
      url: `${baseUrl}/courses/${course.id}`,
      lastModified: course.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })));
  } catch {
    return fixed;
  }
}
