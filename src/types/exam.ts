import type { MediaAsset } from "@/types/media";
import type { EXAM_TYPES } from "@/constants/exam";
import type { Skill } from "@/types/skill";
import type { Level } from "@/types/level";

export type Question = {
  id: number;
  question_text: string;
  question_type: string;
  options: unknown;
  media?: PracticeTestMedia[];
  audio_url?: string | null;
  video_url?: string | null;
  correct_answer?: string | null;
  explanation?: string | null;
  points?: string;
  order?: number;
};

export type PracticeTestMedia = MediaAsset;

export type ExamType = (typeof EXAM_TYPES)[number];

export type ExamSection = {
  id: number;
  practice_test: number;
  title?: string;
  instructions?: string;
  order?: number;
  media?: PracticeTestMedia[];
  questions?: Question[];
};

export type PracticeTest = {
  id: number;
  course: number;
  level: string;
  skill: number;
  skill_detail: Skill;
  exam_type?: ExamType;
  title: string;
  description: string;
  duration_minutes: number;
  is_published: boolean;
  questions_count: number;
  /** `null` means unlimited attempts. */
  max_attempts?: number | null;
  is_free?: boolean;
  /** Exam media returns 403 until an attempt starts, unless `available_before_start`. */
  media?: PracticeTestMedia[];
  /** Detail only: questions stay hidden until an attempt starts. */
  questions_locked?: boolean;
  /** Detail only: the attempt currently running for this student. */
  active_submission?: ActiveSubmission | null;
  questions?: Question[];
  sections?: ExamSection[];
};

export type ActiveSubmission = {
  id: number;
  started_at: string;
  /** `null` when the test has no time limit. */
  deadline: string | null;
};

export type GradingStatus = "in_progress" | "expired" | "pending" | "graded";

export type PracticeTestAnswerRequest = {
  question: number;
  answer_text: string;
};

export type PracticeTestSubmitRequest = {
  answers: PracticeTestAnswerRequest[];
};

export type PracticeTestAttempt = {
  id?: number;
  submission_id?: number;
  practice_test?: number;
  practice_test_title?: string;
  exam_type?: string;
  started_at?: string;
  deadline?: string | null;
  submitted_at?: string | null;
  grading_status?: GradingStatus | (string & {});
  total_score?: string;
  max_score?: string;
  percentage?: string;
  recommended_level?: Level | string | null;
  answers?: StudentAnswer[];
};

export type StudentAnswer = {
  id: number;
  question: number;
  answer_text: string;
  /** `null` until a teacher grades a manually-marked answer. */
  is_correct: boolean | null;
  score: string;
  feedback: string | null;
};

/** One attempt at a practice test, as listed by `/api/me/submissions/`. */
export type ExamSubmission = {
  id: number;
  practice_test: number;
  practice_test_title: string;
  exam_type: ExamType | (string & {});
  started_at: string;
  deadline?: string | null;
  /** `null` while the attempt is still in progress, or after it expired. */
  submitted_at: string | null;
  grading_status?: GradingStatus | (string & {});
  total_score: string;
  max_score: string;
  percentage: string;
  /** The test's pass mark; `null` when it has none. */
  pass_percentage?: string | null;
  /** `null` while grading is pending or when the test has no pass mark. */
  passed?: boolean | null;
  recommended_level: Level | string | null;
  answers: StudentAnswer[];
};

export type AnswerOutcome = "correct" | "incorrect" | "pending" | "unanswered";

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

export type TestLoadError = { message: string; forbidden: boolean };
