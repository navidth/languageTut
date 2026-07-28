"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AxiosError } from "axios";
import { studentApi, type Lesson, type PracticeTest, type Question } from "@/lib/studentApi";
import type { Course, Level } from "@/lib/courses";

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

function apiError(error: unknown) {
  const e = error as AxiosError<{ detail?: string }>;
  if (e.response?.status === 401) return "برای مشاهده این بخش ابتدا وارد حساب دانش‌آموزی شوید.";
  return e.response?.data?.detail || "دریافت اطلاعات از سرور ناموفق بود. دوباره تلاش کنید.";
}

export default function StudentResourcePage({ kind }: { kind: ResourceKind }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      if (kind === "courses") {
        const [enrollments, courses] = await Promise.all([studentApi.enrollments(), studentApi.courses()]);
        const ids = new Set(enrollments.results.map((x) => x.course));
        setItems(courses.results.filter((x) => ids.has(x.id)));
      } else {
        const loaders = {
          levels: studentApi.levels, lessons: studentApi.lessons,
          questions: studentApi.questions, tests: studentApi.tests,
        };
        const result = await loaders[kind]();
        setItems(result.results as Item[]);
      }
    } catch (e) { setError(apiError(e)); } finally { setLoading(false); }
  }, [kind]);

  useEffect(() => { void load(); }, [load]);

  async function lessonAction(id: number, complete: boolean) {
    setBusy(id);
    try {
      await (complete ? studentApi.completeLesson(id) : studentApi.startLesson(id));
      await load();
    } catch (e) { setError(apiError(e)); } finally { setBusy(null); }
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-7 rounded-3xl bg-gradient-to-l from-blue-800 to-blue-600 p-7 text-white shadow-lg">
        <p className="mb-2 text-sm text-blue-100">پنل دانش‌آموز</p>
        <h1 className="text-3xl font-black">{titles[kind][0]}</h1>
        <p className="mt-2 text-blue-100">{titles[kind][1]}</p>
      </div>
      {loading && <Status text="در حال دریافت اطلاعات..." />}
      {error && <Status text={error} retry={load} />}
      {!loading && !error && items.length === 0 && <Status text="در حال حاضر موردی برای نمایش وجود ندارد." />}
      {!loading && !error && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              {kind === "levels" && <LevelCard item={item as Level} />}
              {kind === "courses" && <CourseCard item={item as Course} />}
              {kind === "lessons" && <LessonCard item={item as Lesson} busy={busy === item.id} action={lessonAction} />}
              {kind === "questions" && <QuestionCard item={item as Question} />}
              {kind === "tests" && <TestCard item={item as PracticeTest} />}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function Status({ text, retry }: { text: string; retry?: () => void }) {
  return <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
    <p>{text}</p>{retry && <button onClick={retry} className="mt-4 rounded-xl bg-primary px-5 py-2 text-white">تلاش دوباره</button>}
  </div>;
}
function LevelCard({ item }: { item: Level }) {
  return <><span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-xl font-black text-blue-700">{item.code}</span>
    <h2 className="mt-4 text-xl font-bold">{item.title}</h2><p className="mt-2 text-sm text-muted-foreground">مرحله {item.order.toLocaleString("fa-IR")} مسیر آموزش</p></>;
}
function CourseCard({ item }: { item: Course }) {
  return <><div className="flex justify-between"><span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">سطح {item.level_detail?.code}</span><span className="text-sm text-muted-foreground">{item.lessons_count} درس</span></div>
    <h2 className="mt-4 text-xl font-bold">{item.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">{item.description || "بدون توضیحات"}</p>
    <Link href={`/courses/${item.id}`} className="mt-5 inline-block text-sm font-bold text-primary">مشاهده جزئیات ←</Link></>;
}
function LessonCard({ item, busy, action }: { item: Lesson; busy: boolean; action: (id: number, complete: boolean) => void }) {
  return <><div className="flex justify-between"><span className="rounded-full bg-violet-100 px-3 py-1 text-sm text-violet-700">{skillNames[item.skill_detail?.name] ?? "درس"}</span><span className="text-sm text-muted-foreground">درس {item.order}</span></div>
    <h2 className="mt-4 text-lg font-bold">{item.title}</h2><div className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground" dangerouslySetInnerHTML={{ __html: item.content }} />
    <div className="mt-5 flex gap-2"><button disabled={busy} onClick={() => action(item.id, false)} className="rounded-xl bg-primary px-4 py-2 text-sm text-white disabled:opacity-50">شروع درس</button><button disabled={busy} onClick={() => action(item.id, true)} className="rounded-xl border border-border px-4 py-2 text-sm">تکمیل شد</button></div></>;
}
function QuestionCard({ item }: { item: Question }) {
  const options = Array.isArray(item.options) ? item.options : [];
  return <><span className="text-xs text-muted-foreground">نوع: {item.question_type}</span><h2 className="mt-3 font-bold leading-7">{item.question_text}</h2>
    {options.length > 0 && <ul className="mt-4 space-y-2">{options.map((x, i) => <li key={i} className="rounded-lg bg-secondary p-2 text-sm">{String(x)}</li>)}</ul>}</>;
}
function TestCard({ item }: { item: PracticeTest }) {
  return <><div className="flex justify-between"><span className="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-700">سطح {item.level}</span><span className="text-sm text-muted-foreground">{item.duration_minutes} دقیقه</span></div>
    <h2 className="mt-4 text-xl font-bold">{item.title}</h2><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.description || "آزمون تمرینی"}</p>
    <div className="mt-4 flex items-center justify-between"><span className="text-sm">{item.questions_count} سؤال</span><Link href={`/student/tests/${item.id}`} className="rounded-xl bg-primary px-4 py-2 text-sm text-white">ورود به آزمون</Link></div></>;
}
