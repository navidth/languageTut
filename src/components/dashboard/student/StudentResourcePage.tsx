"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { studentApi, type Lesson, type PracticeTest, type Question } from "@/lib/studentApi";
import type { Course, Level } from "@/lib/courses";
import { formatCourseType } from "@/lib/coursePresentation";
import { studentExamResultPath, studentTestPath } from "@/lib/routes";
import { formatSkillName } from "@/lib/skillPresentation";
import { hasActiveSession, useSessionState } from "@/components/auth/useSessionState";
import AsyncState from "@/components/ui/AsyncState";
import Pagination from "@/components/ui/Pagination";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchEnrolledCourses,
  fetchExamSubmissions,
  fetchStudentResource,
  invalidateStudentProgress,
  selectLatestExamSubmissions,
  type StudentResourceKind,
} from "@/store/studentSlice";

export type ResourceKind = "levels" | "courses" | "lessons" | "questions" | "tests";
type Item = Level | Course | Lesson | Question | PracticeTest;

const titles: Record<ResourceKind, [string, string]> = {
  levels: ["سطح‌های زبان", "مسیر استاندارد یادگیری از A1 تا C2"],
  courses: ["کورس‌های من", "دوره‌های ثبت‌نام‌شده و میزان پیشرفت شما"],
  lessons: ["درس‌ها", "محتوای آموزشی و وضعیت مطالعه"],
  questions: ["سؤال‌ها", "بانک سؤال‌های تمرینی"],
  tests: ["تمرین‌های تستی", "آزمون‌های زمان‌دار متناسب با سطح و مهارت"],
};
export default function StudentResourcePage({
  kind,
  heading,
  description,
  eyebrow = "پنل دانش‌آموز",
}: {
  kind: ResourceKind;
  heading?: string;
  description?: string;
  eyebrow?: string;
}) {
  const dispatch = useAppDispatch();
  const [busy, setBusy] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [mutationError, setMutationError] = useState("");
  const entry = useAppSelector((state) => kind === "courses"
    ? state.student.enrolledCoursePages[page]
    : state.student.resources[kind][page]);
  const items = (entry?.data?.results ?? []) as Item[];
  const loading = !entry || entry.status === "loading";

  const load = useCallback((requestedPage: number, force = false) => {
    if (kind === "courses") {
      return dispatch(fetchEnrolledCourses({ page: requestedPage, force }));
    }
    return dispatch(fetchStudentResource({
      kind: kind as StudentResourceKind,
      page: requestedPage,
      force,
    }));
  }, [dispatch, kind]);

  useEffect(() => { void load(page); }, [load, page]);

  // One cached request tells which exams already have a result to show.
  const session = useSessionState();
  const latestResults = useAppSelector(selectLatestExamSubmissions);
  useEffect(() => {
    if (kind === "tests" && hasActiveSession(session)) {
      void dispatch(fetchExamSubmissions());
    }
  }, [dispatch, kind, session]);

  async function lessonAction(id: number, complete: boolean) {
    setBusy(id);
    setMutationError("");
    try {
      await (complete ? studentApi.completeLesson(id) : studentApi.startLesson(id));
      dispatch(invalidateStudentProgress());
      await load(page, true);
    } catch (e) { setMutationError(getApiErrorMessage(e, "انجام عملیات درس ناموفق بود.")); } finally { setBusy(null); }
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="page-hero mb-7 rounded-3xl p-7">
        <p className="page-hero-muted mb-2 text-sm">{eyebrow}</p>
        <h1 className="text-3xl font-black">{heading ?? titles[kind][0]}</h1>
        <p className="page-hero-muted mt-2">{description ?? titles[kind][1]}</p>
      </div>
      {mutationError && <p className="feedback-error mb-4 rounded-xl p-3 text-sm" role="alert">{mutationError}</p>}
      {loading && <AsyncState message="در حال دریافت اطلاعات..." />}
      {entry?.status === "failed" && <AsyncState message={entry.error ?? "دریافت اطلاعات ناموفق بود."} retry={() => void load(page, true)} />}
      {!loading && entry?.status !== "failed" && items.length === 0 && <AsyncState message="در حال حاضر موردی برای نمایش وجود ندارد." />}
      {!loading && entry?.status !== "failed" && entry?.data && items.length > 0 && (
        <>
          {/* Level cards are small, so they sit two across even on phones. */}
          <div className={kind === "levels" ? "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4" : "grid gap-4 md:grid-cols-2 xl:grid-cols-3"}>
            {items.map((item) => (
              <article key={item.id} className={`surface-card rounded-2xl ${kind === "levels" ? "p-4 sm:p-5" : "p-5"}`}>
                {kind === "levels" && <LevelCard item={item as Level} />}
                {kind === "courses" && <CourseCard item={item as Course} />}
                {kind === "lessons" && <LessonCard item={item as Lesson} busy={busy === item.id} action={lessonAction} />}
                {kind === "questions" && <QuestionCard item={item as Question} />}
                {kind === "tests" && <TestCard item={item as PracticeTest} hasResult={item.id in latestResults} />}
              </article>
            ))}
          </div>
          <Pagination
            currentPage={page}
            count={entry.data.count}
            resultsCount={items.length}
            next={entry.data.next}
            previous={entry.data.previous}
            onPageChange={setPage}
            loading={loading}
            ariaLabel={`صفحه‌بندی ${heading ?? titles[kind][0]}`}
          />
        </>
      )}
    </section>
  );
}
function LevelCard({ item }: { item: Level }) {
  return <><span lang="en" dir="ltr" className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-xl font-black text-brand-secondary dark:text-brand-accent">{item.code}</span>
    <h2 className="mt-4 text-xl font-bold">{item.title}</h2><p className="mt-2 text-sm text-muted-foreground">مرحله {item.order.toLocaleString("fa-IR")} مسیر آموزش</p></>;
}
function CourseCard({ item }: { item: Course }) {
  const type = formatCourseType(item.course_type);
  return <>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="brand-badge rounded-full px-3 py-1 text-sm">سطح {item.level_detail?.code}</span>
      <span className="text-sm text-muted-foreground">{type}</span>
    </div>
    <h2 className="bidi-text mt-4 text-xl font-bold">{item.title}</h2>
    <p className="bidi-text mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">{item.description || "بدون توضیحات"}</p>
    <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-secondary-soft p-3 text-xs">
      <span>{item.lessons_count.toLocaleString("fa-IR")} درس</span>
      <span>{item.resources_count.toLocaleString("fa-IR")} منبع</span>
      <strong className={item.is_free ? "text-success" : "text-foreground"}>{item.is_free ? "رایگان" : `${item.price.toLocaleString("fa-IR")} تومان`}</strong>
      <span className={item.has_access ? "text-success" : "text-muted-foreground"}>{item.has_access ? "دسترسی فعال" : "نیاز به تهیه"}</span>
    </div>
    <Link href={`/courses/${item.id}`} className="brand-link mt-5 inline-block text-sm">مشاهده جزئیات ←</Link>
  </>;
}
function LessonCard({ item, busy, action }: { item: Lesson; busy: boolean; action: (id: number, complete: boolean) => void }) {
  return <><div className="flex justify-between"><span className="rounded-full bg-secondary-soft px-3 py-1 text-sm font-bold text-brand-secondary dark:text-white">{formatSkillName(item.skill_detail?.name)}</span><span className="text-sm text-muted-foreground">درس {item.order}</span></div>
    <h2 className="bidi-text mt-4 text-lg font-bold">{item.title}</h2><div className="bidi-text mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground [&_img]:h-auto [&_img]:max-w-full" dangerouslySetInnerHTML={{ __html: item.content }} />
    <div className="mt-5 flex gap-2"><button disabled={busy} onClick={() => action(item.id, false)} className="brand-button rounded-xl px-4 py-2 text-sm">شروع درس</button><button disabled={busy} onClick={() => action(item.id, true)} className="ghost-button rounded-xl px-4 py-2 text-sm">تکمیل شد</button></div></>;
}
function QuestionCard({ item }: { item: Question }) {
  const options = Array.isArray(item.options) ? item.options : [];
  return <><span className="text-xs text-muted-foreground">نوع: {item.question_type}</span><h2 className="bidi-text mt-3 font-bold leading-7">{item.question_text}</h2>
    {options.length > 0 && <ul className="mt-4 space-y-2">{options.map((x, i) => <li key={i} className="rounded-lg bg-secondary-soft p-2 text-sm">{String(x)}</li>)}</ul>}</>;
}
function TestCard({ item, hasResult }: { item: PracticeTest; hasResult: boolean }) {
  return <><div className="flex justify-between"><span className="brand-badge rounded-full px-3 py-1 text-sm">سطح {item.level}</span><span className="text-sm text-muted-foreground">{item.duration_minutes} دقیقه</span></div>
    <h2 className="bidi-text mt-4 text-xl font-bold">{item.title}</h2><p className="bidi-text mt-2 line-clamp-2 text-sm text-muted-foreground">{item.description || "آزمون تمرینی"}</p>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2"><span className="text-sm">{item.questions_count} سؤال</span>
      <div className="flex flex-wrap justify-end gap-2">
        {hasResult && <Link href={studentExamResultPath(item.id)} className="ghost-button rounded-xl px-4 py-2 text-sm">مشاهده نتیجه</Link>}
        <Link href={studentTestPath(item.id, item.is_free === false ? item.course : undefined)} className="brand-button rounded-xl px-4 py-2 text-sm">ورود به آزمون</Link>
      </div>
    </div></>;
}
