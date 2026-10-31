import type { MetadataRoute } from "next";
import { publicCoursesApi } from "@/lib/services/publicCoursesApi";
import { coursePath } from "@/lib/utils/routes";
import type { Course } from "@/types/course";

const SITEMAP_REVALIDATE_SECONDS = 3600;
// A guard against a list that never reports its last page.
const MAX_COURSE_PAGES = 50;

async function listAllCourses() {
  const courses: Course[] = [];
  for (let page = 1; page <= MAX_COURSE_PAGES; page += 1) {
    const data = await publicCoursesApi.list(page, SITEMAP_REVALIDATE_SECONDS);
    courses.push(...data.results);
    if (!data.next) break;
  }
  return courses;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const fixed: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/courses`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/features`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/ielts`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/consultation`, changeFrequency: "monthly", priority: 0.7 },
  ];
  try {
    const courses = await listAllCourses();
    return fixed.concat(courses.map((course) => ({
      url: `${baseUrl}${coursePath(course.id)}`,
      lastModified: course.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })));
  } catch {
    return fixed;
  }
}
