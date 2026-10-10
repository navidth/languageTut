import type { StatusTone } from "@/types";
import { formatPersianDateTime } from "./date";
import {
  HOMEWORK_SCOPES,
  type Homework,
  type HomeworkScope,
} from "./homeworkApi";
import { parsePageParam } from "./pagination";

/**
 * UI state of a homework for the current student. The backend only reports
 * `submitted` / `graded` on a submission, so the remaining states are derived
 * from `my_submission`, `has_started`, `is_past_due` and
 * `allow_late_submissions`.
 */
export type HomeworkDisplayStatus =
  | "not-started"
  | "open"
  | "late-open"
  | "closed"
  | "submitted"
  | "submitted-late"
  | "graded"
  | "unpublished";

type HomeworkStatusSource = Pick<
  Homework,
  | "is_published"
  | "has_started"
  | "is_past_due"
  | "is_open"
  | "allow_late_submissions"
  | "my_submission"
>;

export function resolveHomeworkStatus(
  homework: HomeworkStatusSource,
): HomeworkDisplayStatus {
  const submission = homework.my_submission;
  if (submission) {
    if (submission.status === "graded") return "graded";
    return submission.is_late ? "submitted-late" : "submitted";
  }
  if (!homework.is_published) return "unpublished";
  if (!homework.has_started) return "not-started";
  if (homework.is_past_due) {
    return homework.allow_late_submissions ? "late-open" : "closed";
  }
  return "open";
}

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

/** Uses the server's `is_open`, which also covers a start time still ahead. */
export function isSubmissionWindowOpen(homework: Pick<Homework, "is_open">) {
  return homework.is_open;
}

/** The status sentence, with the opening time when it is still ahead. */
export function describeHomeworkStatus(
  homework: HomeworkStatusSource & Pick<Homework, "starts_at">,
) {
  const status = resolveHomeworkStatus(homework);
  if (status === "not-started" && homework.starts_at) {
    return `ارسال پاسخ از ${formatPersianDateTime(homework.starts_at)} امکان‌پذیر است.`;
  }
  return homeworkStatusDescriptions[status];
}

/** Covers both the first upload and replacing a not-yet-graded submission. */
export function canSubmitHomework(homework: HomeworkStatusSource) {
  return (
    isSubmissionWindowOpen(homework) &&
    homework.my_submission?.status !== "graded"
  );
}

export function canDeleteHomeworkSubmission(
  homework: Pick<Homework, "my_submission">,
) {
  return (
    homework.my_submission !== null &&
    homework.my_submission.status !== "graded"
  );
}

export const homeworkScopeLabels: Record<HomeworkScope, string> = {
  course: "تکلیف دوره",
  lesson: "تکلیف درس",
};

export function formatHomeworkScope(scope: string | null | undefined) {
  return scope && scope in homeworkScopeLabels
    ? homeworkScopeLabels[scope as HomeworkScope]
    : "تکلیف";
}

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

export type DueDateInfo = {
  text: string;
  tone: StatusTone;
};

/**
 * Describes how far the deadline is from `referenceTime` (the moment the data
 * was fetched), which keeps the calculation pure for rendering.
 */
export function describeDueDate(
  dueAt: string | null | undefined,
  referenceTime: number | null | undefined,
): DueDateInfo | null {
  if (!dueAt || typeof referenceTime !== "number") return null;
  const due = Date.parse(dueAt);
  if (Number.isNaN(due)) return null;

  const difference = due - referenceTime;
  const distance = Math.abs(difference);
  const amount =
    distance >= DAY_MS
      ? `${Math.floor(distance / DAY_MS).toLocaleString("fa-IR")} روز`
      : distance >= HOUR_MS
        ? `${Math.floor(distance / HOUR_MS).toLocaleString("fa-IR")} ساعت`
        : "کمتر از یک ساعت";

  if (difference < 0) {
    return { text: `${amount} از مهلت گذشته است`, tone: "danger" };
  }
  return {
    text: `${amount} تا پایان مهلت`,
    tone: distance < 2 * DAY_MS ? "warning" : "neutral",
  };
}

export type HomeworkSearchParams = {
  page: number;
  course?: number;
  scope?: HomeworkScope;
};

type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePositiveInteger(value: string | string[] | undefined) {
  const raw = firstValue(value);
  if (!raw || !/^\d+$/.test(raw)) return undefined;
  const parsed = Number.parseInt(raw, 10);
  return parsed > 0 ? parsed : undefined;
}

/** Reads the homework list filters from the URL query of the page. */
export function parseHomeworkSearchParams(
  params: RawSearchParams,
): HomeworkSearchParams {
  const scope = firstValue(params.scope);
  return {
    page: parsePageParam(params.page),
    course: parsePositiveInteger(params.course),
    scope: HOMEWORK_SCOPES.find((candidate) => candidate === scope),
  };
}
