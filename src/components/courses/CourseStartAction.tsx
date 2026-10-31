"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HiCheckCircle, HiLockClosed } from "react-icons/hi";
import { useAuthFlow } from "@/components/auth/AuthFlowProvider";
import { LoadingContent } from "@/components/ui/PulseLoader";
import { getApiErrorMessage } from "@/lib/services/apiErrors";
import { openPaymentPage } from "@/lib/utils/payment";
import { activateCourse, fetchCourseDetail, selectCourseDetail } from "@/store/coursesSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { Course } from "@/types/course";
import { studentCoursePath } from "@/lib/utils/routes";
import { COURSE_LESSONS_SECTION_ID } from "@/constants/routes";

/**
 * The start button on the public course page. The server renders the course
 * without a user; once a student is known, access comes from the store.
 */
export default function CourseStartAction({ initialCourse }: { initialCourse: Course }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { startAuthFlow, busy: authBusy } = useAuthFlow();
  const status = useAppSelector((state) => state.auth.status);
  const user = useAppSelector((state) => state.auth.user);
  const course = useAppSelector((state) => selectCourseDetail(state, initialCourse.id)?.data) ?? initialCourse;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const authenticatedStudent = status === "authenticated" && user?.role === "student";

  // `has_access` in the server-rendered course is always false.
  useEffect(() => {
    if (authenticatedStudent) void dispatch(fetchCourseDetail({ id: initialCourse.id }));
  }, [authenticatedStudent, dispatch, initialCourse.id]);

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
      const { course: latest, purchase } = await dispatch(activateCourse(course.id)).unwrap();
      if (purchase?.payment_url) {
        openPaymentPage(purchase.payment_url);
        return;
      }
      if (!latest.has_access) {
        throw new Error(purchase?.detail || "دسترسی دوره هنوز فعال نشده است.");
      }
      router.push(`${studentCoursePath(course.id)}#${COURSE_LESSONS_SECTION_ID}`);
    } catch (reason) {
      setError(getApiErrorMessage(reason, "شروع دوره ناموفق بود. دوباره تلاش کنید."));
    } finally {
      setBusy(false);
    }
  }

  const hasAccess = authenticatedStudent && course.has_access;
  const checkingAccount = status === "loading" || authBusy;
  const label = !user
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
        aria-busy={busy || checkingAccount}
        className="brand-button w-full rounded-xl px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LoadingContent
          loading={busy || checkingAccount}
          label={busy ? "در حال آماده‌سازی دوره" : "در حال بررسی حساب"}
        >
          {label}
        </LoadingContent>
      </button>
      {error && <p className="mt-3 text-xs leading-6 text-red-200" role="alert">{error}</p>}
    </div>
  );
}
