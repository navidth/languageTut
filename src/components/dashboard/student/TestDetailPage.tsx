"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getApiErrorMessage } from "@/lib/apiErrors";
import {
  studentApi,
  type PracticeTest,
  type PracticeTestAttempt,
} from "@/lib/studentApi";
import PracticeTestMedia from "./PracticeTestMedia";

type StartRequest = {
  id: number;
  promise: Promise<PracticeTestAttempt>;
};

const questionTypeLabels: Record<string, string> = {
  multiple_choice: "چندگزینه‌ای",
  true_false: "درست / نادرست",
  short_answer: "پاسخ کوتاه",
  essay: "تشریحی",
  speaking_prompt: "پاسخ گفتاری",
};

function questionScore(points: string | undefined) {
  if (!points) return "—";
  const numericPoints = Number(points);
  return Number.isFinite(numericPoints)
    ? numericPoints.toLocaleString("fa-IR", { maximumFractionDigits: 2 })
    : points;
}

export function formatRemainingTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  const formatPart = (value: number) => value.toLocaleString("fa-IR", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  return `${formatPart(minutes)}:${formatPart(seconds)}`;
}

export default function TestDetailPage({ id }: { id: number }) {
  const [test, setTest] = useState<PracticeTest | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loadingError, setLoadingError] = useState("");
  const [startError, setStartError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [starting, setStarting] = useState(true);
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState<PracticeTestAttempt | null>(null);
  const [startAttempt, setStartAttempt] = useState<PracticeTestAttempt | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const startRequestRef = useRef<StartRequest | null>(null);
  const timeoutSubmissionRef = useRef<number | null>(null);

  const startTest = useCallback(async (force = false) => {
    setStarting(true);
    setStartError("");

    if (force || startRequestRef.current?.id !== id) {
      startRequestRef.current = {
        id,
        promise: studentApi.startTest(id),
      };
    }

    const request = startRequestRef.current;
    try {
      const attempt = await request.promise;
      setStartAttempt(attempt);
      setStarted(true);
    } catch (error) {
      if (startRequestRef.current === request) {
        startRequestRef.current = null;
      }
      setStarted(false);
      setStartError(getApiErrorMessage(error, "شروع آزمون ناموفق بود. دوباره تلاش کنید."));
    } finally {
      setStarting(false);
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    setTest(null);
    setAnswers({});
    setLoadingError("");
    setSubmission(null);
    setStartAttempt(null);
    setRemainingSeconds(null);
    setTimedOut(false);
    timeoutSubmissionRef.current = null;
    setSubmitError("");

    void studentApi.test(id)
      .then((result) => {
        if (active) setTest(result);
      })
      .catch((error) => {
        if (active) {
          setLoadingError(getApiErrorMessage(
            error,
            "دریافت آزمون ناموفق بود یا به آن دسترسی ندارید.",
          ));
        }
      });

    void startTest();
    return () => {
      active = false;
    };
  }, [id, startTest]);

  const questions = useMemo(() => test?.questions ?? [], [test]);
  const answeredCount = useMemo(
    () => questions.filter((question) => answers[question.id]?.trim()).length,
    [answers, questions],
  );
  const allAnswered = questions.length > 0 && answeredCount === questions.length;
  const resultsByQuestion = useMemo(
    () => new Map(
      (submission?.answers ?? []).map((answer) => [answer.question, answer]),
    ),
    [submission],
  );

  useEffect(() => {
    if (!started || !test || submission) return;

    const serverStartedAt = startAttempt?.started_at
      ? Date.parse(startAttempt.started_at)
      : Number.NaN;
    const startedAt = Number.isFinite(serverStartedAt)
      ? serverStartedAt
      : Date.now();
    const deadline = startedAt + Math.max(0, test.duration_minutes) * 60_000;

    const updateTimer = () => {
      const nextSeconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemainingSeconds(nextSeconds);
      if (nextSeconds === 0) setTimedOut(true);
    };

    updateTimer();
    const timer = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(timer);
  }, [startAttempt?.started_at, started, submission, test]);

  function updateAnswer(questionId: number, value: string) {
    if (!started || timedOut || submission) return;
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setSubmitError("");
  }

  const submitTest = useCallback(async (force = false) => {
    if (
      !test ||
      !started ||
      (!force && !allAnswered) ||
      submitting ||
      submission
    ) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const result = await studentApi.submitTest(id, {
        answers: questions.map((question) => ({
          question: question.id,
          answer_text: (answers[question.id] ?? "").trim(),
        })),
      });
      setSubmission(result);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "ثبت نهایی آزمون ناموفق بود. دوباره تلاش کنید."));
    } finally {
      setSubmitting(false);
    }
  }, [allAnswered, answers, id, questions, started, submission, submitting, test]);

  useEffect(() => {
    if (
      !timedOut ||
      !test ||
      !started ||
      submission ||
      submitting ||
      timeoutSubmissionRef.current === id
    ) return;

    timeoutSubmissionRef.current = id;
    void submitTest(true);
  }, [id, started, submission, submitTest, submitting, test, timedOut]);

  if (loadingError) {
    return <div className="feedback-error rounded-2xl p-6" role="alert">{loadingError}</div>;
  }
  if (!test) return <div className="p-10 text-center">در حال دریافت آزمون...</div>;

  const inputsDisabled = !started || starting || timedOut || submitting || Boolean(submission);

  return (
    <section className="mx-auto max-w-4xl">
      <Link href="/student/tests" className="brand-link text-sm">→ بازگشت به آزمون‌ها</Link>

      <header className="page-hero my-5 rounded-3xl p-7">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <p className="page-hero-muted">سطح {test.level}</p>
            <h1 className="mt-2 text-3xl font-black">{test.title}</h1>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-center">
            <p>{test.questions_count} سؤال</p>
            <p className="mt-1 text-sm font-bold text-brand-accent" role="timer" aria-label="زمان باقی‌مانده">
              {remainingSeconds == null
                ? `${test.duration_minutes} دقیقه`
                : formatRemainingTime(remainingSeconds)}
            </p>
          </div>
        </div>
        <p className="page-hero-muted mt-4">{test.description}</p>
      </header>

      {starting && (
        <div className="feedback-warning mb-5 rounded-2xl p-4 text-sm" role="status">
          در حال شروع آزمون...
        </div>
      )}
      {startError && (
        <div className="feedback-error mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4" role="alert">
          <span>{startError}</span>
          <button
            type="button"
            onClick={() => void startTest(true)}
            className="ghost-button rounded-xl px-4 py-2 text-sm"
          >
            تلاش دوباره
          </button>
        </div>
      )}
      {timedOut && !submission && (
        <div className="feedback-warning mb-5 rounded-2xl p-4 text-sm" role="status">
          زمان آزمون پایان یافت؛ پاسخ‌های فعلی در حال ثبت هستند.
        </div>
      )}

      <PracticeTestMedia media={test.media} />

      <div className="space-y-4">
        {questions.map((question, index) => {
          const options = Array.isArray(question.options) ? question.options : [];
          const choiceOptions = question.question_type === "true_false"
            ? [
                { label: "صحیح", value: "true" },
                { label: "غلط", value: "false" },
              ]
            : options.map((option) => ({
                label: String(option),
                value: String(option),
              }));
          const model = questionTypeLabels[question.question_type] ?? "سایر";
          const result = resultsByQuestion.get(question.id);
          const resultBorder = result?.is_correct === true
            ? "var(--success)"
            : result?.is_correct === false
              ? "var(--destructive)"
              : undefined;

          return (
            <article
              key={question.id}
              data-testid={`question-${question.id}`}
              dir="ltr"
              style={{ borderColor: resultBorder }}
              className="surface-card rounded-2xl p-6 text-left"
            >
              <h2 className="font-bold leading-8">
                <span className="mr-2 text-brand-accent">
                  {(index + 1).toLocaleString("fa-IR")}.
                </span>
                {question.question_text}
              </h2>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span dir="rtl" className="rounded-full bg-accent-soft px-3 py-1.5 font-bold text-brand-primary">
                  نمره: {questionScore(question.points)}
                </span>
                <span dir="rtl" className="rounded-full bg-secondary-soft px-3 py-1.5 font-bold text-brand-secondary dark:text-white">
                  مدل: {model}
                </span>
                {result && (
                  <span
                    dir="rtl"
                    className={`rounded-full px-3 py-1.5 font-bold ${
                      result.is_correct === true
                        ? "bg-success-soft text-success"
                        : result.is_correct === false
                          ? "bg-destructive-soft text-destructive"
                          : "bg-accent-soft text-warning"
                    }`}
                  >
                    {result.is_correct === true
                      ? "پاسخ صحیح"
                      : result.is_correct === false
                        ? "پاسخ اشتباه"
                        : "در انتظار بررسی"}
                    {` · نمره دریافتی: ${result.score}`}
                  </span>
                )}
              </div>

              {choiceOptions.length ? (
                <div className={question.question_type === "true_false"
                  ? "mt-4 grid grid-cols-2 gap-3"
                  : "mt-4 space-y-2"}
                >
                  {choiceOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${
                        answers[question.id] === option.value
                          ? "border-brand-accent bg-accent-soft text-brand-primary"
                          : "border-border hover:border-brand-accent"
                      } ${question.question_type === "true_false" ? "justify-center" : ""} ${
                        inputsDisabled ? "cursor-not-allowed opacity-60" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${question.id}`}
                        value={option.value}
                        checked={answers[question.id] === option.value}
                        disabled={inputsDisabled}
                        onChange={() => updateAnswer(question.id, option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              ) : question.question_type === "short_answer" ? (
                <input
                  type="text"
                  value={answers[question.id] || ""}
                  disabled={inputsDisabled}
                  onChange={(event) => updateAnswer(question.id, event.target.value)}
                  className="mt-4 w-full rounded-xl border border-input bg-card p-3"
                  dir="ltr"
                  placeholder="پاسخ کوتاه خود را بنویسید..."
                  aria-label={`پاسخ سؤال ${(index + 1).toLocaleString("fa-IR")}`}
                />
              ) : (
                <textarea
                  value={answers[question.id] || ""}
                  disabled={inputsDisabled}
                  onChange={(event) => updateAnswer(question.id, event.target.value)}
                  className="mt-4 min-h-28 w-full rounded-xl border border-input bg-card p-3"
                  dir="ltr"
                  placeholder="پاسخ خود را بنویسید..."
                  aria-label={`پاسخ سؤال ${(index + 1).toLocaleString("fa-IR")}`}
                />
              )}
            </article>
          );
        })}
      </div>

      {!questions.length && (
        <div className="surface-card rounded-2xl p-10 text-center text-muted-foreground">
          سؤالی برای این آزمون ثبت نشده است.
        </div>
      )}

      {questions.length > 0 && (
        <div className="surface-card sticky bottom-4 mt-5 rounded-2xl p-4 shadow-[var(--shadow-brand-md)] sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div>
            <p className="font-bold">
              {answeredCount.toLocaleString("fa-IR")} از {questions.length.toLocaleString("fa-IR")} سؤال پاسخ داده شده
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              پس از پاسخ‌دادن به همه سؤال‌ها، آزمون را ثبت نهایی کنید.
            </p>
          </div>
          <button
            type="button"
            disabled={
              submitting ||
              Boolean(submission) ||
              (!timedOut && (!started || !allAnswered))
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
        <div className="feedback-error mt-4 rounded-xl p-4 text-sm" role="alert">
          {submitError}
        </div>
      )}
      {submission && (
        <div className="feedback-success mt-4 rounded-xl p-4" role="status">
          <p className="font-bold">آزمون با موفقیت ثبت شد.</p>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {submission.total_score != null && submission.max_score != null && (
              <p>امتیاز شما: {submission.total_score} از {submission.max_score}</p>
            )}
            {submission.percentage != null && <p>درصد: {submission.percentage}٪</p>}
            {submission.recommended_level && <p>سطح پیشنهادی: {submission.recommended_level}</p>}
          </div>
        </div>
      )}
    </section>
  );
}
