import { memo } from "react";
import Link from "next/link";
import StatusBadge, { toneTextClasses } from "@/components/ui/StatusBadge";
import { formatPersianDate, formatPersianDateTime } from "@/lib/utils/date";
import { formatDecimal } from "@/lib/utils/format";
import type { Homework } from "@/types/homework";
import { describeDueDate, formatHomeworkScope, resolveHomeworkStatus } from "@/lib/presentation/homework";
import { homeworkStatusLabels, homeworkStatusTones } from "@/constants/homework";
import { studentHomeworkDetailPath } from "@/lib/utils/routes";
import { homeworkActionLabels } from "@/constants/homework";

type HomeworkCardProps = {
  homework: Homework;
  /** When the list was fetched; the deadline distance is measured from it. */
  referenceTime: number | null;
  courseTitle?: string;
};

function HomeworkCard({ homework, referenceTime, courseTitle }: HomeworkCardProps) {
  const status = resolveHomeworkStatus(homework);
  const submission = homework.my_submission;
  const graded = submission?.status === "graded";
  const notStarted = status === "not-started";
  // Once an answer is in, or before submissions open, the countdown does not matter.
  const due = submission || notStarted
    ? null
    : describeDueDate(homework.due_at, referenceTime);
  const context = [homework.course_title || courseTitle, homework.lesson_title]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="surface-card flex h-full flex-col rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatusBadge tone={homeworkStatusTones[status]}>
          {homeworkStatusLabels[status]}
        </StatusBadge>
        <span className="text-xs text-muted-foreground">
          {formatHomeworkScope(homework.scope)}
        </span>
      </div>

      <h2 className="mt-4 text-lg font-bold leading-8" dir="auto">
        {homework.title}
      </h2>
      {context && (
        <p className="mt-1 truncate text-xs text-muted-foreground" dir="auto">
          {context}
        </p>
      )}
      <p
        className="mt-3 line-clamp-3 grow text-sm leading-7 text-muted-foreground"
        dir="auto"
      >
        {homework.instructions || "برای این تکلیف توضیحی ثبت نشده است."}
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">مهلت تحویل</dt>
          <dd className="mt-1 font-bold">
            {homework.due_at ? formatPersianDate(homework.due_at) : "بدون مهلت"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">
            {graded ? "نمره شما" : "حداکثر نمره"}
          </dt>
          <dd className={`mt-1 font-bold ${graded ? "text-success" : ""}`}>
            {graded
              ? `${formatDecimal(submission.score)} از ${formatDecimal(homework.max_score)}`
              : formatDecimal(homework.max_score)}
          </dd>
        </div>
      </dl>

      {due && (
        <p className={`mt-3 text-xs font-bold ${toneTextClasses[due.tone]}`}>
          {due.text}
        </p>
      )}
      {notStarted && homework.starts_at && (
        <p className="mt-3 text-xs font-bold text-muted-foreground">
          شروع ارسال: {formatPersianDateTime(homework.starts_at)}
        </p>
      )}
      {submission && (
        <p className="mt-3 text-xs text-muted-foreground">
          ارسال‌شده در {formatPersianDate(submission.submitted_at)}
        </p>
      )}

      <Link
        href={studentHomeworkDetailPath(homework.id)}
        className="brand-button mt-5 rounded-xl px-4 py-2.5 text-center text-sm"
      >
        {homeworkActionLabels[status]}
      </Link>
    </article>
  );
}

export default memo(HomeworkCard);
