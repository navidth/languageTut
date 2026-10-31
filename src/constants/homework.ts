import type { HomeworkDisplayStatus, HomeworkScope } from "@/types/homework";
import type { StatusTone } from "@/types/ui";
import type { ApiErrorKind } from "@/types/api";

export const HOMEWORK_SCOPES = ["course", "lesson"] as const;

export const HOMEWORK_SUBMISSION_STATUSES = ["submitted", "graded"] as const;

export const homeworkStatusLabels: Record<HomeworkDisplayStatus, string> = {
  "not-started": "هنوز شروع نشده",
  open: "در انتظار ارسال",
  "late-open": "مهلت گذشته · ارسال با تأخیر",
  closed: "مهلت به پایان رسیده",
  submitted: "ارسال شده",
  "submitted-late": "ارسال شده با تأخیر",
  graded: "نمره‌دهی شده",
  unpublished: "منتشر نشده",
};

export const homeworkStatusDescriptions: Record<HomeworkDisplayStatus, string> = {
  "not-started": "ارسال پاسخ برای این تکلیف هنوز باز نشده است.",
  open: "پاسخ خود را پیش از پایان مهلت بارگذاری کنید.",
  "late-open":
    "مهلت این تکلیف گذشته است، اما ارسال با تأخیر همچنان پذیرفته می‌شود.",
  closed: "مهلت ارسال این تکلیف به پایان رسیده و ارسال جدید پذیرفته نمی‌شود.",
  submitted: "پاسخ شما دریافت شده و در انتظار بررسی مدرس است.",
  "submitted-late":
    "پاسخ شما پس از پایان مهلت دریافت شده و در انتظار بررسی مدرس است.",
  graded: "مدرس پاسخ شما را بررسی و نمره‌دهی کرده است.",
  unpublished: "این تکلیف هنوز منتشر نشده است.",
};

export const homeworkStatusTones: Record<HomeworkDisplayStatus, StatusTone> = {
  "not-started": "neutral",
  open: "info",
  "late-open": "warning",
  closed: "danger",
  submitted: "success",
  "submitted-late": "warning",
  graded: "success",
  unpublished: "neutral",
};

export const homeworkScopeLabels: Record<HomeworkScope, string> = {
  course: "تکلیف دوره",
  lesson: "تکلیف درس",
};

export const HOUR_MS = 3_600_000;

export const DAY_MS = 24 * HOUR_MS;

/** Error kinds that suggest the cached homework no longer matches the server. */
export const STALE_STATE_KINDS = new Set([
  "validation",
  "authorization",
  "conflict",
  "not-found",
]);

export const homeworkActionLabels: Record<HomeworkDisplayStatus, string> = {
  "not-started": "مشاهده جزئیات",
  open: "مشاهده و ارسال پاسخ",
  "late-open": "مشاهده و ارسال پاسخ",
  closed: "مشاهده جزئیات",
  submitted: "مشاهده ارسال",
  "submitted-late": "مشاهده ارسال",
  graded: "مشاهده نمره و بازخورد",
  unpublished: "مشاهده جزئیات",
};

export const homeworkErrorMessages: Partial<Record<ApiErrorKind, string>> = {
  "not-found": "تکلیف موردنظر پیدا نشد یا دیگر در دسترس نیست.",
  authorization: "شما اجازه مشاهده این تکلیف را ندارید.",
};
