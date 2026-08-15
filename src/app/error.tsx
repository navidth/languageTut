"use client";

import { useEffect } from "react";
import Link from "next/link";
import { HiExclamationCircle, HiRefresh } from "react-icons/hi";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled application error", error);
  }, [error]);

  return (
    <main className="grid min-h-[70vh] place-items-center bg-background px-4 py-20 text-foreground">
      <div className="surface-card w-full max-w-xl rounded-[2rem] p-8 text-center sm:p-12">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-destructive-soft text-destructive">
          <HiExclamationCircle className="size-8" aria-hidden="true" />
        </span>
        <p className="mt-6 text-sm font-bold text-destructive">خطای غیرمنتظره</p>
        <h1 className="mt-2 text-3xl font-black">نمایش این بخش با مشکل روبه‌رو شد</h1>
        <p className="mt-4 leading-8 text-muted-foreground">
          اطلاعات شما حذف نشده است. دوباره تلاش کنید و اگر مشکل ادامه داشت، چند دقیقه دیگر بازگردید.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs text-muted-foreground" dir="ltr">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="brand-button inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3">
            <HiRefresh className="size-5" aria-hidden="true" />
            تلاش دوباره
          </button>
          <Link href="/" className="ghost-button inline-flex items-center justify-center rounded-xl px-6 py-3">
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </main>
  );
}
