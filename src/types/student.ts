import type { Level } from "@/types/level";
import type { Lesson, Course } from "@/types/course";
import type { ExamSubmission, Question, PracticeTest } from "@/types/exam";
import type { Homework } from "@/types/homework";

export type Enrollment = {
  id: number;
  course: number;
  course_title: string;
  source: string;
  created_at: string;
};

export type CourseProgress = {
  id: number;
  course: number;
  course_title: string;
  level: string;
  completed_lessons: number;
  total_lessons: number;
  progress_percent: string;
  updated_at: string;
};

export type LessonProgress = {
  id: number;
  lesson: number;
  lesson_title: string;
  status: string;
  completed_at: string | null;
};

export type MyProgress = {
  courses: CourseProgress[];
  lessons: LessonProgress[];
};

export type PurchaseResponse = {
  payment_url: string | null;
  authority?: string;
  detail?: string;
};

export type StudentResourceKind = "levels" | "lessons" | "questions" | "tests";

export type StudentResource = Level | Lesson | Question | PracticeTest;

export type StudentResourcePageKind = "levels" | "courses" | "lessons" | "questions" | "tests";

export type StudentResourceItem = Level | Course | Lesson | Question | PracticeTest;

/** What the dashboard shows of the student's course and lesson progress. */
export type LearningSummary = {
  completedLessons: number;
  /** Lessons in all the courses the student has progress in. */
  totalLessons: number;
  /** Share of those lessons completed, 0 to 100; `null` with no lessons. */
  overallPercent: number | null;
  /** Most recently active first. */
  courses: CourseProgress[];
  /** The most recently active course that is not finished yet. */
  continueCourse: CourseProgress | null;
};

export type ExamSummary = {
  /** Tests with at least one finished attempt. */
  taken: number;
  /** Mean of the latest graded score per test; `null` before any. */
  averagePercent: number | null;
  /** The latest finished attempt per test, newest first. */
  recent: ExamSubmission[];
};

export type HomeworkSummary = {
  /** Open homework not yet submitted, nearest deadline first. */
  pending: Homework[];
  /** More homework pages exist, so `pending` may be missing some. */
  partial: boolean;
};
