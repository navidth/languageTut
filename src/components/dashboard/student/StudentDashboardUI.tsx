"use client";

import { useEffect } from "react";
import Link from "next/link";
import AsyncState from "@/components/ui/AsyncState";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchStudentOverview } from "@/store/studentSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { LanguageLevelGauge } from "./LanguageLevelGauge";

export default function StudentDashboardUI() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const overview = useAppSelector((state) => state.student.overview);

  useEffect(() => {
    void dispatch(fetchStudentOverview());
  }, [dispatch]);

  const completed = overview.progress.lessons.filter(
    (x) => x.status === "completed",
  ).length;
  // Placeholders stand in for the numbers, so nothing moves once they arrive.
  const firstLoad = !overview.lastFetched && overview.status !== "failed";
  return (
    <section className="mx-auto max-w-6xl">
      <div className="page-hero mb-6 rounded-3xl p-7">
        <p className="page-hero-muted">
          سلام {user?.full_name || "دانش‌آموز"} 👋
        </p>
        <h1 className="mt-2 text-3xl font-black">داشبورد آموزشی من</h1>
        <p className="page-hero-muted mt-2">
          وضعیت یادگیری و دسترسی سریع به محتوای آموزشی
        </p>
      </div>
      <p role="status" className="sr-only">
        {firstLoad ? "در حال دریافت اطلاعات داشبورد..." : ""}
      </p>
      {overview.error && (
        <AsyncState
          message={overview.error}
          retry={() => void dispatch(fetchStudentOverview({ force: true }))}
          className="mb-5"
        />
      )}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3" aria-busy={firstLoad}>
        <div className="surface-card col-span-2 rounded-3xl p-5 md:col-span-1">
          <h2 className="font-bold">سطح فعلی زبان</h2>
          <LanguageLevelGauge level={user?.current_level ?? "A1"} />
        </div>
        <Stat
          title="کورس‌های ثبت‌نام‌شده"
          value={overview.enrollmentCount}
          loading={firstLoad}
          link="/student/courses"
        />
        <Stat
          title="درس‌های تکمیل‌شده"
          value={completed}
          loading={firstLoad}
          link="/student/lessons"
        />
      </div>
      <h2 className="mb-4 mt-8 text-xl font-black">دسترسی سریع</h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {[
          ["مهارت‌ها", "/student/skills"],
          ["سؤال‌ها", "/student/questions"],
          ["تمرین‌های تستی", "/student/tests"],
          ["تکالیف", "/student/homework"],
          ["پروفایل من", "/student/profile"],
        ].map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="surface-card rounded-2xl p-4 font-bold transition hover:-translate-y-1 hover:!border-brand-accent hover:text-brand-secondary sm:p-5 dark:hover:text-brand-accent"
          >
            {label}
            <span className="float-left">←</span>
          </Link>
        ))}
      </div>
      {overview.progress.courses.length > 0 && (
        <div className="surface-card mt-8 rounded-3xl p-6">
          <h2 className="mb-5 text-xl font-black">پیشرفت کورس‌ها</h2>
          <div className="space-y-5">
            {overview.progress.courses.map((x) => {
              const percent = Number(x.progress_percent || 0);
              return (
                <div key={x.id}>
                  <div className="mb-2 flex justify-between text-sm">
                    <strong>{x.course_title}</strong>
                    <span>{percent.toLocaleString("fa-IR")}٪</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-brand-accent"
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
function Stat({
  title,
  value,
  loading,
  link,
}: {
  title: string;
  value: number;
  loading: boolean;
  link: string;
}) {
  return (
    <div className="surface-card flex flex-col justify-between rounded-3xl p-5 sm:p-6">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        {loading ? (
          <Skeleton className="mt-4 h-12 w-16" />
        ) : (
          <strong className="mt-4 block text-5xl text-brand-secondary dark:text-brand-accent">
            {value.toLocaleString("fa-IR")}
          </strong>
        )}
      </div>
      <Link href={link} className="brand-link mt-6 text-sm">
        مشاهده جزئیات ←
      </Link>
    </div>
  );
}
