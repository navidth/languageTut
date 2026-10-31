"use client";

import { useEffect, useState } from "react";
import { HiCollection, HiLockClosed } from "react-icons/hi";
import AsyncState from "@/components/ui/AsyncState";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { formatSkillName } from "@/lib/presentation/skill";
import { fetchCourseLessons, selectCourseLessons } from "@/store/coursesSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { Lesson, PaginatedLessons } from "@/types/course";
import { COURSE_LESSONS_SECTION_ID } from "@/constants/routes";

/**
 * Lessons on the public course page. The first page comes with the static
 * page, so search engines see it; later pages load here, through the store.
 */
export default function CourseLessonList({
  courseId,
  initialLessons,
}: {
  courseId: number;
  initialLessons: PaginatedLessons | null;
}) {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const entry = useAppSelector((state) => selectCourseLessons(state, courseId, page));
  const lessons = page === 1 ? initialLessons : entry?.data ?? null;
  const loading = page > 1 && (!entry || entry.status === "loading");

  useEffect(() => {
    if (page > 1) void dispatch(fetchCourseLessons({ courseId, page }));
  }, [courseId, dispatch, page]);

  function changePage(next: number) {
    setPage(next);
    document.getElementById(COURSE_LESSONS_SECTION_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (page > 1 && !lessons) {
    return entry?.status === "failed" ? (
      <AsyncState
        message={entry.error ?? "دریافت درس‌های دوره ناموفق بود."}
        retry={() => void dispatch(fetchCourseLessons({ courseId, page, force: true }))}
      />
    ) : (
      <AsyncState message="در حال دریافت درس‌ها..." />
    );
  }

  if (!lessons) {
    return (
      <div className="surface-card rounded-2xl p-8 text-center">
        <HiLockClosed className="mx-auto size-8 text-brand-accent" aria-hidden="true" />
        <p className="mt-4 font-bold">فهرست درس‌ها برای این حساب در دسترس نیست.</p>
        <p className="mt-2 text-sm text-muted-foreground">برای مشاهده محتوای دوره وارد شوید یا دسترسی دوره را فعال کنید.</p>
      </div>
    );
  }

  if (lessons.results.length === 0) {
    return (
      <EmptyState
        icon={HiCollection}
        headingLevel="h3"
        title="هنوز درسی منتشر نشده است"
        description="درس‌های این دوره به‌زودی اضافه می‌شوند."
      />
    );
  }

  return (
    <>
      <ol className="space-y-4">
        {lessons.results.map((lesson) => <LessonItem key={lesson.id} lesson={lesson} />)}
      </ol>
      <Pagination
        currentPage={page}
        count={lessons.count}
        resultsCount={lessons.results.length}
        next={lessons.next}
        previous={lessons.previous}
        onPageChange={changePage}
        loading={loading}
        ariaLabel="صفحه‌بندی درس‌های دوره"
      />
    </>
  );
}

function LessonItem({ lesson }: { lesson: Lesson }) {
  const skill = formatSkillName(lesson.skill_detail.name);

  return (
    <li className="surface-card rounded-2xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-secondary-soft px-3 py-1 text-sm font-bold text-brand-secondary dark:text-white">
          {skill}
        </span>
        <span className="text-sm text-muted-foreground">درس {lesson.order.toLocaleString("fa-IR")}</span>
      </div>

      <h3 className="mt-4 text-xl font-bold">{lesson.title}</h3>
      <p className="mt-3 whitespace-pre-line leading-8 text-muted-foreground">{lesson.content}</p>

      {(lesson.audio_url || lesson.video_url || lesson.attachment_url) && (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
          {lesson.audio_url && <MediaLink href={lesson.audio_url} label="فایل صوتی" />}
          {lesson.video_url && <MediaLink href={lesson.video_url} label="ویدئو" />}
          {lesson.attachment_url && <MediaLink href={lesson.attachment_url} label="پیوست درس" />}
        </div>
      )}
    </li>
  );
}

function MediaLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="ghost-button rounded-lg px-3 py-2 text-sm">
      {label}
    </a>
  );
}
