import type { Metadata } from "next";
import CourseGrid from "@/components/courses/CourseGrid";
import Pagination from "@/components/ui/Pagination";
import type { PaginatedCourses } from "@/types/course";
import { parsePageParam } from "@/lib/utils/pagination";
import { publicCoursesApi } from "@/lib/services/publicCoursesApi";

type Props = { searchParams: Promise<{ page?: string | string[] }> };

// The page number is a search param, so the page renders per request (its
// links stay crawlable); the course list itself comes from the cache.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "دوره‌های آنلاین زبان و آیلتس",
  description: "فهرست دوره‌های آموزش آیلتس برای سطح‌های A1 تا C2؛ دوره‌های رایگان و تخصصی را مقایسه و انتخاب کنید.",
  alternates: { canonical: "/courses" },
  openGraph: { title: "دوره‌های آنلاین زبان و آیلتس | ExamificatioN", description: "دوره مناسب سطح زبان خود را پیدا کنید.", url: "/courses", type: "website" },
};

async function getCourses(page: number): Promise<PaginatedCourses> {
  try {
    return await publicCoursesApi.list(page);
  } catch {
    // Keep builds and cached pages available while the API is restarting.
    return { count: 0, next: null, previous: null, results: [] };
  }
}

export default async function CoursesPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = parsePageParam(pageParam);
  const data = await getCourses(page);
  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 pt-28 sm:px-6">
      <header className="mb-10 text-center">
        <h1 className="mb-4 text-3xl font-extrabold md:text-4xl">دوره‌های آموزش آنلاین آیلتس</h1>
        <p className="mx-auto max-w-2xl leading-8 text-muted-foreground">از سطح مقدماتی تا پیشرفته، مسیر آموزشی مناسب خود را از میان {data.count.toLocaleString("fa-IR")} دوره انتخاب کنید.</p>
      </header>
      <CourseGrid initialCourses={data.results} />
      <Pagination
        currentPage={page}
        count={data.count}
        resultsCount={data.results.length}
        next={data.next}
        previous={data.previous}
        basePath="/courses"
        ariaLabel="صفحه‌بندی دوره‌ها"
      />
    </section>
  );
}
