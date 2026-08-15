"use client";

import { FormEvent, useEffect, useState } from "react";
import { studentApi } from "@/lib/studentApi";
import type { CurrentLevel, User } from "@/lib/auth";
import { getApiErrorMessage, getApiSuccessMessage } from "@/lib/apiErrors";

const levels: CurrentLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({ full_name: "", email: "", current_level: "A1" as CurrentLevel });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi.profile().then((data) => {
      setUser(data);
      setForm({ full_name: data.full_name, email: data.email, current_level: data.current_level ?? "A1" });
    }).catch((error) => setMessage(getApiErrorMessage(error, "دریافت پروفایل ناموفق بود."))).finally(() => setLoading(false));
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault(); setLoading(true); setMessage("");
    try {
      const data = await studentApi.updateProfile(form);
      setUser(data); localStorage.setItem("user", JSON.stringify(data));
      setMessage(getApiSuccessMessage(200, "اطلاعات پروفایل با موفقیت ذخیره شد."));
    } catch (error) { setMessage(getApiErrorMessage(error, "ذخیره اطلاعات ناموفق بود.")); } finally { setLoading(false); }
  }

  return <section className="mx-auto max-w-5xl">
    <div className="page-hero mb-6 rounded-3xl p-7"><p className="page-hero-muted">حساب کاربری</p><h1 className="mt-2 text-3xl font-black">پروفایل دانش‌آموز</h1></div>
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      <aside className="surface-card rounded-3xl p-6 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-accent-soft text-3xl font-black text-brand-secondary dark:text-brand-accent">{user?.full_name?.slice(0, 1) || "؟"}</div>
        <h2 className="mt-4 text-xl font-bold">{user?.full_name || "دانش‌آموز"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
        <div className="mt-6 grid grid-cols-2 gap-3"><Info label="سطح" value={user?.current_level || "—"} /><Info label="نقش" value={user?.role === "student" ? "دانش‌آموز" : user?.role || "—"} /></div>
        <div className="mt-3 rounded-2xl bg-secondary-soft p-3 text-sm"><span className="text-muted-foreground">تاریخ عضویت: </span>{user?.date_joined ? new Date(user.date_joined).toLocaleDateString("fa-IR") : "—"}</div>
      </aside>
      <form onSubmit={save} className="surface-card rounded-3xl p-6">
        <h2 className="mb-6 text-xl font-bold">ویرایش اطلاعات</h2>
        <label className="mb-2 block text-sm font-bold">نام و نام خانوادگی</label>
        <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mb-5 w-full rounded-xl border border-input bg-card p-3" />
        <label className="mb-2 block text-sm font-bold">ایمیل</label>
        <input required type="email" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mb-5 w-full rounded-xl border border-input bg-card p-3 text-left" />
        <label className="mb-2 block text-sm font-bold">سطح فعلی زبان</label>
        <select value={form.current_level} onChange={(e) => setForm({ ...form, current_level: e.target.value as CurrentLevel })} className="mb-6 w-full rounded-xl border border-input bg-card p-3">{levels.map((x) => <option key={x}>{x}</option>)}</select>
        {message && <p className={`${message.includes("موفقیت") ? "feedback-success" : "feedback-error"} mb-4 rounded-xl p-3 text-sm`} role="status">{message}</p>}
        <button disabled={loading} className="brand-button rounded-xl px-6 py-3">{loading ? "در حال پردازش..." : "ذخیره تغییرات"}</button>
      </form>
    </div>
  </section>;
}
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-secondary-soft p-3"><div className="text-xs text-muted-foreground">{label}</div><strong className="mt-1 block">{value}</strong></div>; }
