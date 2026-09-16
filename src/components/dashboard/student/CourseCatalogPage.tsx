"use client";

import { useCallback, useEffect, useState } from "react";
import CourseGrid from "@/components/courses/CourseGrid";
import Pagination from "@/components/ui/Pagination";
import { getApiErrorMessage } from "@/lib/apiErrors";
import type { Course } from "@/lib/courses";
import { studentApi } from "@/lib/studentApi";

export default function CourseCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCourses = useCallback(async (requestedPage: number) => {
    setLoading(true);
    setError("");

    try {
      const data = await studentApi.courses(requestedPage);
      setCourses(data.results);
      setCount(data.count);
      setNext(data.next);
      setPrevious(data.previous);
    } catch (reason) {
      setError(getApiErrorMessage(reason, "دریافت دوره‌ها از سرور ناموفق بود."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCourses(page);
  }, [loadCourses, page]);

  return (
    <section className="mx-auto max-w-7xl">
      <div className="page-hero mb-7 rounded-3xl p-7">
        <p className="page-hero-muted mb-2 text-sm">پنل دانش‌آموز</p>
        <h1 className="text-3xl font-black">همه دوره‌ها</h1>
        <p className="page-hero-muted mt-2">
          دوره مناسب سطح خود را از میان {count.toLocaleString("fa-IR")} دوره انتخاب کنید.
        </p>
      </div>

      {loading && <Status text="در حال دریافت دوره‌ها..." />}
      {error && <Status text={error} retry={() => void loadCourses(page)} />}
      {!loading && !error && courses.length === 0 && (
        <Status text="در حال حاضر دوره‌ای برای نمایش وجود ندارد." />
      )}
      {!loading && !error && courses.length > 0 && (
        <>
          <CourseGrid initialCourses={courses} detailBasePath="/student/all-courses" />
          <Pagination
            currentPage={page}
            count={count}
            resultsCount={courses.length}
            next={next}
            previous={previous}
            onPageChange={setPage}
            loading={loading}
            ariaLabel="صفحه‌بندی همه دوره‌ها"
          />
        </>
      )}
    </section>
  );
}

function Status({ text, retry }: { text: string; retry?: () => void }) {
  return (
    <div className="surface-card rounded-2xl p-10 text-center text-muted-foreground">
      <p>{text}</p>
      {retry && (
        <button onClick={retry} className="brand-button mt-4 rounded-xl px-5 py-2">
          تلاش دوباره
        </button>
      )}
    </div>
  );
}
