import apiClient from "./apiClient";
import type { Course, Level } from "./courses";
import type { MediaAsset } from "./media";
import type { Skill } from "./skills";

export type { Skill } from "./skills";

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type Lesson = {
  id: number;
  course: number;
  skill: number;
  skill_detail: Skill;
  title: string;
  content: string;
  audio_url: string | null;
  video_url: string | null;
  attachment_url: string | null;
  order: number;
  is_published: boolean;
};
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
export const EXAM_TYPES = ["practice", "placement"] as const;
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
  recommended_level: Level | string | null;
  answers: StudentAnswer[];
};
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

const list = async <T>(path: string, page = 1) =>
  (await apiClient.get<Paginated<T>>(path, { params: { page } })).data;

export const studentApi = {
  levels: (page = 1) => list<Level>("/api/levels/", page),
  course: async (id: number) =>
    (await apiClient.get<Course>(`/api/courses/${id}/`)).data,
  purchaseCourse: async (id: number) =>
    (await apiClient.post<PurchaseResponse>(`/api/payments/courses/${id}/purchase/`, {})).data,
  lessons: (page = 1) => list<Lesson>("/api/lessons/", page),
  questions: (page = 1) => list<Question>("/api/questions/", page),
  tests: (page = 1) => list<PracticeTest>("/api/practice-tests/", page),
  test: async (id: number) =>
    (await apiClient.get<PracticeTest>(`/api/practice-tests/${id}/`)).data,
  /** Starts an attempt, or returns the one already running. */
  startTest: async (id: number) =>
    (await apiClient.post<PracticeTestAttempt>(`/api/practice-tests/${id}/start/`, {})).data,
  /** Needs a running attempt; returns 400 without one or after its deadline. */
  submitTest: async (id: number, data: PracticeTestSubmitRequest) =>
    (await apiClient.post<PracticeTestAttempt>(`/api/practice-tests/${id}/submit/`, data)).data,
  mySubmissions: async () => {
    const { data } = await apiClient.get<
      ExamSubmission[] | Paginated<ExamSubmission>
    >("/api/me/submissions/");
    // Documented as a plain array; a paginated envelope is tolerated too.
    return Array.isArray(data) ? data : data.results;
  },
  enrollments: (page = 1) => list<Enrollment>("/api/me/enrollments/", page),
  progress: async () =>
    (await apiClient.get<MyProgress>("/api/me/progress/")).data,
  courseProgress: async (courseId: number) =>
    (await apiClient.get<CourseProgress>(`/api/me/courses/${courseId}/progress/`)).data,
  startLesson: async (id: number) =>
    (await apiClient.post(`/api/lessons/${id}/start/`)).data,
  completeLesson: async (id: number) =>
    (await apiClient.post(`/api/lessons/${id}/complete/`)).data,
};
