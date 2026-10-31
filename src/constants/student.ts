import type { StudentResourcePageKind } from "@/types/student";

export const studentResourceTitles: Record<StudentResourcePageKind, [string, string]> = {
  levels: ["سطح‌های زبان", "مسیر استاندارد یادگیری از A1 تا C2"],
  courses: ["کورس‌های من", "دوره‌های ثبت‌نام‌شده و میزان پیشرفت شما"],
  lessons: ["درس‌ها", "محتوای آموزشی و وضعیت مطالعه"],
  questions: ["سؤال‌ها", "بانک سؤال‌های تمرینی"],
  tests: ["تمرین‌های تستی", "آزمون‌های زمان‌دار متناسب با سطح و مهارت"],
};

// Student dashboard

/** Courses listed under the featured one in "continue learning". */
export const DASHBOARD_MORE_COURSES = 3;

export const DASHBOARD_RECENT_RESULTS = 4;

export const DASHBOARD_UPCOMING_HOMEWORK = 3;

/**
 * Score colours when a test has no pass mark of its own: from this percent
 * a score reads as good, and below the second one as weak.
 */
export const SCORE_GOOD_PERCENT = 80;

export const SCORE_WEAK_PERCENT = 50;
