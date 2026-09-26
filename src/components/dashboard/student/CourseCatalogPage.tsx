"use client";

import { useEffect, useState } from "react";
import CourseGrid from "@/components/courses/CourseGrid";
import AsyncState from "@/components/ui/AsyncState";
import Pagination from "@/components/ui/Pagination";
import { fetchCourses } from "@/store/coursesSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function CourseCatalogPage() {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const entry = useAppSelector((state) => state.courses.pages[page]);
  const data = entry?.data;
  const courses = data?.results ?? [];
  const loading = !entry || entry.status === "loading";

  useEffect(() => {
    void dispatch(fetchCourses(page));
  }, [dispatch, page]);

  return (
    <section className="mx-auto max-w-7xl">
      <div className="page-hero mb-7 rounded-3xl p-7">
        <p className="page-hero-muted mb-2 text-sm">پنل دانش‌آموز</p>
        <h1 className="text-3xl font-black">همه دوره‌ها</h1>
        <p className="page-hero-muted mt-2">
          دوره مناسب سطح خود را از میان {(data?.count ?? 0).toLocaleString("fa-IR")} دوره انتخاب کنید.
        </p>
      </div>

      {loading && <AsyncState message="در حال دریافت دوره‌ها..." />}
      {entry?.status === "failed" && (
        <AsyncState message={entry.error ?? "دریافت دوره‌ها ناموفق بود."} retry={() => void dispatch(fetchCourses({ page, force: true }))} />
      )}
      {!loading && entry?.status !== "failed" && courses.length === 0 && (
        <AsyncState message="در حال حاضر دوره‌ای برای نمایش وجود ندارد." />
      )}
      {!loading && entry?.status !== "failed" && courses.length > 0 && data && (
        <>
          <CourseGrid initialCourses={courses} detailBasePath="/student/all-courses" />
          <Pagination
            currentPage={page}
            count={data.count}
            resultsCount={courses.length}
            next={data.next}
            previous={data.previous}
            onPageChange={setPage}
            loading={loading}
            ariaLabel="صفحه‌بندی همه دوره‌ها"
          />
        </>
      )}
    </section>
  );
}
