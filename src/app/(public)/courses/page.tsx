import type { Metadata } from "next";
import CourseGrid from "@/components/courses/CourseGrid";
import { BACKEND_BASE_URL } from "@/lib/apiClient";
import { PaginatedCourses } from "@/lib/courses";

export const metadata: Metadata = {
  title: "دوره‌های آنلاین آیلتس",
  description: "فهرست دوره‌های آموزش آیلتس برای سطح‌های A1 تا C2؛ دوره‌های رایگان و تخصصی را مقایسه و انتخاب کنید.",
  alternates: { canonical: "/courses" },
  openGraph: { title: "دوره‌های آنلاین آیلتس", description: "دوره مناسب سطح زبان خود را پیدا کنید.", url: "/courses", type: "website" },
};

async function getCourses(): Promise<PaginatedCourses> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/courses/`, { next: { revalidate: 300 } });
    if (!response.ok) throw new Error("دریافت دوره‌ها از سرور ناموفق بود.");
    return response.json();
  } catch {
    // Keep builds and cached pages available while the API is restarting.
    return { count: 0, next: null, previous: null, results: [] };
  }
}

export default async function CoursesPage() {
  const data = await getCourses();
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <header className="mb-10 text-center">
        <h1 className="mb-4 text-3xl font-extrabold md:text-4xl">دوره‌های آموزش آنلاین آیلتس</h1>
        <p className="mx-auto max-w-2xl leading-8 text-gray-600 dark:text-gray-300">از سطح مقدماتی تا پیشرفته، مسیر آموزشی مناسب خود را از میان {data.count.toLocaleString("fa-IR")} دوره انتخاب کنید.</p>
      </header>
      <CourseGrid initialCourses={data.results} count={data.count} />
    </section>
  );
}
