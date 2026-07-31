"use client";

import { useAppSelector } from "@/store/hooks";

export default function TeacherDashboardUI() {
  const { user, status } = useAppSelector((state) => state.auth);

  if (status === "loading" || status === "idle") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center" role="status">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <span
            className="size-9 animate-spin rounded-full border-4 border-primary/20 border-t-primary"
            aria-hidden="true"
          />
          <span>در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">پنل مدرس</h1>
        <p className="mt-2 text-muted-foreground">
          {user
            ? `خوش آمدید، ${user.full_name}`
            : "برای دسترسی به پنل مدرس وارد حساب کاربری خود شوید."}
        </p>
      </div>

      {user && (
        <div className="rounded-xl border border-secondary/40 bg-secondary/5 p-6 space-y-3">
          <h2 className="text-lg font-semibold">اطلاعات حساب</h2>
          <dl className="grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">نام</dt>
              <dd className="font-medium">{user.full_name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">ایمیل</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">نقش</dt>
              <dd className="font-medium">مدرس</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">تاریخ عضویت</dt>
              <dd className="font-medium">
                {new Date(user.date_joined).toLocaleDateString("fa-IR")}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
