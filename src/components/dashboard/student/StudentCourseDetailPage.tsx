"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HiAcademicCap, HiCheckCircle, HiCollection, HiLockClosed } from "react-icons/hi";
import { useAuthFlow } from "@/components/auth/AuthFlowProvider";
import MediaGallery from "@/components/media/MediaGallery";
import AsyncState from "@/components/ui/AsyncState";
import Pagination from "@/components/ui/Pagination";
import { formatCoursePrice, formatCourseType } from "@/lib/presentation/course";
import { formatSkillName } from "@/lib/presentation/skill";
import { getApiErrorMessage } from "@/lib/services/apiErrors";
import { openPaymentPage } from "@/lib/utils/payment";
import { studentHomeworkPath } from "@/lib/utils/routes";
import {
  activateCourse,
  fetchCourseDetail,
  fetchCourseLessons,
  selectCourseDetail,
  selectCourseLessons,
} from "@/store/coursesSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  completeLesson,
  fetchCourseProgress,
  selectCourseProgress,
  startLesson,
} from "@/store/studentSlice";
import type { Lesson } from "@/types/course";
import { ROUTES, COURSE_LESSONS_SECTION_ID } from "@/constants/routes";

type LessonAction = "start" | "complete";

export default function StudentCourseDetailPage({ courseId }: { courseId: number }) {
  const dispatch = useAppDispatch();
  const { startAuthFlow } = useAuthFlow();
  const authStatus = useAppSelector((state) => state.auth.status);
  const user = useAppSelector((state) => state.auth.user);
  const [page, setPage] = useState(1);
  const courseEntry = useAppSelector((state) => selectCourseDetail(state, courseId));
  const lessonsEntry = useAppSelector((state) => selectCourseLessons(state, courseId, page));
  const progress = useAppSelector((state) => selectCourseProgress(state, courseId)?.data ?? null);
  const course = courseEntry?.data ?? null;
  const lessons = lessonsEntry?.data ?? null;
  const hasAccess = Boolean(course?.has_access);
  const lessonsLoading = hasAccess && (!lessonsEntry || lessonsEntry.status === "loading");
  // Errors from the buttons on this page; load errors live in the store.
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [purchaseBusy, setPurchaseBusy] = useState(false);
  const [lessonBusy, setLessonBusy] = useState<{ id: number; action: LessonAction } | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [lessonFeedback, setLessonFeedback] = useState<Record<number, { type: "success" | "error"; text: string }>>({});

  useEffect(() => {
    void dispatch(fetchCourseDetail({ id: courseId }));
  }, [courseId, dispatch]);

  // Lessons and progress exist only once the student has access.
  useEffect(() => {
    if (!hasAccess) return;
    void dispatch(fetchCourseLessons({ courseId, page }));
    void dispatch(fetchCourseProgress({ courseId }));
  }, [courseId, dispatch, hasAccess, page]);

  async function handleActivate() {
    if (!course) return;
    if (authStatus !== "authenticated" || !user) {
      setError("برای ثبت‌نام در دوره ابتدا وارد حساب دانش‌آموز شوید.");
      await startAuthFlow("learning");
      return;
    }
    if (user.role !== "student") {
      setError("ثبت‌نام در دوره فقط با حساب دانش‌آموز امکان‌پذیر است.");
      return;
    }
    setPurchaseBusy(true);
    setError("");
    setNotice("");
    try {
      const { purchase } = await dispatch(activateCourse(course.id)).unwrap();
      if (purchase?.payment_url) {
        openPaymentPage(purchase.payment_url);
        return;
      }
      setNotice(purchase?.detail || "دسترسی دوره فعال شد. اکنون می‌توانید درس‌ها را شروع کنید.");
      void dispatch(fetchCourseProgress({ courseId, force: true }));
    } catch (reason) {
      setError(getApiErrorMessage(reason, "فعال‌سازی دوره ناموفق بود."));
    } finally {
      setPurchaseBusy(false);
    }
  }

  async function lessonAction(lesson: Lesson, action: LessonAction) {
    if (authStatus !== "authenticated" || !user) {
      setLessonFeedback((current) => ({
        ...current,
        [lesson.id]: { type: "error", text: "برای شروع درس ابتدا وارد حساب دانش‌آموز شوید." },
      }));
      await startAuthFlow("learning");
      return;
    }
    if (user.role !== "student") {
      setLessonFeedback((current) => ({
        ...current,
        [lesson.id]: { type: "error", text: "شروع درس فقط با حساب دانش‌آموز امکان‌پذیر است." },
      }));
      return;
    }
    setLessonBusy({ id: lesson.id, action });
    setError("");
    setNotice("");
    setLessonFeedback((current) => {
      const next = { ...current };
      delete next[lesson.id];
      return next;
    });
    try {
      await dispatch(action === "start" ? startLesson(lesson.id) : completeLesson(lesson.id)).unwrap();
      setActiveLessonId(lesson.id);
      setLessonFeedback((current) => ({
        ...current,
        [lesson.id]: {
          type: "success",
          text: action === "start"
            ? "درس شروع شد؛ محتوای آن در همین کارت باز شده است."
            : "تکمیل این درس با موفقیت ثبت شد.",
        },
      }));
      void dispatch(fetchCourseProgress({ courseId, force: true }));
    } catch (reason) {
      setLessonFeedback((current) => ({
        ...current,
        [lesson.id]: {
          type: "error",
          text: getApiErrorMessage(reason, action === "start" ? "شروع درس ناموفق بود." : "ثبت تکمیل درس ناموفق بود."),
        },
      }));
    } finally {
      setLessonBusy(null);
    }
  }

  if (!course && courseEntry?.status === "failed") {
    return (
      <AsyncState
        message={courseEntry.error ?? "دریافت اطلاعات دوره ناموفق بود."}
        retry={() => void dispatch(fetchCourseDetail({ id: courseId, force: true }))}
      />
    );
  }
  if (!course) return <AsyncState message="در حال دریافت اطلاعات دوره..." />;

  const progressValue = Math.min(100, Math.max(0, Number(progress?.progress_percent ?? 0)));

  return (
    <article className="mx-auto max-w-6xl">
      <Link href={ROUTES.studentCourses} className="brand-link mb-6 inline-block">بازگشت به همه دوره‌ها</Link>

      <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-primary via-brand-primary to-brand-secondary p-7 text-white shadow-[var(--shadow-brand-md)] md:p-10">
        <div className="relative grid items-end gap-8 lg:grid-cols-[1fr_18rem]">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-brand-accent px-3 py-1 text-xs font-black text-brand-primary">سطح {course.level_detail.code}</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold">{formatCourseType(course.course_type)}</span>
              {course.is_recommended && <span className="rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1 text-xs font-bold text-brand-accent">پیشنهادی</span>}
            </div>
            <h1 className="bidi-text mt-6 text-3xl font-black leading-tight md:text-5xl">{course.title}</h1>
            <p className="bidi-text mt-5 max-w-3xl leading-8 text-white/70">{course.description || "برای این دوره توضیحی ثبت نشده است."}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-sm">
            <p className="text-xs text-white/55">هزینه دوره</p>
            <strong className="mt-1 block text-2xl text-brand-accent">{formatCoursePrice(course)}</strong>
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-white/80">
              {course.has_access ? <><HiCheckCircle className="size-5 text-success" />دسترسی فعال است</> : <><HiLockClosed className="size-5 text-brand-accent" />نیاز به فعال‌سازی</>}
            </div>
            {course.has_access ? (
              <a href={`#${COURSE_LESSONS_SECTION_ID}`} className="brand-button mt-5 block rounded-xl px-4 py-3 text-center text-sm">رفتن به درس‌ها</a>
            ) : (
              <button type="button" onClick={() => void handleActivate()} disabled={purchaseBusy || !course.is_active} className="brand-button mt-5 w-full rounded-xl px-4 py-3 text-sm disabled:opacity-60">
                {purchaseBusy ? "در حال آماده‌سازی..." : course.is_free ? "ثبت‌نام رایگان" : "خرید دوره"}
              </button>
            )}
          </div>
        </div>
      </header>

      {notice && <p className="feedback-success mt-6 rounded-2xl p-4 text-sm" role="status">{notice}</p>}
      {error && <p className="feedback-error mt-6 rounded-2xl p-4 text-sm" role="alert">{error}</p>}

      <MediaGallery
        media={course.media}
        title="رسانه‌های دوره"
        description="ویدئوها و فایل‌های صوتی دوره"
        audioLabel="فایل صوتی دوره"
        videoLabel="ویدئوی دوره"
        className="mt-8"
      />

      <section className="mt-8 grid grid-cols-3 gap-2 sm:gap-4">
        <Info icon={<HiAcademicCap />} label="تعداد درس‌ها" value={course.lessons_count.toLocaleString("fa-IR")} />
        <Info icon={<HiCollection />} label="تعداد منابع" value={course.resources_count.toLocaleString("fa-IR")} />
        <Info icon={<HiCheckCircle />} label="پیشرفت دوره" value={`${progressValue.toLocaleString("fa-IR")}٪`} />
      </section>

      {course.has_access && progress && (
        <section className="surface-card mt-5 rounded-2xl p-5" aria-label="پیشرفت دوره">
          <div className="mb-3 flex justify-between text-sm font-bold"><span>پیشرفت شما</span><span>{progress.completed_lessons.toLocaleString("fa-IR")} از {progress.total_lessons.toLocaleString("fa-IR")} درس</span></div>
          <div className="h-3 overflow-hidden rounded-full bg-secondary-soft"><div className="h-full rounded-full bg-brand-accent transition-all" style={{ width: `${progressValue}%` }} /></div>
        </section>
      )}

      <section className="mt-10 scroll-mt-24" aria-labelledby={COURSE_LESSONS_SECTION_ID}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div><h2 id={COURSE_LESSONS_SECTION_ID} className="text-2xl font-black">درس‌های دوره</h2><p className="mt-2 text-sm text-muted-foreground">شروع دوره از یکی از درس‌های زیر انجام می‌شود.</p></div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {course.has_access && <Link href={studentHomeworkPath({ course: course.id })} className="ghost-button rounded-full px-4 py-1.5 text-sm">تکالیف این دوره</Link>}
            <span className="rounded-full bg-secondary-soft px-3 py-1 text-sm text-muted-foreground">{course.lessons_count.toLocaleString("fa-IR")} درس</span>
          </div>
        </div>

        {!course.has_access ? (
          <div className="surface-card rounded-2xl p-8 text-center"><HiLockClosed className="mx-auto size-8 text-brand-accent" /><p className="mt-4 font-bold">ابتدا دسترسی دوره را فعال کنید.</p></div>
        ) : lessonsLoading && !lessons ? (
          <AsyncState message="در حال دریافت درس‌ها..." />
        ) : lessonsEntry?.status === "failed" && !lessons ? (
          <AsyncState
            message={lessonsEntry.error ?? "دریافت درس‌های دوره ناموفق بود."}
            retry={() => void dispatch(fetchCourseLessons({ courseId, page, force: true }))}
          />
        ) : !lessons?.results.length ? (
          <AsyncState message="هنوز درسی برای این دوره منتشر نشده است." />
        ) : (
          <>
            <ol className="space-y-5">
              {lessons.results.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  busy={lessonBusy}
                  active={activeLessonId === lesson.id}
                  feedback={lessonFeedback[lesson.id]}
                  action={lessonAction}
                  toggle={() => setActiveLessonId((current) => current === lesson.id ? null : lesson.id)}
                />
              ))}
            </ol>
            <Pagination currentPage={page} count={lessons.count} resultsCount={lessons.results.length} next={lessons.next} previous={lessons.previous} onPageChange={setPage} loading={lessonsLoading} ariaLabel="صفحه‌بندی درس‌های دوره" />
          </>
        )}
      </section>
    </article>
  );
}

function LessonCard({ lesson, busy, active, feedback, action, toggle }: {
  lesson: Lesson;
  busy: { id: number; action: LessonAction } | null;
  active: boolean;
  feedback?: { type: "success" | "error"; text: string };
  action: (lesson: Lesson, action: LessonAction) => void;
  toggle: () => void;
}) {
  const media = [
    lesson.video_url ? { video_url: lesson.video_url, title: `ویدئوی ${lesson.title}` } : null,
    lesson.audio_url ? { audio_url: lesson.audio_url, title: `فایل صوتی ${lesson.title}` } : null,
  ].filter((item) => item !== null);
  const currentBusy = busy?.id === lesson.id;

  return (
    <li id={`lesson-${lesson.id}`} className={`surface-card scroll-mt-24 overflow-hidden rounded-3xl p-6 transition ${active ? "ring-2 ring-brand-accent/40" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><span className="rounded-full bg-secondary-soft px-3 py-1 text-xs font-bold text-brand-secondary dark:text-white">{formatSkillName(lesson.skill_detail.name)}</span><h3 className="bidi-text mt-4 text-xl font-black">{lesson.title}</h3></div>
        <span className="text-sm text-muted-foreground">درس {lesson.order.toLocaleString("fa-IR")}</span>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <button type="button" disabled={currentBusy} onClick={() => active ? toggle() : action(lesson, "start")} className="brand-button rounded-xl px-5 py-2.5 text-sm disabled:opacity-60">
          {currentBusy && busy?.action === "start" ? "در حال شروع..." : active ? "بستن محتوای درس" : "شروع درس"}
        </button>
        {active && <button type="button" disabled={currentBusy} onClick={() => action(lesson, "complete")} className="ghost-button rounded-xl px-5 py-2.5 text-sm disabled:opacity-60">{currentBusy && busy?.action === "complete" ? "در حال ثبت..." : "تکمیل درس"}</button>}
      </div>
      {feedback && <p className={`${feedback.type === "success" ? "feedback-success" : "feedback-error"} mt-4 rounded-xl p-3 text-sm`} role={feedback.type === "error" ? "alert" : "status"}>{feedback.text}</p>}
      {active && (
        <div className="mt-6 border-t border-border pt-6">
          <div className="bidi-text whitespace-pre-line leading-8 text-muted-foreground">{lesson.content}</div>
          {media.length > 0 && <MediaGallery media={media} title="رسانه‌های درس" compact={media.length === 1} className="mt-5" />}
          {lesson.attachment_url && <a href={lesson.attachment_url} target="_blank" rel="noopener noreferrer" className="brand-link mt-5 inline-block text-sm">دانلود پیوست درس</a>}
        </div>
      )}
    </li>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  // Three across on phones too, with the icon above the text there.
  return <div className="surface-card flex flex-col items-start gap-2 rounded-2xl p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-5"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-xl text-brand-accent">{icon}</span><div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><strong className="mt-1 block">{value}</strong></div></div>;
}
