"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { studentApi, type Lesson, type Paginated, type PracticeTest, type Question } from "@/lib/studentApi";
import type { Course, Level } from "@/lib/courses";
import MediaGallery from "@/components/media/MediaGallery";
import Pagination from "@/components/ui/Pagination";

export type ResourceKind = "levels" | "courses" | "lessons" | "questions" | "tests";
type Item = Level | Course | Lesson | Question | PracticeTest;

const titles: Record<ResourceKind, [string, string]> = {
  levels: ["سطح‌های زبان", "مسیر استاندارد یادگیری از A1 تا C2"],
  courses: ["کورس‌های من", "دوره‌های ثبت‌نام‌شده و میزان پیشرفت شما"],
  lessons: ["درس‌ها", "محتوای آموزشی و وضعیت مطالعه"],
  questions: ["سؤال‌ها", "بانک سؤال‌های تمرینی"],
  tests: ["تمرین‌های تستی", "آزمون‌های زمان‌دار متناسب با سطح و مهارت"],
};
const skillNames: Record<string, string> = {
  listening: "شنیداری", reading: "خواندن", writing: "نوشتن", speaking: "مکالمه",
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
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ count: 0, next: null as string | null, previous: null as string | null });

  const load = useCallback(async (requestedPage: number) => {
    setLoading(true); setError("");
    try {
      let result: Paginated<Item>;

      if (kind === "courses") {
        const enrollments = await studentApi.enrollments(requestedPage);
        const courses = await Promise.all(
          enrollments.results.map((enrollment) => studentApi.course(enrollment.course)),
        );
        result = { ...enrollments, results: courses };
      } else {
        const loaders = {
          levels: studentApi.levels, lessons: studentApi.lessons,
          questions: studentApi.questions, tests: studentApi.tests,
        };
        result = await loaders[kind](requestedPage) as Paginated<Item>;
      }

      setItems(result.results);
      setPagination({ count: result.count, next: result.next, previous: result.previous });
    } catch (e) { setError(getApiErrorMessage(e, "دریافت اطلاعات از سرور ناموفق بود.")); } finally { setLoading(false); }
  }, [kind]);

  useEffect(() => { void load(page); }, [load, page]);

  async function lessonAction(id: number, complete: boolean) {
    setBusy(id);
    try {
      await (complete ? studentApi.completeLesson(id) : studentApi.startLesson(id));
      await load(page);
    } catch (e) { setError(getApiErrorMessage(e, "انجام عملیات درس ناموفق بود.")); } finally { setBusy(null); }
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="page-hero mb-7 rounded-3xl p-7">
        <p className="page-hero-muted mb-2 text-sm">{eyebrow}</p>
        <h1 className="text-3xl font-black">{heading ?? titles[kind][0]}</h1>
        <p className="page-hero-muted mt-2">{description ?? titles[kind][1]}</p>
      </div>
      {loading && <Status text="در حال دریافت اطلاعات..." />}
      {error && <Status text={error} retry={() => void load(page)} />}
      {!loading && !error && items.length === 0 && <Status text="در حال حاضر موردی برای نمایش وجود ندارد." />}
      {!loading && !error && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article key={item.id} className="surface-card rounded-2xl p-5">
                {kind === "levels" && <LevelCard item={item as Level} />}
                {kind === "courses" && <CourseCard item={item as Course} />}
                {kind === "lessons" && <LessonCard item={item as Lesson} busy={busy === item.id} action={lessonAction} />}
                {kind === "questions" && <QuestionCard item={item as Question} />}
                {kind === "tests" && <TestCard item={item as PracticeTest} />}
              </article>
            ))}
          </div>
          <Pagination
            currentPage={page}
            count={pagination.count}
            resultsCount={items.length}
            next={pagination.next}
            previous={pagination.previous}
            onPageChange={setPage}
            loading={loading}
            ariaLabel={`صفحه‌بندی ${heading ?? titles[kind][0]}`}
          />
        </>
      )}
    </section>
  );
}

function Status({ text, retry }: { text: string; retry?: () => void }) {
  return <div className="surface-card rounded-2xl p-10 text-center text-muted-foreground">
    <p>{text}</p>{retry && <button onClick={retry} className="brand-button mt-4 rounded-xl px-5 py-2">تلاش دوباره</button>}
  </div>;
}
function LevelCard({ item }: { item: Level }) {
  return <><span lang="en" dir="ltr" className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-xl font-black text-brand-secondary dark:text-brand-accent">{item.code}</span>
    <h2 className="mt-4 text-xl font-bold">{item.title}</h2><p className="mt-2 text-sm text-muted-foreground">مرحله {item.order.toLocaleString("fa-IR")} مسیر آموزش</p></>;
}
function CourseCard({ item }: { item: Course }) {
  const type = item.course_type === "ielts" ? "آیلتس" : item.course_type === "general" ? "زبان عمومی" : item.course_type;
  return <>
    <MediaGallery media={item.media} compact limit={1} audioLabel="فایل صوتی دوره" videoLabel="ویدئوی دوره" className="-mx-5 -mt-5 mb-5" />
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="brand-badge rounded-full px-3 py-1 text-sm">سطح {item.level_detail?.code}</span>
      <span className="text-sm text-muted-foreground">{type}</span>
    </div>
    <h2 className="mt-4 text-xl font-bold">{item.title}</h2>
    <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">{item.description || "بدون توضیحات"}</p>
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
  return <><div className="flex justify-between"><span className="rounded-full bg-secondary-soft px-3 py-1 text-sm font-bold text-brand-secondary dark:text-white">{skillNames[item.skill_detail?.name] ?? "درس"}</span><span className="text-sm text-muted-foreground">درس {item.order}</span></div>
    <h2 className="mt-4 text-lg font-bold">{item.title}</h2><div className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground" dangerouslySetInnerHTML={{ __html: item.content }} />
    <div className="mt-5 flex gap-2"><button disabled={busy} onClick={() => action(item.id, false)} className="brand-button rounded-xl px-4 py-2 text-sm">شروع درس</button><button disabled={busy} onClick={() => action(item.id, true)} className="ghost-button rounded-xl px-4 py-2 text-sm">تکمیل شد</button></div></>;
}
function QuestionCard({ item }: { item: Question }) {
  const options = Array.isArray(item.options) ? item.options : [];
  return <><span className="text-xs text-muted-foreground">نوع: {item.question_type}</span><h2 className="mt-3 font-bold leading-7">{item.question_text}</h2>
    {options.length > 0 && <ul className="mt-4 space-y-2">{options.map((x, i) => <li key={i} className="rounded-lg bg-secondary-soft p-2 text-sm">{String(x)}</li>)}</ul>}</>;
}
function TestCard({ item }: { item: PracticeTest }) {
  return <><div className="flex justify-between"><span className="brand-badge rounded-full px-3 py-1 text-sm">سطح {item.level}</span><span className="text-sm text-muted-foreground">{item.duration_minutes} دقیقه</span></div>
    <h2 className="mt-4 text-xl font-bold">{item.title}</h2><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.description || "آزمون تمرینی"}</p>
    <div className="mt-4 flex items-center justify-between"><span className="text-sm">{item.questions_count} سؤال</span><Link href={`/student/tests/${item.id}`} className="brand-button rounded-xl px-4 py-2 text-sm">ورود به آزمون</Link></div></>;
}
