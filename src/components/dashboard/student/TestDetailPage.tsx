"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { studentApi, type PracticeTest } from "@/lib/studentApi";

export default function TestDetailPage({ id }: { id: number }) {
  const [test, setTest] = useState<PracticeTest | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState("");
  useEffect(() => { studentApi.test(id).then(setTest).catch(() => setError("دریافت آزمون ناموفق بود یا به آن دسترسی ندارید.")); }, [id]);
  if (error) return <div className="rounded-2xl bg-red-50 p-6 text-red-700">{error}</div>;
  if (!test) return <div className="p-10 text-center">در حال دریافت آزمون...</div>;
  return <section className="mx-auto max-w-4xl">
    <Link href="/student/tests" className="text-sm text-primary">→ بازگشت به آزمون‌ها</Link>
    <header className="my-5 rounded-3xl bg-gradient-to-l from-blue-800 to-blue-600 p-7 text-white"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-blue-100">سطح {test.level}</p><h1 className="mt-2 text-3xl font-black">{test.title}</h1></div><div className="rounded-2xl bg-white/15 px-5 py-3">{test.duration_minutes} دقیقه · {test.questions_count} سؤال</div></div><p className="mt-4 text-blue-100">{test.description}</p></header>
    <div className="space-y-4">{test.questions?.map((q, index) => { const options = Array.isArray(q.options) ? q.options : []; return <article key={q.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm"><h2 className="font-bold leading-8"><span className="ml-2 text-primary">{(index + 1).toLocaleString("fa-IR")}.</span>{q.question_text}</h2>{options.length ? <div className="mt-4 space-y-2">{options.map((option, i) => <label key={i} className="flex cursor-pointer gap-3 rounded-xl border border-border p-3 hover:border-primary"><input type="radio" name={`q-${q.id}`} checked={answers[q.id] === String(option)} onChange={() => setAnswers({ ...answers, [q.id]: String(option) })} />{String(option)}</label>)}</div> : <textarea value={answers[q.id] || ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} className="mt-4 min-h-28 w-full rounded-xl border border-border bg-background p-3" placeholder="پاسخ خود را بنویسید..." />}</article>; })}</div>
    {!test.questions?.length && <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">سؤالی برای این آزمون ثبت نشده است.</div>}
    <p className="mt-5 rounded-xl bg-orange-50 p-4 text-sm text-orange-800">پاسخ‌ها در این صفحه نگه‌داری می‌شوند. API فعلی برای ارسال پاسخ دانش‌آموز schema مشخصی ارائه نکرده است؛ بنابراین برای جلوگیری از ارسال اشتباه، دکمه ثبت نهایی فعال نشده است.</p>
  </section>;
}
