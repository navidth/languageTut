import type { Metadata } from "next";
import CourseGrid from "@/components/courses/CourseGrid";
import Pagination from "@/components/ui/Pagination";
import { BACKEND_BASE_URL } from "@/lib/apiClient";
import type { PaginatedCourses } from "@/lib/courses";
import { parsePageParam } from "@/lib/pagination";

type Props = { searchParams: Promise<{ page?: string | string[] }> };

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "دوره‌های آنلاین زبان و آیلتس",
  description: "فهرست دوره‌های آموزش آیلتس برای سطح‌های A1 تا C2؛ دوره‌های رایگان و تخصصی را مقایسه و انتخاب کنید.",
  alternates: { canonical: "/courses" },
  openGraph: { title: "دوره‌های آنلاین زبان و آیلتس | ExamificatioN", description: "دوره مناسب سطح زبان خود را پیدا کنید.", url: "/courses", type: "website" },
};

<<<<<<< HEAD
async function getCourses(page: number): Promise<PaginatedCourses> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/courses/?page=${page}`, { next: { revalidate: 300 } });
  if (!response.ok) throw new Error("دریافت دوره‌ها از سرور ناموفق بود.");
  return response.json();
=======
async function getCourses(): Promise<PaginatedCourses> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/courses/`, { next: { revalidate: 300 } });
    if (!response.ok) throw new Error("دریافت دوره‌ها از سرور ناموفق بود.");
    return response.json();
  } catch {
    // Keep builds and cached pages available while the API is restarting.
    return { count: 0, next: null, previous: null, results: [] };
  }
>>>>>>> 7977588fbd4c9570c5ea85d829fc91dba73d5896
}

export default async function CoursesPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = parsePageParam(pageParam);
  const data = await getCourses(page);
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
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
