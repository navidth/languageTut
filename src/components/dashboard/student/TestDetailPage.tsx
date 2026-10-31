"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getApiErrorMessage, normalizeApiError } from "@/lib/services/apiErrors";
import { formatRecommendedLevel } from "@/lib/presentation/exam";
import { studentExamResultPath } from "@/lib/utils/routes";
import { type ActiveSubmission, type PracticeTestAttempt } from "@/types/exam";
import { fetchCourseDetail, selectCourseDetail } from "@/store/coursesSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchPracticeTestDetail,
  invalidateExamSubmissions,
  startPracticeTest,
  submitPracticeTest,
} from "@/store/studentSlice";
import AsyncState from "@/components/ui/AsyncState";
import Countdown from "@/components/ui/Countdown";
import { useCountdown } from "@/hooks/useCountdown";
import PracticeTestMedia, { mediaAvailableBeforeStart } from "./PracticeTestMedia";
import TestQuestionCard from "./TestQuestionCard";
import type { TestLoadError } from "@/types/exam";
import { AUTO_SUBMIT_LEAD_MS, EXAM_EXPIRED_MESSAGE } from "@/constants/exam";
import { studentCoursePath } from "@/lib/utils/routes";
import { ROUTES } from "@/constants/routes";
import { readStoredAnswers, writeStoredAnswers } from "@/lib/utils/practiceTestAnswers";
import { attemptFromStart } from "@/lib/presentation/exam";

export default function TestDetailPage({
  id,
  courseId,
}: {
  id: number;
  /** Lets a paid test that answers 403 link to its course for purchase. */
  courseId?: number;
}) {
  const dispatch = useAppDispatch();
  const test = useAppSelector((state) => state.student.testDetails[id]?.data ?? null);
  const course = useAppSelector((state) =>
    courseId ? selectCourseDetail(state, courseId)?.data ?? null : null,
  );
  // Set once this visit's own read of the test has answered.
  const [visit, setVisit] = useState<{ id: number; error: TestLoadError | null } | null>(null);
  const latestIdRef = useRef(id);
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
  const loaded = visit?.id === id;
  const loadError = loaded ? visit.error : null;

  const beginAttempt = useCallback((running: ActiveSubmission | null) => {
    setAttempt(running);
    setAnswers(running ? readStoredAnswers(running.id) : {});
  }, []);

  useEffect(() => {
    latestIdRef.current = id;
    setAttempt(null);
    setAttemptEnded(false);
    setAnswers({});
    setStartError("");
    setSubmitError("");
    setSubmission(null);
    setTimedOut(false);
    autoSubmittedRef.current = null;

    // Only reads here: an attempt starts when the student asks for it, and a
    // running one comes back as `active_submission`, so the read is always
    // fresh. The id check, not a cleanup flag, drops a stale answer: under
    // Strict Mode the second read is skipped while the first one runs.
    void dispatch(fetchPracticeTestDetail({ id, force: true })).then((action) => {
      if (latestIdRef.current !== id) return;
      if (fetchPracticeTestDetail.fulfilled.match(action)) {
        beginAttempt(action.payload.active_submission ?? null);
        setVisit({ id, error: null });
        return;
      }
      if (action.meta.condition) return;
      const error = normalizeApiError(
        action.payload,
        "دریافت آزمون ناموفق بود یا به آن دسترسی ندارید.",
      );
      const forbidden = error.status === 403;
      setVisit({ id, error: { message: error.message, forbidden } });
      if (forbidden && courseId) void dispatch(fetchCourseDetail({ id: courseId }));
    });
  }, [beginAttempt, courseId, dispatch, id]);

  const startTest = useCallback(async () => {
    if (starting) return;
    setStarting(true);
    setStartError("");
    try {
      // Safe to repeat: a running attempt is returned instead of a new one.
      const { started, detail } = await dispatch(startPracticeTest(id)).unwrap();
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
  }, [beginAttempt, dispatch, id, starting]);

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
        const result = await dispatch(submitPracticeTest({
          id,
          data: {
            answers: questions.map((question) => ({
              question: question.id,
              answer_text: (answers[question.id] ?? "").trim(),
            })),
          },
        })).unwrap();
        writeStoredAnswers(attempt.id, null);
        if (result.grading_status === "expired") {
          setAttemptEnded(true);
          setSubmitError(EXAM_EXPIRED_MESSAGE);
        } else {
          setSubmission(result);
        }
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
        const detail = await dispatch(fetchPracticeTestDetail({ id, force: true }))
          .unwrap()
          .catch(() => null);
        if (detail?.active_submission) {
          setSubmitError(apiError.message);
          return;
        }
        const deadline = attempt.deadline ? Date.parse(attempt.deadline) : Number.NaN;
        writeStoredAnswers(attempt.id, null);
        setAttemptEnded(true);
        setSubmitError(
          timedOut || deadline <= Date.now()
            ? EXAM_EXPIRED_MESSAGE
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
              href={studentCoursePath(course.id)}
              className="brand-button mt-4 inline-block rounded-xl px-5 py-2.5 text-sm"
            >
              خرید دوره «{course.title}»
            </Link>
          )}
          {loadError.forbidden && !course && (
            <Link
              href={ROUTES.studentCourses}
              className="ghost-button mt-4 inline-block rounded-xl px-5 py-2.5 text-sm"
            >
              مشاهده دوره‌ها
            </Link>
          )}
        </div>
      </section>
    );
  }
  if (!loaded || !test)
    return <AsyncState message="در حال دریافت آزمون..." />;

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
