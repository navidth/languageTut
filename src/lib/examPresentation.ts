import type { StatusTone } from "@/types";
import type { Level } from "./courses";
import { parseDecimal } from "./format";
import type {
  ExamSubmission,
  PracticeTest,
  Question,
  StudentAnswer,
} from "./studentApi";

export const questionTypeLabels: Record<string, string> = {
  multiple_choice: "چندگزینه‌ای",
  true_false: "درست / نادرست",
  short_answer: "پاسخ کوتاه",
  fill_in_blank: "جای خالی",
  essay: "تشریحی",
  speaking_prompt: "پاسخ گفتاری",
};

export function formatQuestionType(type: string | null | undefined) {
  return (type && questionTypeLabels[type]) || "سایر";
}

export const examTypeLabels: Record<string, string> = {
  practice: "آزمون تمرینی",
  placement: "آزمون تعیین سطح",
};

export function formatExamType(type: string | null | undefined) {
  return (type && examTypeLabels[type]) || "آزمون";
}

export function formatRecommendedLevel(
  level: Level | string | null | undefined,
) {
  if (!level) return null;
  if (typeof level === "string") return level;
  return level.title && level.title !== level.code
    ? `${level.code} · ${level.title}`
    : level.code;
}

export type AnswerOutcome = "correct" | "incorrect" | "pending" | "unanswered";

export const answerOutcomeLabels: Record<AnswerOutcome, string> = {
  correct: "پاسخ صحیح",
  incorrect: "پاسخ اشتباه",
  pending: "در انتظار تصحیح",
  unanswered: "بدون پاسخ",
};

export const answerOutcomeTones: Record<AnswerOutcome, StatusTone> = {
  correct: "success",
  incorrect: "danger",
  pending: "warning",
  unanswered: "neutral",
};

export function resolveAnswerOutcome(
  answer: Pick<StudentAnswer, "answer_text" | "is_correct"> | undefined,
): AnswerOutcome {
  if (!answer || !answer.answer_text.trim()) return "unanswered";
  if (answer.is_correct === true) return "correct";
  if (answer.is_correct === false) return "incorrect";
  return "pending";
}

function submittedTime(submission: Pick<ExamSubmission, "submitted_at">) {
  const time = submission.submitted_at
    ? Date.parse(submission.submitted_at)
    : Number.NaN;
  return Number.isNaN(time) ? 0 : time;
}

/** Finished attempts at one test, newest first. */
export function completedSubmissionsForTest(
  submissions: ExamSubmission[],
  testId: number,
) {
  return submissions
    .filter(
      (submission) =>
        submission.practice_test === testId && submission.submitted_at !== null,
    )
    .sort((a, b) => submittedTime(b) - submittedTime(a) || b.id - a.id);
}

/** The most recent finished attempt for every test the student has taken. */
export function latestCompletedSubmissionsByTest(submissions: ExamSubmission[]) {
  const latest: Record<number, ExamSubmission> = {};
  for (const submission of submissions) {
    if (submission.submitted_at === null) continue;
    const current = latest[submission.practice_test];
    if (
      !current ||
      submittedTime(submission) > submittedTime(current) ||
      (submittedTime(submission) === submittedTime(current) &&
        submission.id > current.id)
    ) {
      latest[submission.practice_test] = submission;
    }
  }
  return latest;
}

/** Flat, ordered question list; falls back to the questions nested in sections. */
export function collectTestQuestions(
  test: Pick<PracticeTest, "questions" | "sections"> | null | undefined,
): Question[] {
  if (!test) return [];
  const questions = test.questions?.length
    ? test.questions
    : (test.sections ?? []).flatMap((section) => section.questions ?? []);
  const unique = new Map(questions.map((question) => [question.id, question]));
  return [...unique.values()].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id,
  );
}

export type ExamResultSummary = {
  totalQuestions: number;
  answered: number;
  correct: number;
  incorrect: number;
  /** Answered, but still waiting for a teacher to grade it. */
  pending: number;
  unanswered: number;
  totalScore: number | null;
  maxScore: number | null;
  /** Clamped to the 0-100 range; `null` when it cannot be determined. */
  percentage: number | null;
  isFullyGraded: boolean;
};

export function summarizeExamResult(
  submission: Pick<
    ExamSubmission,
    "answers" | "total_score" | "max_score" | "percentage"
  >,
  questions: Pick<Question, "id">[],
): ExamResultSummary {
  const answersByQuestion = new Map(
    submission.answers.map((answer) => [answer.question, answer]),
  );
  // Without the question list, the recorded answers are the only universe.
  const questionIds = questions.length
    ? questions.map((question) => question.id)
    : submission.answers.map((answer) => answer.question);

  const counts: Record<AnswerOutcome, number> = {
    correct: 0,
    incorrect: 0,
    pending: 0,
    unanswered: 0,
  };
  for (const questionId of questionIds) {
    counts[resolveAnswerOutcome(answersByQuestion.get(questionId))] += 1;
  }

  const totalScore = parseDecimal(submission.total_score);
  const maxScore = parseDecimal(submission.max_score);
  const reportedPercentage = parseDecimal(submission.percentage);
  const percentage =
    reportedPercentage ??
    (totalScore !== null && maxScore !== null && maxScore > 0
      ? (totalScore / maxScore) * 100
      : null);

  return {
    totalQuestions: questionIds.length,
    answered: questionIds.length - counts.unanswered,
    correct: counts.correct,
    incorrect: counts.incorrect,
    pending: counts.pending,
    unanswered: counts.unanswered,
    totalScore,
    maxScore,
    percentage:
      percentage === null ? null : Math.min(100, Math.max(0, percentage)),
    isFullyGraded: counts.pending === 0,
  };
}

/** Time between starting and submitting an attempt, as readable Persian text. */
export function formatAttemptDuration(
  startedAt: string | null | undefined,
  submittedAt: string | null | undefined,
) {
  if (!startedAt || !submittedAt) return null;
  const elapsed = Date.parse(submittedAt) - Date.parse(startedAt);
  if (!Number.isFinite(elapsed) || elapsed < 0) return null;

  const minutes = Math.round(elapsed / 60_000);
  return minutes < 1
    ? "کمتر از یک دقیقه"
    : `${minutes.toLocaleString("fa-IR")} دقیقه`;
}
