"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { studentApi, type MyProgress } from "@/lib/studentApi";
import type { User } from "@/lib/auth";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { LanguageLevelGauge } from "./LanguageLevelGauge";

export default function StudentDashboardUI() {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<MyProgress>({
    courses: [],
    lessons: [],
  });
  const [enrollments, setEnrollments] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      studentApi.profile(),
      studentApi.progress(),
      studentApi.enrollments(),
    ])
      .then(([u, p, e]) => {
        setUser(u);
        setProgress(p);
        setEnrollments(e.count);
      })
      .catch((error) =>
        setError(getApiErrorMessage(error, "دریافت اطلاعات داشبورد ناموفق بود.")),
      );
  }, []);

  const completed = progress.lessons.filter(
    (x) => x.status === "completed",
  ).length;
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
      {error && (
        <div className="feedback-warning mb-5 rounded-2xl p-4" role="alert">
          {error}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="surface-card rounded-3xl p-5">
          <h2 className="font-bold">سطح فعلی زبان</h2>
          <LanguageLevelGauge level={user?.current_level ?? "A1"} />
        </div>
        <Stat
          title="کورس‌های ثبت‌نام‌شده"
          value={enrollments}
          link="/student/courses"
        />
        <Stat
          title="درس‌های تکمیل‌شده"
          value={completed}
          link="/student/lessons"
        />
      </div>
      <h2 className="mb-4 mt-8 text-xl font-black">دسترسی سریع</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["مهارت‌ها", "/student/skills"],
          ["سؤال‌ها", "/student/questions"],
          ["تمرین‌های تستی", "/student/tests"],
          ["پروفایل من", "/student/profile"],
        ].map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="surface-card rounded-2xl p-5 font-bold transition hover:-translate-y-1 hover:!border-brand-accent hover:text-brand-secondary dark:hover:text-brand-accent"
          >
            {label}
            <span className="float-left">←</span>
          </Link>
        ))}
      </div>
      {progress.courses.length > 0 && (
        <div className="surface-card mt-8 rounded-3xl p-6">
          <h2 className="mb-5 text-xl font-black">پیشرفت کورس‌ها</h2>
          <div className="space-y-5">
            {progress.courses.map((x) => {
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
  link,
}: {
  title: string;
  value: number;
  link: string;
}) {
  return (
    <div className="surface-card flex flex-col justify-between rounded-3xl p-6">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <strong className="mt-4 block text-5xl text-brand-secondary dark:text-brand-accent">
          {value.toLocaleString("fa-IR")}
        </strong>
      </div>
      <Link href={link} className="brand-link mt-6 text-sm">
        مشاهده جزئیات ←
      </Link>
    </div>
  );
}
