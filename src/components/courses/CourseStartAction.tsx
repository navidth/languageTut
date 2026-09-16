"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HiCheckCircle, HiLockClosed } from "react-icons/hi";
import { useAuthFlow } from "@/components/auth/AuthFlowProvider";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { coursesApi, type Course } from "@/lib/courses";
import { studentApi } from "@/lib/studentApi";
import { useAppSelector } from "@/store/hooks";

export default function CourseStartAction({ initialCourse }: { initialCourse: Course }) {
  const router = useRouter();
  const { startAuthFlow, busy: authBusy } = useAuthFlow();
  const { status, user } = useAppSelector((state) => state.auth);
  const [course, setCourse] = useState(initialCourse);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refreshAccess = useCallback(async () => {
    const latestCourse = await coursesApi.get(initialCourse.id);
    setCourse(latestCourse);
    return latestCourse;
  }, [initialCourse.id]);

  useEffect(() => {
    if (status !== "authenticated" || user?.role !== "student") return;
    void refreshAccess().catch(() => undefined);
  }, [refreshAccess, status, user?.role]);

  function openLessons() {
    router.push(`/student/all-courses/${course.id}#course-lessons-title`);
  }

  async function handleAction() {
    setError("");

    if (status !== "authenticated" || !user) {
      await startAuthFlow("learning");
      return;
    }

    if (user.role !== "student") {
      setError("شروع دوره فقط از حساب دانش‌آموز امکان‌پذیر است.");
      return;
    }

    setBusy(true);
    try {
      const latest = await refreshAccess();
      if (latest.has_access) {
        openLessons();
        return;
      }

      const purchase = await studentApi.purchaseCourse(course.id);
      if (purchase.payment_url) {
        const paymentUrl = new URL(purchase.payment_url);
        if (paymentUrl.protocol !== "https:" && paymentUrl.protocol !== "http:") {
          throw new Error("نشانی درگاه پرداخت معتبر نیست.");
        }
        window.location.assign(paymentUrl.toString());
        return;
      }

      const activated = await refreshAccess();
      if (!activated.has_access) {
        throw new Error(purchase.detail || "دسترسی دوره هنوز فعال نشده است.");
      }
      openLessons();
    } catch (reason) {
      setError(getApiErrorMessage(reason, "شروع دوره ناموفق بود. دوباره تلاش کنید."));
    } finally {
      setBusy(false);
    }
  }

  const authenticatedStudent = status === "authenticated" && user?.role === "student";
  const hasAccess = authenticatedStudent && course.has_access;
  const label = status === "loading" || authBusy
    ? "در حال بررسی حساب..."
    : !user
      ? "ورود و شروع دوره"
      : user.role !== "student"
        ? "ویژه دانش‌آموزان"
        : hasAccess
          ? "شروع یادگیری"
          : course.is_free
            ? "ثبت‌نام رایگان و شروع"
            : "خرید و شروع دوره";

  return (
    <div className="mt-5 border-t border-white/10 pt-4">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white/75">
        {hasAccess ? (
          <>
            <HiCheckCircle className="size-5 text-success" aria-hidden="true" />
            دسترسی شما فعال است
          </>
        ) : (
          <>
            <HiLockClosed className="size-5 text-brand-accent" aria-hidden="true" />
            {course.is_free ? "ثبت‌نام رایگان" : "برای مشاهده کامل، دوره را تهیه کنید"}
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => void handleAction()}
        disabled={busy || authBusy || status === "loading" || (Boolean(user) && user?.role !== "student")}
        className="brand-button w-full rounded-xl px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "در حال آماده‌سازی دوره..." : label}
      </button>
      {error && <p className="mt-3 text-xs leading-6 text-red-200" role="alert">{error}</p>}
    </div>
  );
}
