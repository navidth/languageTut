import type { AnswerOutcome } from "@/types/exam";
import type { StatusTone } from "@/types/ui";

export const EXAM_TYPES = ["practice", "placement"] as const;

export const questionTypeLabels: Record<string, string> = {
  multiple_choice: "چندگزینه‌ای",
  true_false: "درست / نادرست",
  short_answer: "پاسخ کوتاه",
  fill_in_blank: "جای خالی",
  essay: "تشریحی",
  speaking_prompt: "پاسخ گفتاری",
};

export const examTypeLabels: Record<string, string> = {
  practice: "آزمون تمرینی",
  placement: "آزمون تعیین سطح",
};

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

export const EXAM_RESULT_BACK_LABEL = "بازگشت به آزمون‌ها";

export const trueFalseLabels: Record<string, string> = {
  true: "صحیح",
  false: "غلط",
};

/** The server rejects late submits, so answers are sent a little early. */
export const AUTO_SUBMIT_LEAD_MS = 5_000;

export const EXAM_EXPIRED_MESSAGE =
  "زمان این تلاش به پایان رسیده بود و پاسخ‌ها ثبت نشد.";
