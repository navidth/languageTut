"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getApiErrorMessage, normalizeApiError } from "@/lib/apiErrors";
import type { Course } from "@/lib/courses";
import { formatRecommendedLevel } from "@/lib/examPresentation";
import { studentExamResultPath } from "@/lib/routes";
import {
  studentApi,
  type ActiveSubmission,
  type PracticeTest,
  type PracticeTestAttempt,
} from "@/lib/studentApi";
import { useAppDispatch } from "@/store/hooks";
import { invalidateExamSubmissions } from "@/store/studentSlice";
import Countdown, { useCountdown } from "@/components/ui/Countdown";
import PracticeTestMedia, { mediaAvailableBeforeStart } from "./PracticeTestMedia";
import TestQuestionCard from "./TestQuestionCard";

export { formatRemainingTime } from "@/lib/format";

/** The server rejects late submits, so answers are sent a little early. */
export const AUTO_SUBMIT_LEAD_MS = 5_000;

const EXPIRED_MESSAGE =
  "زمان این تلاش به پایان رسیده بود و پاسخ‌ها ثبت نشد.";

type LoadError = { message: string; forbidden: boolean };

function answersStorageKey(attemptId: number) {
  return `practice-test-answers:${attemptId}`;
}

// Answers survive a reload while the attempt is still running.
function readStoredAnswers(attemptId: number): Record<number, string> {
  try {
    const value = JSON.parse(
      window.localStorage.getItem(answersStorageKey(attemptId)) ?? "{}",
    ) as unknown;
    return value && typeof value === "object"
      ? (value as Record<number, string>)
      : {};
  } catch {
    return {};
  }
}

function writeStoredAnswers(attemptId: number, answers: Record<number, string> | null) {
  try {
    if (answers) {
      window.localStorage.setItem(answersStorageKey(attemptId), JSON.stringify(answers));
    } else {
      window.localStorage.removeItem(answersStorageKey(attemptId));
    }
  } catch {
    // Storage can be unavailable; answers then live in memory only.
  }
}

function attemptFromStart(
  result: PracticeTestAttempt,
): ActiveSubmission | null {
  const id = result.id ?? result.submission_id;
  if (id == null || !result.started_at) return null;
  return { id, started_at: result.started_at, deadline: result.deadline ?? null };
}

export default function TestDetailPage({
  id,
  courseId,
}: {
  id: number;
  /** Lets a paid test that answers 403 link to its course for purchase. */
  courseId?: number;
}) {
  const dispatch = useAppDispatch();
  const [test, setTest] = useState<PracticeTest | null>(null);
  const [loadError, setLoadError] = useState<LoadError | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [attempt, setAttempt] = useState<ActiveSubmission | null>(null);
  const [attemptEnded, setAttemptEnded] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submission, setSubmission] = useState<PracticeTestAttempt | null>(
    null,
  );
  const [timedOut, setTimedOut] = useState(false);
  const autoSubmittedRef = useRef<number | null>(null);

  const beginAttempt = useCallback((running: ActiveSubmission | null) => {
    setAttempt(running);
    setAnswers(running ? readStoredAnswers(running.id) : {});
  }, []);

  useEffect(() => {
    let active = true;
    setTest(null);
    setLoadError(null);
    setCourse(null);
    setAttempt(null);
    setAttemptEnded(false);
    setAnswers({});
    setStartError("");
    setSubmitError("");
    setSubmission(null);
    setTimedOut(false);
    autoSubmittedRef.current = null;

    // Only reads here: an attempt starts when the student asks for it, and a
    // running one comes back as `active_submission`.
    void studentApi
      .test(id)
      .then((result) => {
        if (!active) return;
        setTest(result);
        beginAttempt(result.active_submission ?? null);
      })
      .catch((error) => {
        if (!active) return;
        const apiError = normalizeApiError(
          error,
          "دریافت آزمون ناموفق بود یا به آن دسترسی ندارید.",
        );
        const forbidden = apiError.status === 403;
        setLoadError({ message: apiError.message, forbidden });
        if (forbidden && courseId) {
          void studentApi
            .course(courseId)
            .then((result) => {
              if (active) setCourse(result);
            })
            .catch(() => undefined);
        }
      });

    return () => {
      active = false;
    };
  }, [beginAttempt, courseId, id]);

  const startTest = useCallback(async () => {
    if (starting) return;
    setStarting(true);
    setStartError("");
    try {
      // Safe to repeat: a running attempt is returned instead of a new one.
      const started = await studentApi.startTest(id);
      const detail = await studentApi.test(id);
      setTest(detail);
      setAttemptEnded(false);
      setSubmitError("");
      setTimedOut(false);
      beginAttempt(detail.active_submission ?? attemptFromStart(started));
    } catch (error) {
      setStartError(
        getApiErrorMessage(error, "شروع آزمون ناموفق بود. دوباره تلاش کنید."),
      );
    } finally {
      setStarting(false);
    }
  }, [beginAttempt, id, starting]);

  const questions = useMemo(() => test?.questions ?? [], [test]);
  const answeredCount = useMemo(
    () => questions.filter((question) => answers[question.id]?.trim()).length,
    [answers, questions],
  );
  const allAnswered =
    questions.length > 0 && answeredCount === questions.length;
  const resultsByQuestion = useMemo(
    () =>
      new Map(
        (submission?.answers ?? []).map((answer) => [answer.question, answer]),
      ),
    [submission],
  );
  const running = Boolean(attempt) && !submission && !attemptEnded;

  const remainingMs = useCountdown(
    running && attempt?.deadline ? Date.parse(attempt.deadline) : null,
  );
  const remainingSeconds = remainingMs === null ? null : Math.ceil(remainingMs / 1000);
  // Answers go in a few seconds early, so the server still accepts them.
  const deadlineReached = remainingMs !== null && remainingMs <= AUTO_SUBMIT_LEAD_MS;

  useEffect(() => {
    if (deadlineReached) setTimedOut(true);
  }, [deadlineReached]);

  const updateAnswer = useCallback(
    (questionId: number, value: string) => {
      if (!attempt || !running || timedOut) return;
      setAnswers((current) => {
        const next = { ...current, [questionId]: value };
        writeStoredAnswers(attempt.id, next);
        return next;
      });
      setSubmitError("");
    },
    [attempt, running, timedOut],
  );

  const submitTest = useCallback(
    async (force = false) => {
      if (!test || !attempt || !running || (!force && !allAnswered) || submitting)
        return;

      setSubmitting(true);
      setSubmitError("");
      try {
        const result = await studentApi.submitTest(id, {
          answers: questions.map((question) => ({
            question: question.id,
            answer_text: (answers[question.id] ?? "").trim(),
          })),
        });
        writeStoredAnswers(attempt.id, null);
        if (result.grading_status === "expired") {
          setAttemptEnded(true);
          setSubmitError(EXPIRED_MESSAGE);
        } else {
          setSubmission(result);
        }
        // The cached exam history does not include this attempt yet.
        dispatch(invalidateExamSubmissions());
      } catch (error) {
        const apiError = normalizeApiError(
          error,
          "ثبت نهایی آزمون ناموفق بود. دوباره تلاش کنید.",
        );
        if (apiError.status !== 400) {
          setSubmitError(apiError.message);
          return;
        }
        // A 400 means a late submit or no running attempt; ask which.
        const detail = await studentApi.test(id).catch(() => null);
        if (detail) setTest(detail);
        if (detail?.active_submission) {
          setSubmitError(apiError.message);
          return;
        }
        const deadline = attempt.deadline ? Date.parse(attempt.deadline) : Number.NaN;
        writeStoredAnswers(attempt.id, null);
        setAttemptEnded(true);
        setSubmitError(
          timedOut || deadline <= Date.now()
            ? EXPIRED_MESSAGE
            : "این تلاش دیگر فعال نیست. برای ادامه، آزمون را دوباره شروع کنید.",
        );
        dispatch(invalidateExamSubmissions());
      } finally {
        setSubmitting(false);
      }
    },
    [
      allAnswered,
      answers,
      attempt,
      dispatch,
      id,
      questions,
      running,
      submitting,
      test,
      timedOut,
    ],
  );

  useEffect(() => {
    if (
      !timedOut ||
      !attempt ||
      !running ||
      submitting ||
      autoSubmittedRef.current === attempt.id
    )
      return;

    autoSubmittedRef.current = attempt.id;
    void submitTest(true);
  }, [attempt, running, submitTest, submitting, timedOut]);

  if (loadError) {
    const buyCourse = loadError.forbidden && course && !course.has_access;
    return (
      <section className="mx-auto max-w-4xl">
        <Link href="/student/tests" className="brand-link text-sm">
          → بازگشت به آزمون‌ها
        </Link>
        <div className="feedback-error mt-5 rounded-2xl p-6" role="alert">
          <p>{loadError.message}</p>
          {buyCourse && (
            <Link
              href={`/student/all-courses/${course.id}`}
              className="brand-button mt-4 inline-block rounded-xl px-5 py-2.5 text-sm"
            >
              خرید دوره «{course.title}»
            </Link>
          )}
          {loadError.forbidden && !course && (
            <Link
              href="/student/all-courses"
              className="ghost-button mt-4 inline-block rounded-xl px-5 py-2.5 text-sm"
            >
              مشاهده دوره‌ها
            </Link>
          )}
        </div>
      </section>
    );
  }
  if (!test)
    return <div className="p-10 text-center">در حال دریافت آزمون...</div>;

  const inputsDisabled = !running || starting || timedOut || submitting;
  const recommendedLevel = formatRecommendedLevel(
    submission?.recommended_level,
  );
  const canStart = !attempt && !submission;
  const canRestart = attemptEnded && !submission;

  return (
    <section className="mx-auto max-w-4xl">
      <Link href="/student/tests" className="brand-link text-sm">
        → بازگشت به آزمون‌ها
      </Link>

      <header className="page-hero my-5 rounded-3xl p-7">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <p className="page-hero-muted">سطح {test.level}</p>
            <h1 className="mt-2 text-3xl font-black">{test.title}</h1>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-center">
            <p>{test.questions_count} سؤال</p>
            {/* `dark`: the header is plum in both themes, so the urgent red
                must be the light one. */}
            <Countdown
              seconds={remainingSeconds}
              fallback={`${test.duration_minutes} دقیقه`}
              className="dark mt-1 text-sm font-bold text-brand-accent"
            />
          </div>
        </div>
        <p className="page-hero-muted bidi-text mt-4">{test.description}</p>
      </header>

      {(canStart || canRestart) && (
        <div className="surface-card mb-5 rounded-2xl p-5">
          <p className="font-bold">
            {canRestart ? "این تلاش به پایان رسید." : "آماده شروع هستید؟"}
          </p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            سؤال‌ها پس از شروع نمایش داده می‌شوند و زمان آزمون از همان لحظه
            شمرده می‌شود. با پایان زمان، پاسخ‌ها خودکار ثبت می‌شوند.
            {test.max_attempts != null &&
              ` این آزمون حداکثر ${test.max_attempts.toLocaleString("fa-IR")} بار قابل شرکت است.`}
          </p>
          <button
            type="button"
            disabled={starting}
            onClick={() => void startTest()}
            className="brand-button mt-4 min-h-12 rounded-xl px-6 py-3 text-sm"
          >
            {starting
              ? "در حال شروع آزمون..."
              : canRestart
                ? "شروع دوباره آزمون"
                : "شروع آزمون"}
          </button>
        </div>
      )}
      {startError && (
        <div className="feedback-error mb-5 rounded-2xl p-4" role="alert">
          {startError}
        </div>
      )}
      {timedOut && running && (
        <div
          className="feedback-warning mb-5 rounded-2xl p-4 text-sm"
          role="status"
        >
          زمان آزمون پایان یافت؛ پاسخ‌های فعلی در حال ثبت هستند.
        </div>
      )}

      {running ? (
        <PracticeTestMedia media={test.media} />
      ) : (
        canStart && (
          <PracticeTestMedia
            media={mediaAvailableBeforeStart(test.media)}
            description="این فایل‌ها پیش از شروع آزمون قابل پخش هستند."
          />
        )
      )}

      {(running || submission) && (
        <>
          <div className="space-y-4">
            {questions.map((question, index) => (
              <TestQuestionCard
                key={question.id}
                question={question}
                index={index}
                answer={answers[question.id] ?? ""}
                disabled={inputsDisabled}
                result={resultsByQuestion.get(question.id)}
                onAnswerChange={updateAnswer}
              />
            ))}
          </div>
          {!questions.length && (
            <div className="surface-card rounded-2xl p-10 text-center text-muted-foreground">
              سؤالی برای این آزمون ثبت نشده است.
            </div>
          )}
        </>
      )}

      {questions.length > 0 && (running || submission) && (
        // On phones it rides above the fixed bottom menu instead of under it.
        <div className="surface-card sticky bottom-24 mt-5 rounded-2xl p-4 shadow-[var(--shadow-brand-md)] sm:bottom-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div>
            <p className="font-bold">
              {answeredCount.toLocaleString("fa-IR")} از{" "}
              {questions.length.toLocaleString("fa-IR")} سؤال پاسخ داده شده
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              پس از پاسخ‌دادن به همه سؤال‌ها، آزمون را ثبت نهایی کنید.
            </p>
          </div>
          <button
            type="button"
            disabled={
              submitting || !running || (!timedOut && !allAnswered)
            }
            onClick={() => void submitTest(timedOut)}
            className="brand-button mt-4 min-h-12 w-full rounded-xl px-6 py-3 text-sm sm:mt-0 sm:w-auto"
          >
            {submitting
              ? "در حال ثبت آزمون..."
              : submission
                ? "آزمون ثبت شد"
                : timedOut && submitError
                  ? "تلاش مجدد برای ثبت"
                  : "ثبت نهایی آزمون"}
          </button>
        </div>
      )}

      {submitError && (
        <div
          className="feedback-error mt-4 rounded-xl p-4 text-sm"
          role="alert"
        >
          {submitError}
        </div>
      )}
      {submission && (
        <div className="feedback-success mt-4 rounded-xl p-4" role="status">
          <p className="font-bold">آزمون با موفقیت ثبت شد.</p>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {submission.total_score != null && submission.max_score != null && (
              <p>
                امتیاز شما: {submission.total_score} از {submission.max_score}
              </p>
            )}
            {submission.percentage != null && (
              <p>درصد: {submission.percentage}٪</p>
            )}
            {recommendedLevel && <p>سطح پیشنهادی: {recommendedLevel}</p>}
          </div>
          {submission.grading_status === "pending" && (
            <p className="mt-2 text-sm">
              برخی پاسخ‌ها در انتظار تصحیح مدرس هستند.
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={studentExamResultPath(id)}
              className="brand-button rounded-xl px-5 py-2.5 text-sm"
            >
              مشاهده نتیجه کامل
            </Link>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="ghost-button rounded-xl px-5 py-2.5 text-sm font-bold"
            >
              بازگشت
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
