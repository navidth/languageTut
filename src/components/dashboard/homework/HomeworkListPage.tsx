"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { HiClipboardList } from "react-icons/hi";
import { hasActiveSession, useSessionState } from "@/hooks/useSessionState";
import AsyncState from "@/components/ui/AsyncState";
import Pagination from "@/components/ui/Pagination";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { HOMEWORK_SCOPES } from "@/constants/homework";
import { type HomeworkScope } from "@/types/homework";
import { homeworkScopeLabels } from "@/constants/homework";
import { selectKnownCourseTitles } from "@/store/courseTitles";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchHomeworkList, homeworkListKey } from "@/store/homeworkSlice";
import { type HomeworkListFilters } from "@/types/store";
import { fetchStudentOverview } from "@/store/studentSlice";
import HomeworkCard from "@/components/dashboard/homework/HomeworkCard";
import { FIELD_CLASS_NAME } from "@/constants/ui";

type HomeworkListPageProps = {
  initialPage?: number;
  initialCourse?: number;
  initialScope?: HomeworkScope;
};

export default function HomeworkListPage({
  initialPage = 1,
  initialCourse,
  initialScope,
}: HomeworkListPageProps) {
  const dispatch = useAppDispatch();
  const session = useSessionState();
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const [filters, setFilters] = useState<HomeworkListFilters>(() => ({
    page: initialPage,
    course: initialCourse,
    scope: initialScope,
  }));
  const entry = useAppSelector(
    (state) => state.homework.lists[homeworkListKey(filters)],
  );
  const enrollments = useAppSelector(
    (state) => state.student.enrollmentPages[1]?.data?.results,
  );
  const courseTitles = useAppSelector(selectKnownCourseTitles);
  const scopeFilterId = useId();
  const courseFilterId = useId();

  // `my_submission` is per student, so the list reloads when the user changes.
  useEffect(() => {
    void dispatch(fetchHomeworkList(filters));
  }, [dispatch, filters, userId]);

  // Enrollments are cached with the dashboard overview; they name the courses
  // shown on the cards and offered in the course filter.
  useEffect(() => {
    if (hasActiveSession(session)) void dispatch(fetchStudentOverview());
  }, [dispatch, session]);

  const courseOptions = useMemo(() => {
    const options = new Map<number, string>();
    for (const enrollment of enrollments ?? []) {
      options.set(enrollment.course, enrollment.course_title);
    }
    if (filters.course !== undefined && !options.has(filters.course)) {
      options.set(
        filters.course,
        courseTitles[filters.course] ??
          `دوره ${filters.course.toLocaleString("fa-IR")}`,
      );
    }
    return [...options].map(([id, title]) => ({ id, title }));
  }, [courseTitles, enrollments, filters.course]);

  const data = entry?.data ?? null;
  const items = data?.results ?? [];
  const loading = !entry || entry.status === "loading";
  const failed = entry?.status === "failed";
  const hasFilters =
    filters.course !== undefined || filters.scope !== undefined;

  function updateFilters(patch: Partial<HomeworkListFilters>) {
    setFilters((current) => ({ ...current, ...patch, page: 1 }));
  }

  function retry() {
    void dispatch(fetchHomeworkList({ ...filters, force: true }));
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="page-hero mb-7 rounded-3xl p-7">
        <p className="page-hero-muted mb-2 text-sm">پنل دانش‌آموز</p>
        <h1 className="text-3xl font-black">تکالیف</h1>
        <p className="page-hero-muted mt-2">
          تکالیف دوره‌ها و درس‌ها، وضعیت ارسال و نمره‌های شما
          {data && ` · ${data.count.toLocaleString("fa-IR")} تکلیف`}
        </p>
      </div>

      <div
        role="group"
        aria-label="فیلتر تکالیف"
        className="mb-6 grid items-end gap-4 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[1fr_1fr_auto]"
      >
        <div>
          <label htmlFor={scopeFilterId} className="mb-2 block text-sm font-bold">
            نوع تکلیف
          </label>
          <select
            id={scopeFilterId}
            value={filters.scope ?? ""}
            onChange={(event) =>
              updateFilters({
                scope: HOMEWORK_SCOPES.find(
                  (scope) => scope === event.target.value,
                ),
              })
            }
            className={`${FIELD_CLASS_NAME} text-sm`}
          >
            <option value="">همه تکالیف</option>
            {HOMEWORK_SCOPES.map((scope) => (
              <option key={scope} value={scope}>
                {homeworkScopeLabels[scope]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={courseFilterId} className="mb-2 block text-sm font-bold">
            دوره
          </label>
          <select
            id={courseFilterId}
            value={filters.course ?? ""}
            onChange={(event) =>
              updateFilters({
                course: event.target.value
                  ? Number(event.target.value)
                  : undefined,
              })
            }
            className={`${FIELD_CLASS_NAME} text-sm`}
          >
            <option value="">همه دوره‌ها</option>
            {courseOptions.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          disabled={!hasFilters}
          onClick={() => updateFilters({ course: undefined, scope: undefined })}
          className="ghost-button rounded-xl px-5 py-3 text-sm"
        >
          حذف فیلترها
        </button>
      </div>

      {session === "anonymous" && (
        <p className="feedback-warning mb-5 rounded-2xl p-4 text-sm" role="status">
          برای مشاهده وضعیت ارسال و نمره‌های خود، وارد حساب کاربری شوید.
        </p>
      )}

      {failed && data && (
        <div
          className="feedback-error mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 text-sm"
          role="alert"
        >
          <span>{entry.error ?? "به‌روزرسانی تکالیف ناموفق بود."}</span>
          <button
            type="button"
            onClick={retry}
            className="ghost-button rounded-xl px-4 py-2 text-sm"
          >
            تلاش دوباره
          </button>
        </div>
      )}

      {loading && !data && <SkeletonGrid label="در حال دریافت تکالیف..." />}

      {failed && !data && (
        <AsyncState
          message={entry.error ?? "دریافت تکالیف ناموفق بود."}
          retry={retry}
        />
      )}

      {data && items.length === 0 && (
        <div
          className="rounded-2xl border border-border bg-card p-10 text-center"
          role="status"
        >
          <HiClipboardList
            className="mx-auto size-10 text-brand-accent"
            aria-hidden="true"
          />
          <p className="mt-4 font-bold">
            {hasFilters
              ? "با این فیلترها تکلیفی پیدا نشد."
              : "در حال حاضر تکلیفی برای شما ثبت نشده است."}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {hasFilters
              ? "فیلترها را تغییر دهید یا حذف کنید."
              : "تکالیف جدید پس از انتشار توسط مدرس در این صفحه نمایش داده می‌شوند."}
          </p>
        </div>
      )}

      {data && items.length > 0 && (
        <>
          <div
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            aria-busy={loading}
          >
            {items.map((homework) => (
              <HomeworkCard
                key={homework.id}
                homework={homework}
                referenceTime={entry?.lastFetched ?? null}
                courseTitle={courseTitles[homework.course]}
              />
            ))}
          </div>
          <Pagination
            currentPage={filters.page}
            count={data.count}
            resultsCount={items.length}
            next={data.next}
            previous={data.previous}
            onPageChange={(page) =>
              setFilters((current) => ({ ...current, page }))
            }
            loading={loading}
            ariaLabel="صفحه‌بندی تکالیف"
          />
        </>
      )}
    </section>
  );
}
