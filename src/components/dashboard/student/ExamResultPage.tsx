"use client";

import { memo, useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { HiRefresh } from "react-icons/hi";
import LoginPrompt from "@/components/auth/LoginPrompt";
import {
  hasActiveSession,
  useSessionState,
} from "@/components/auth/useSessionState";
import PageMessage from "@/components/ui/PageMessage";
import ProgressRing from "@/components/ui/ProgressRing";
import { Skeleton } from "@/components/ui/Skeleton";
import StatusBadge, { toneTextClasses } from "@/components/ui/StatusBadge";
import { formatPersianDateTime } from "@/lib/date";
import {
  answerOutcomeLabels,
  answerOutcomeTones,
  collectTestQuestions,
  completedSubmissionsForTest,
  formatAttemptDuration,
  formatExamType,
  formatQuestionType,
  formatRecommendedLevel,
  resolveAnswerOutcome,
  summarizeExamResult,
} from "@/lib/examPresentation";
import { formatDecimal } from "@/lib/format";
import { ROUTES, studentTestPath } from "@/lib/routes";
import { formatSkillName } from "@/lib/skillPresentation";
import type { Question, StudentAnswer } from "@/lib/studentApi";
import { selectKnownCourseTitles } from "@/store/courseTitles";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchExamSubmissions,
  fetchPracticeTestDetail,
  fetchStudentOverview,
} from "@/store/studentSlice";
import type { StatusTone } from "@/types";

const BACK_LABEL = "بازگشت به آزمون‌ها";

export default function ExamResultPage({ id }: { id: number }) {
  const dispatch = useAppDispatch();
  const session = useSessionState();
  const validId = Number.isInteger(id) && id > 0;
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const submissions = useAppSelector((state) => state.student.examSubmissions);
  const testEntry = useAppSelector((state) =>
    validId ? state.student.testDetails[id] : undefined,
  );
  const courseTitles = useAppSelector(selectKnownCourseTitles);
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(
    null,
  );
  const attemptSelectId = useId();

  const canLoad = validId && hasActiveSession(session);

  // Every request here is cached in the store, so revisiting the page, or
  // opening it from the exam list or the dashboard, does not repeat them.
  useEffect(() => {
    if (!canLoad) return;
    void dispatch(fetchExamSubmissions());
    void dispatch(fetchPracticeTestDetail({ id }));
    // The dashboard overview names the course this exam belongs to.
    void dispatch(fetchStudentOverview());
  }, [canLoad, dispatch, id, userId]);

  const attempts = useMemo(
    () => completedSubmissionsForTest(submissions.items, id),
    [id, submissions.items],
  );
  const hasUnfinishedAttempt = useMemo(
    () =>
      submissions.items.some(
        (item) =>
          item.practice_test === id &&
          item.submitted_at === null &&
          item.grading_status !== "expired",
      ),
    [id, submissions.items],
  );
  const submission =
    attempts.find((attempt) => attempt.id === selectedAttemptId) ??
    attempts[0] ??
    null;
  const test = testEntry?.data ?? null;
  const questions = useMemo(() => collectTestQuestions(test), [test]);
  const summary = useMemo(
    () => (submission ? summarizeExamResult(submission, questions) : null),
    [questions, submission],
  );
  const rows = useMemo(() => {
    if (!submission) return [];
    if (questions.length === 0) {
      // The question texts are unavailable; fall back to the recorded answers.
      return submission.answers.map((answer) => ({
        key: answer.question,
        question: undefined,
        answer,
      }));
    }
    const answersByQuestion = new Map(
      submission.answers.map((answer) => [answer.question, answer]),
    );
    return questions.map((question) => ({
      key: question.id,
      question,
      answer: answersByQuestion.get(question.id),
    }));
  }, [questions, submission]);

  if (!validId) {
    return (
      <PageMessage
        text="شناسه آزمون معتبر نیست."
        backHref={ROUTES.studentTests}
        backLabel={BACK_LABEL}
      />
    );
  }

  if (session === "anonymous") {
    return (
      <div className="mx-auto max-w-3xl">
        <LoginPrompt message="برای مشاهده نتیجه آزمون، وارد حساب کاربری خود شوید." />
      </div>
    );
  }

  function reload() {
    void dispatch(fetchExamSubmissions({ force: true }));
    void dispatch(fetchPracticeTestDetail({ id, force: true }));
  }

  // `lastFetched` is cleared when a new attempt is submitted, so stale results
  // are never shown while the fresh list is on its way.
  if (submissions.lastFetched === null) {
    if (submissions.status !== "failed") return <ResultSkeleton />;

    const forbidden = submissions.errorKind === "authorization";
    return (
      <PageMessage
        text={
          forbidden
            ? "شما اجازه مشاهده نتیجه این آزمون را ندارید."
            : (submissions.error ?? "دریافت نتیجه آزمون ناموفق بود.")
        }
        retry={forbidden ? undefined : reload}
        backHref={ROUTES.studentTests}
        backLabel={BACK_LABEL}
      />
    );
  }

  const testFailed = testEntry?.status === "failed";
  const testPending = !test && !testFailed;

  if (!submission || !summary) {
    if (testPending) return <ResultSkeleton />;

    if (testFailed && testEntry.errorKind === "not-found") {
      return (
        <PageMessage
          text="آزمون موردنظر پیدا نشد یا دیگر در دسترس نیست."
          backHref={ROUTES.studentTests}
          backLabel={BACK_LABEL}
        />
      );
    }
    if (testFailed && testEntry.errorKind === "authorization") {
      return (
        <PageMessage
          text="شما به این آزمون دسترسی ندارید."
          backHref={ROUTES.studentTests}
          backLabel={BACK_LABEL}
        />
      );
    }

    return (
      <PageMessage
        title={test?.title}
        text={
          hasUnfinishedAttempt
            ? "این آزمون هنوز تکمیل نشده است. پس از ثبت نهایی، نتیجه در همین صفحه نمایش داده می‌شود."
            : "شما هنوز در این آزمون شرکت نکرده‌اید و نتیجه‌ای برای نمایش وجود ندارد."
        }
        backHref={ROUTES.studentTests}
        backLabel={BACK_LABEL}
      >
        <Link
          href={studentTestPath(id)}
          className="brand-button rounded-xl px-5 py-2"
        >
          {hasUnfinishedAttempt ? "ادامه آزمون" : "شروع آزمون"}
        </Link>
      </PageMessage>
    );
  }

  const refreshing = submissions.status === "loading";
  const recommendedLevel = formatRecommendedLevel(submission.recommended_level);
  const duration = formatAttemptDuration(
    submission.started_at,
    submission.submitted_at,
  );
  const courseTitle = test ? courseTitles[test.course] : undefined;
  const context = [
    test?.level ? `سطح ${test.level}` : undefined,
    test?.skill_detail ? formatSkillName(test.skill_detail.name) : undefined,
  ].filter(Boolean);

  return (
    <article className="mx-auto max-w-4xl">
      <Link href={ROUTES.studentTests} className="brand-link text-sm">
        → {BACK_LABEL}
      </Link>

      <header className="page-hero my-5 rounded-3xl p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-accent px-3 py-1 text-xs font-black text-brand-primary">
            {formatExamType(submission.exam_type)}
          </span>
          <StatusBadge tone={summary.isFullyGraded ? "success" : "warning"}>
            {summary.isFullyGraded ? "نتیجه نهایی" : "در انتظار تصحیح مدرس"}
          </StatusBadge>
        </div>
        <p className="page-hero-muted mt-4 text-sm">نتیجه آزمون</p>
        <h1 className="mt-1 text-3xl font-black leading-tight" dir="auto">
          {submission.practice_test_title || test?.title || "آزمون"}
        </h1>
        {(courseTitle || context.length > 0) && (
          <p className="page-hero-muted mt-3 text-sm" dir="auto">
            {test && courseTitle && (
              <Link
                href={`/student/all-courses/${test.course}`}
                className="font-bold underline-offset-4 hover:underline"
              >
                {courseTitle}
              </Link>
            )}
            {courseTitle && context.length > 0 && " · "}
            {context.join(" · ")}
          </p>
        )}
      </header>

      {attempts.length > 1 && (
        <div className="mb-5">
          <label
            htmlFor={attemptSelectId}
            className="mb-2 block text-sm font-bold"
          >
            نمایش نتیجه
          </label>
          <select
            id={attemptSelectId}
            value={submission.id}
            onChange={(event) =>
              setSelectedAttemptId(Number(event.target.value))
            }
            className="block w-full rounded-xl border border-input bg-card p-3 text-sm sm:w-auto"
          >
            {attempts.map((attempt, index) => (
              <option key={attempt.id} value={attempt.id}>
                {`تلاش ${(attempts.length - index).toLocaleString("fa-IR")} · ${formatPersianDateTime(attempt.submitted_at)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      <section className="surface-card rounded-3xl p-6" aria-label="خلاصه نتیجه">
        <div className="grid items-center gap-6 md:grid-cols-[auto_1fr]">
          <ScoreRing percentage={summary.percentage} />
          <div>
            <p className="text-sm text-muted-foreground">امتیاز شما</p>
            <p className="mt-1 text-3xl font-black">
              {formatDecimal(submission.total_score)}
              <span className="ms-2 text-base font-bold text-muted-foreground">
                از {formatDecimal(submission.max_score)}
              </span>
            </p>
            <dl className="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <Detail label="وضعیت آزمون" value="تکمیل‌شده" />
              <Detail
                label="زمان ثبت نهایی"
                value={formatPersianDateTime(submission.submitted_at)}
              />
              <Detail
                label="زمان شروع"
                value={formatPersianDateTime(submission.started_at)}
              />
              {duration && <Detail label="مدت پاسخ‌گویی" value={duration} />}
              {recommendedLevel && (
                <Detail label="سطح پیشنهادی" value={recommendedLevel} />
              )}
            </dl>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-5 sm:grid-cols-4">
          <Count label="پاسخ‌های صحیح" value={summary.correct} tone="success" />
          <Count label="پاسخ‌های اشتباه" value={summary.incorrect} tone="danger" />
          <Count label="بدون پاسخ" value={summary.unanswered} tone="neutral" />
          <Count label="در انتظار تصحیح" value={summary.pending} tone="warning" />
        </dl>
      </section>

      {!summary.isFullyGraded && (
        <div
          className="feedback-warning mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 text-sm"
          role="status"
        >
          <span>
            {summary.pending.toLocaleString("fa-IR")} پاسخ در انتظار تصحیح مدرس
            است؛ نمره نهایی ممکن است تغییر کند.
          </span>
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
            {refreshing ? "در حال به‌روزرسانی..." : "به‌روزرسانی نتیجه"}
          </button>
        </div>
      )}

      {submissions.status === "failed" && (
        <p className="feedback-error mt-5 rounded-2xl p-4 text-sm" role="alert">
          {submissions.error ?? "به‌روزرسانی نتیجه ناموفق بود."}
        </p>
      )}

      <section className="mt-8" aria-labelledby="exam-result-questions-title">
        <h2 id="exam-result-questions-title" className="text-xl font-black">
          نتیجه سؤال به سؤال
        </h2>

        {testFailed && (
          <p className="feedback-warning mt-4 rounded-2xl p-4 text-sm" role="status">
            متن سؤال‌های این آزمون در دسترس نیست؛ فقط پاسخ‌های ثبت‌شده شما نمایش
            داده می‌شود.
          </p>
        )}

        {testPending ? (
          <div className="mt-4 space-y-4" role="status" aria-busy="true">
            <span className="sr-only">در حال دریافت سؤال‌های آزمون...</span>
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            پاسخی برای این آزمون ثبت نشده است.
          </p>
        ) : (
          <ol className="mt-4 space-y-4">
            {rows.map((row, index) => (
              <QuestionResultCard
                key={row.key}
                index={index}
                question={row.question}
                answer={row.answer}
              />
            ))}
          </ol>
        )}
      </section>

      <Link
        href={ROUTES.studentTests}
        className="brand-button mt-8 inline-block rounded-xl px-6 py-3 text-sm"
      >
        {BACK_LABEL}
      </Link>
    </article>
  );
}

const trueFalseLabels: Record<string, string> = {
  true: "صحیح",
  false: "غلط",
};

function formatAnswerText(text: string, questionType: string | undefined) {
  return questionType === "true_false"
    ? (trueFalseLabels[text.toLowerCase()] ?? text)
    : text;
}

const outcomeBorders: Partial<Record<StatusTone, string>> = {
  success: "var(--success)",
  danger: "var(--destructive)",
};

type QuestionResultCardProps = {
  index: number;
  question?: Question;
  answer?: StudentAnswer;
};

const QuestionResultCard = memo(function QuestionResultCard({
  index,
  question,
  answer,
}: QuestionResultCardProps) {
  const outcome = resolveAnswerOutcome(answer);
  const tone = answerOutcomeTones[outcome];
  const answerText = answer?.answer_text.trim() ?? "";
  // Present only when the API chooses to expose them to the student.
  const correctAnswer = question?.correct_answer?.trim();
  const explanation = question?.explanation?.trim();
  const feedback = answer?.feedback?.trim();
  const score = outcome === "pending" ? "—" : formatDecimal(answer?.score, "۰");

  return (
    <li
      className="surface-card rounded-2xl p-5"
      style={{ borderColor: outcomeBorders[tone] }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-bold text-muted-foreground">
          سؤال {(index + 1).toLocaleString("fa-IR")}
        </span>
        <StatusBadge tone={tone}>{answerOutcomeLabels[outcome]}</StatusBadge>
      </div>

      {question && (
        <p className="mt-3 font-bold leading-8" dir="auto">
          {question.question_text}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-accent-soft px-3 py-1.5 font-bold text-brand-primary">
          نمره: {score}
          {question?.points && ` از ${formatDecimal(question.points)}`}
        </span>
        {question && (
          <span className="rounded-full bg-secondary-soft px-3 py-1.5 font-bold text-brand-secondary dark:text-white">
            مدل: {formatQuestionType(question.question_type)}
          </span>
        )}
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">پاسخ شما</dt>
          <dd className="mt-1 whitespace-pre-line leading-7" dir="auto">
            {answerText
              ? formatAnswerText(answerText, question?.question_type)
              : "پاسخی ثبت نشده است."}
          </dd>
        </div>
        {correctAnswer && (
          <div>
            <dt className="text-xs text-muted-foreground">پاسخ درست</dt>
            <dd className="mt-1 whitespace-pre-line leading-7" dir="auto">
              {formatAnswerText(correctAnswer, question?.question_type)}
            </dd>
          </div>
        )}
        {explanation && (
          <div>
            <dt className="text-xs text-muted-foreground">توضیح</dt>
            <dd className="mt-1 whitespace-pre-line leading-7" dir="auto">
              {explanation}
            </dd>
          </div>
        )}
        {feedback && (
          <div className="rounded-xl bg-secondary-soft p-3">
            <dt className="text-xs font-bold">بازخورد مدرس</dt>
            <dd className="mt-1 whitespace-pre-line leading-7" dir="auto">
              {feedback}
            </dd>
          </div>
        )}
      </dl>
    </li>
  );
});

function ScoreRing({ percentage }: { percentage: number | null }) {
  const label = percentage === null ? "—" : `${formatDecimal(percentage)}٪`;

  return (
    <ProgressRing
      value={percentage}
      label={percentage === null ? "درصد نامشخص" : `درصد: ${label}`}
      caption="درصد"
      className="mx-auto size-36"
    >
      {label}
    </ProgressRing>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-bold">{value}</dd>
    </div>
  );
}

function Count({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: StatusTone;
}) {
  return (
    <div className="rounded-2xl bg-secondary-soft p-4 text-center">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={`mt-2 text-2xl font-black ${toneTextClasses[tone]}`}>
        {value.toLocaleString("fa-IR")}
      </dd>
    </div>
  );
}

function ResultSkeleton() {
  return (
    <div className="mx-auto max-w-4xl" role="status" aria-busy="true">
      <span className="sr-only">در حال دریافت نتیجه آزمون...</span>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="my-5 h-40 w-full rounded-3xl" />
      <Skeleton className="h-64 w-full rounded-3xl" />
      <Skeleton className="mt-8 h-6 w-40" />
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="mt-4 h-32 w-full rounded-2xl" />
      ))}
    </div>
  );
}
