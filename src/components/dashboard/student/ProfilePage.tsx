"use client";

import { type FormEvent, useState } from "react";
import type { CurrentLevel, User } from "@/lib/auth";
import { getApiSuccessMessage } from "@/lib/apiErrors";
import { formatPersianDate } from "@/lib/date";
import AsyncState from "@/components/ui/AsyncState";
import { updateProfile } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const levels: CurrentLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

type ProfileForm = {
  full_name: string;
  email: string;
  current_level: CurrentLevel;
};

export default function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user);
  const authStatus = useAppSelector((state) => state.auth.status);
  const updateStatus = useAppSelector((state) => state.auth.profileUpdateStatus);
  const authError = useAppSelector((state) => state.auth.error);

  if (!user) {
    return (
      <AsyncState
        message={authStatus === "error" ? authError ?? "دریافت پروفایل ناموفق بود." : "در حال دریافت پروفایل..."}
      />
    );
  }

  return <ProfileContent key={user.id} user={user} updateStatus={updateStatus} />;
}

function ProfileContent({
  user,
  updateStatus,
}: {
  user: User;
  updateStatus: "idle" | "loading" | "succeeded" | "failed";
}) {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<ProfileForm>(() => ({
    full_name: user.full_name,
    email: user.email,
    current_level: user.current_level ?? "A1",
  }));
  const [message, setMessage] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    try {
      await dispatch(updateProfile(form)).unwrap();
      setMessage(getApiSuccessMessage(200, "اطلاعات پروفایل با موفقیت ذخیره شد."));
    } catch (error) {
      setMessage(String(error || "ذخیره اطلاعات ناموفق بود."));
    }
  }

  const loading = updateStatus === "loading";

  return (
    <section className="mx-auto max-w-5xl">
      <div className="page-hero mb-6 rounded-3xl p-7">
        <p className="page-hero-muted">حساب کاربری</p>
        <h1 className="mt-2 text-3xl font-black">پروفایل دانش‌آموز</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <aside className="surface-card rounded-3xl p-6 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-accent-soft text-3xl font-black text-brand-secondary dark:text-brand-accent">
            {user?.full_name?.slice(0, 1) || "؟"}
          </div>
          <h2 className="mt-4 text-xl font-bold">{user?.full_name || "دانش‌آموز"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Info label="سطح" value={user?.current_level || "—"} />
            <Info label="نقش" value={user?.role === "student" ? "دانش‌آموز" : user?.role || "—"} />
          </div>
          <div className="mt-3 rounded-2xl bg-secondary-soft p-3 text-sm">
            <span className="text-muted-foreground">تاریخ عضویت: </span>
            {formatPersianDate(user?.date_joined)}
          </div>
        </aside>
        <form onSubmit={save} className="surface-card rounded-3xl p-6">
          <h2 className="mb-6 text-xl font-bold">ویرایش اطلاعات</h2>
          <label className="mb-2 block text-sm font-bold" htmlFor="profile-full-name">نام و نام خانوادگی</label>
          <input
            id="profile-full-name"
            required
            value={form.full_name}
            onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))}
            className="mb-5 w-full rounded-xl border border-input bg-card p-3"
          />
          <label className="mb-2 block text-sm font-bold" htmlFor="profile-email">ایمیل</label>
          <input
            id="profile-email"
            required
            type="email"
            dir="ltr"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="mb-5 w-full rounded-xl border border-input bg-card p-3 text-left"
          />
          <label className="mb-2 block text-sm font-bold" htmlFor="profile-level">سطح فعلی زبان</label>
          <select
            id="profile-level"
            value={form.current_level}
            onChange={(event) => setForm((current) => ({ ...current, current_level: event.target.value as CurrentLevel }))}
            className="mb-6 w-full rounded-xl border border-input bg-card p-3"
          >
            {levels.map((level) => <option key={level}>{level}</option>)}
          </select>
          {message && (
            <p className={`${message.includes("موفقیت") ? "feedback-success" : "feedback-error"} mb-4 rounded-xl p-3 text-sm`} role="status">
              {message}
            </p>
          )}
          <button disabled={loading} className="brand-button rounded-xl px-6 py-3">
            {loading ? "در حال پردازش..." : "ذخیره تغییرات"}
          </button>
        </form>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary-soft p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <strong className="mt-1 block">{value}</strong>
    </div>
  );
}
