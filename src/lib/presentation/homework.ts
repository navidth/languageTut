import { formatPersianDateTime } from "@/lib/utils/date";
import { HOMEWORK_SCOPES } from "@/constants/homework";
import { type Homework, type HomeworkScope } from "@/types/homework";
import { parsePageParam } from "@/lib/utils/pagination";
import type { HomeworkStatusSource, HomeworkDisplayStatus, DueDateInfo, RawSearchParams, HomeworkSearchParams, HomeworkSubmission, HomeworkSubmissionSummary } from "@/types/homework";
import { homeworkStatusDescriptions, homeworkScopeLabels, DAY_MS, HOUR_MS } from "@/constants/homework";

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

export function formatHomeworkScope(scope: string | null | undefined) {
  return scope && scope in homeworkScopeLabels
    ? homeworkScopeLabels[scope as HomeworkScope]
    : "تکلیف";
}

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

export function toSubmissionSummary(
  submission: HomeworkSubmission,
): HomeworkSubmissionSummary {
  const { id, status, score, is_late, submitted_at } = submission;
  return { id, status, score, is_late, submitted_at };
}

/**
 * Swagger now types `my_submission` as the full record; older responses sent
 * only the summary. This tells the two apart so a full one can be reused.
 */
export function isFullSubmission(
  submission: HomeworkSubmissionSummary | null | undefined,
): submission is HomeworkSubmission {
  const candidate = submission as Partial<HomeworkSubmission> | null | undefined;
  return (
    typeof candidate?.file_name === "string" &&
    typeof candidate.updated_at === "string" &&
    typeof candidate.max_score === "string"
  );
}
