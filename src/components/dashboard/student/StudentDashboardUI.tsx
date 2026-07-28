"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { studentApi, type MyProgress } from "@/lib/studentApi";
import type { User } from "@/lib/auth";
import { LanguageLevelGauge } from "./LanguageLevelGauge";

export default function StudentDashboardUI() {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<MyProgress>({ courses: [], lessons: [] });
  const [enrollments, setEnrollments] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([studentApi.profile(), studentApi.progress(), studentApi.enrollments()])
      .then(([u, p, e]) => { setUser(u); setProgress(p); setEnrollments(e.count); })
      .catch(() => setError("برای دریافت اطلاعات داشبورد وارد حساب دانش‌آموزی شوید."));
  }, []);

  const completed = progress.lessons.filter((x) => x.status === "completed").length;
  return <section className="mx-auto max-w-6xl">
    <div className="mb-6 rounded-3xl bg-gradient-to-l from-blue-800 to-blue-600 p-7 text-white shadow-lg">
      <p className="text-blue-100">سلام {user?.full_name || "دانش‌آموز"} 👋</p>
      <h1 className="mt-2 text-3xl font-black">داشبورد آموزشی من</h1>
      <p className="mt-2 text-blue-100">وضعیت یادگیری و دسترسی سریع به محتوای آموزشی</p>
    </div>
    {error && <div className="mb-5 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-orange-800">{error}</div>}
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm"><h2 className="font-bold">سطح فعلی زبان</h2><LanguageLevelGauge level={user?.current_level ?? "A1"} /></div>
      <Stat title="کورس‌های ثبت‌نام‌شده" value={enrollments} link="/student/courses" />
      <Stat title="درس‌های تکمیل‌شده" value={completed} link="/student/lessons" />
    </div>
    <h2 className="mb-4 mt-8 text-xl font-black">دسترسی سریع</h2>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[["مهارت‌ها","/student/skills"],["سؤال‌ها","/student/questions"],["تمرین‌های تستی","/student/tests"],["پروفایل من","/student/profile"]].map(([label, href]) =>
        <Link key={href} href={href} className="rounded-2xl border border-border bg-card p-5 font-bold shadow-sm transition hover:-translate-y-1 hover:border-primary hover:text-primary">{label}<span className="float-left">←</span></Link>)}
    </div>
    {progress.courses.length > 0 && <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm"><h2 className="mb-5 text-xl font-black">پیشرفت کورس‌ها</h2><div className="space-y-5">{progress.courses.map((x) => { const percent = Number(x.progress_percent || 0); return <div key={x.id}><div className="mb-2 flex justify-between text-sm"><strong>{x.course_title}</strong><span>{percent.toLocaleString("fa-IR")}٪</span></div><div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, percent)}%` }} /></div></div>; })}</div></div>}
  </section>;
}
function Stat({ title, value, link }: { title: string; value: number; link: string }) { return <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm"><div><p className="text-sm text-muted-foreground">{title}</p><strong className="mt-4 block text-5xl text-primary">{value.toLocaleString("fa-IR")}</strong></div><Link href={link} className="mt-6 text-sm font-bold text-primary">مشاهده جزئیات ←</Link></div>; }
