"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import {
  HiCalendar,
  HiChartBar,
  HiClock,
  HiOutlineDocumentText,
  HiRefresh,
} from "react-icons/hi";
import PageMessage from "@/components/ui/PageMessage";
import { Skeleton } from "@/components/ui/Skeleton";
import StatusBadge, { toneTextClasses } from "@/components/ui/StatusBadge";
import { formatPersianDate, formatPersianDateTime } from "@/lib/utils/date";
import { formatDecimal } from "@/lib/utils/format";
import { describeDueDate, describeHomeworkStatus, formatHomeworkScope, resolveHomeworkStatus } from "@/lib/presentation/homework";
import { homeworkStatusLabels, homeworkStatusTones } from "@/constants/homework";
import { ROUTES } from "@/constants/routes";
import { selectKnownCourseTitles } from "@/store/courseTitles";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchHomework, fetchHomeworkSubmission } from "@/store/homeworkSlice";
import type { StatusTone } from "@/types/ui";
import HomeworkAttachments from "./HomeworkAttachments";
import HomeworkSubmissionPanel from "./HomeworkSubmissionPanel";
import { homeworkErrorMessages } from "@/constants/homework";
import { studentCoursePath } from "@/lib/utils/routes";

const noticeClasses: Record<StatusTone, string> = {
  success: "feedback-success",
  warning: "feedback-warning",
  danger: "feedback-error",
  info: "border border-border bg-secondary-soft",
  neutral: "border border-border bg-muted text-muted-foreground",
};

export default function HomeworkDetailPage({ id }: { id: number }) {
  const dispatch = useAppDispatch();
  const validId = Number.isInteger(id) && id > 0;
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const entry = useAppSelector((state) =>
    validId ? state.homework.details[id] : undefined,
  );
  const courseTitles = useAppSelector(selectKnownCourseTitles);

  // A homework opened from the list is already cached, so this is a no-op then.
  useEffect(() => {
    if (validId) void dispatch(fetchHomework({ id }));
  }, [dispatch, id, userId, validId]);

  if (!validId) {
    return (
      <PageMessage
        text="شناسه تکلیف معتبر نیست."
        backHref={ROUTES.studentHomework}
        backLabel="بازگشت به تکالیف"
      />
    );
  }

  const homework = entry?.data ?? null;
  const reload = () => {
    void dispatch(fetchHomework({ id, force: true }));
    const submissionId = homework?.my_submission?.id;
    if (submissionId) {
      void dispatch(fetchHomeworkSubmission({ id: submissionId, force: true }));
    }
  };

  if (!homework) {
    if (entry?.status !== "failed") return <DetailSkeleton />;

    const knownMessage = entry.errorKind
      ? homeworkErrorMessages[entry.errorKind]
      : undefined;
    return (
      <PageMessage
        text={knownMessage ?? entry.error ?? "دریافت اطلاعات تکلیف ناموفق بود."}
        retry={knownMessage ? undefined : reload}
        backHref={ROUTES.studentHomework}
        backLabel="بازگشت به تکالیف"
      />
    );
  }

  const status = resolveHomeworkStatus(homework);
  const tone = homeworkStatusTones[status];
  const refreshing = entry?.status === "loading";
  const due = homework.my_submission || status === "not-started"
    ? null
    : describeDueDate(homework.due_at, entry?.lastFetched);
  // The homework names its course, so no enrollment request is needed here.
  const courseTitle =
    homework.course_title ||
    courseTitles[homework.course] ||
    `دوره ${homework.course.toLocaleString("fa-IR")}`;

  return (
    <article className="mx-auto max-w-4xl">
      <Link href={ROUTES.studentHomework} className="brand-link text-sm">
        → بازگشت به تکالیف
      </Link>

      <header className="page-hero my-5 rounded-3xl p-7">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={tone}>{homeworkStatusLabels[status]}</StatusBadge>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold">
            {formatHomeworkScope(homework.scope)}
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-black leading-tight" dir="auto">
          {homework.title}
        </h1>
        <p className="page-hero-muted mt-3 text-sm" dir="auto">
          <Link
            href={studentCoursePath(homework.course)}
            className="font-bold underline-offset-4 hover:underline"
          >
            {courseTitle}
          </Link>
          {homework.lesson_title && ` · ${homework.lesson_title}`}
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-3 sm:gap-4">
        <Fact
          icon={<HiCalendar />}
          label="مهلت تحویل"
          value={
            homework.due_at
              ? formatPersianDateTime(homework.due_at)
              : "بدون مهلت"
          }
          hint={due?.text}
          hintClassName={due ? toneTextClasses[due.tone] : undefined}
        />
        <Fact
          icon={<HiChartBar />}
          label="حداکثر نمره"
          value={formatDecimal(homework.max_score)}
        />
        <Fact
          icon={<HiClock />}
          label="ارسال با تأخیر"
          value={homework.allow_late_submissions ? "پذیرفته می‌شود" : "پذیرفته نمی‌شود"}
        />
        {homework.starts_at ? (
          <Fact
            icon={<HiOutlineDocumentText />}
            label="شروع ارسال"
            value={formatPersianDateTime(homework.starts_at)}
          />
        ) : (
          <Fact
            icon={<HiOutlineDocumentText />}
            label="تاریخ ایجاد"
            value={formatPersianDate(homework.created_at)}
          />
        )}
      </dl>

      <div
        className={`${noticeClasses[tone]} mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 text-sm`}
        role="status"
      >
        <span>{describeHomeworkStatus(homework)}</span>
        <button
          type="button"
          disabled={refreshing}
          aria-busy={refreshing}
          onClick={reload}
          className="ghost-button inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs"
        >
          <HiRefresh
            className={`size-4 ${refreshing ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          {refreshing ? "در حال به‌روزرسانی..." : "به‌روزرسانی"}
        </button>
      </div>

      {entry?.status === "failed" && (
        <p className="feedback-error mt-4 rounded-2xl p-4 text-sm" role="alert">
          {entry.error ?? "به‌روزرسانی اطلاعات تکلیف ناموفق بود."}
        </p>
      )}

      <section
        className="surface-card mt-6 rounded-3xl p-6"
        aria-labelledby="homework-instructions-title"
      >
        <h2 id="homework-instructions-title" className="text-xl font-black">
          شرح تکلیف
        </h2>
        <div
          className="mt-4 whitespace-pre-line leading-8 text-muted-foreground"
          dir="auto"
        >
          {homework.instructions || "برای این تکلیف توضیحی ثبت نشده است."}
        </div>
      </section>

      <HomeworkAttachments attachments={homework.attachments ?? []} />

      <HomeworkSubmissionPanel homework={homework} />
    </article>
  );
}

function Fact({
  icon,
  label,
  value,
  hint,
  hintClassName = "",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
  hintClassName?: string;
}) {
  return (
    // Two across on phones too, with the icon above the text there.
    <div className="surface-card flex flex-col items-start gap-2 rounded-2xl p-3 sm:flex-row sm:gap-3 sm:p-4">
      <span
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-lg text-brand-accent"
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="mt-1 text-sm font-bold">{value}</dd>
        {hint && (
          <dd className={`mt-1 text-xs font-bold ${hintClassName}`}>{hint}</dd>
        )}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl" role="status" aria-busy="true">
      <span className="sr-only">در حال دریافت اطلاعات تکلیف...</span>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="my-5 h-40 w-full rounded-3xl" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
      <Skeleton className="mt-6 h-48 w-full rounded-3xl" />
      <Skeleton className="mt-6 h-56 w-full rounded-3xl" />
    </div>
  );
}
