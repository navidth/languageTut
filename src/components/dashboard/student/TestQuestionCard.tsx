import { memo } from "react";
import type { PracticeTestAttempt, Question } from "@/lib/studentApi";
import PracticeTestMedia from "./PracticeTestMedia";

type QuestionResult = NonNullable<PracticeTestAttempt["answers"]>[number];

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

type TestQuestionCardProps = {
  question: Question;
  index: number;
  answer: string;
  disabled: boolean;
  result?: QuestionResult;
  onAnswerChange: (questionId: number, value: string) => void;
};

function TestQuestionCard({
  question,
  index,
  answer,
  disabled,
  result,
  onAnswerChange,
}: TestQuestionCardProps) {
  const options = Array.isArray(question.options) ? question.options : [];
  const choiceOptions = question.question_type === "true_false"
    ? [{ label: "صحیح", value: "true" }, { label: "غلط", value: "false" }]
    : options.map((option) => ({ label: String(option), value: String(option) }));
  const model = questionTypeLabels[question.question_type] ?? "سایر";
  const questionNumber = (index + 1).toLocaleString("fa-IR");
  const questionMedia = [
    ...(question.media ?? []),
    ...(question.video_url ? [{
      video_url: question.video_url,
      title: `ویدئوی سؤال ${questionNumber}`,
    }] : []),
    ...(question.audio_url ? [{
      audio_url: question.audio_url,
      title: `فایل صوتی سؤال ${questionNumber}`,
    }] : []),
  ];
  const resultBorder = result?.is_correct === true
    ? "var(--success)"
    : result?.is_correct === false
      ? "var(--destructive)"
      : undefined;

  return (
    <article
      data-testid={`question-${question.id}`}
      dir="ltr"
      style={{ borderColor: resultBorder }}
      className="surface-card rounded-2xl p-6 text-left"
    >
      <h2 className="font-bold leading-8">
        <span className="mr-2 text-brand-accent">{questionNumber}.</span>
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

      {questionMedia.length > 0 && (
        <div dir="rtl">
          <PracticeTestMedia
            media={questionMedia}
            title={`رسانه سؤال ${questionNumber}`}
            description="برای پاسخ به این سؤال، فایل صوتی یا ویدئویی را پخش کنید."
            className="my-5 text-right"
          />
        </div>
      )}

      {choiceOptions.length ? (
        <div className={question.question_type === "true_false" ? "mt-4 grid grid-cols-2 gap-3" : "mt-4 space-y-2"}>
          {choiceOptions.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${
                answer === option.value
                  ? "border-brand-accent bg-accent-soft text-brand-primary"
                  : "border-border hover:border-brand-accent"
              } ${question.question_type === "true_false" ? "justify-center" : ""} ${
                disabled ? "cursor-not-allowed opacity-60" : ""
              }`}
            >
              <input
                type="radio"
                name={`q-${question.id}`}
                value={option.value}
                checked={answer === option.value}
                disabled={disabled}
                onChange={() => onAnswerChange(question.id, option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      ) : question.question_type === "short_answer" ? (
        <input
          type="text"
          value={answer}
          disabled={disabled}
          onChange={(event) => onAnswerChange(question.id, event.target.value)}
          className="mt-4 w-full rounded-xl border border-input bg-card p-3"
          dir="ltr"
          placeholder="پاسخ کوتاه خود را بنویسید..."
          aria-label={`پاسخ سؤال ${questionNumber}`}
        />
      ) : (
        <textarea
          value={answer}
          disabled={disabled}
          onChange={(event) => onAnswerChange(question.id, event.target.value)}
          className="mt-4 min-h-28 w-full rounded-xl border border-input bg-card p-3"
          dir="ltr"
          placeholder="پاسخ خود را بنویسید..."
          aria-label={`پاسخ سؤال ${questionNumber}`}
        />
      )}
    </article>
  );
}

export default memo(TestQuestionCard);
