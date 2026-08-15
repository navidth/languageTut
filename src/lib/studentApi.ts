import apiClient from "./apiClient";
import type { User, UpdateProfileRequest } from "./auth";
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
  correct_answer?: string | null;
  explanation?: string | null;
  points?: string;
  order?: number;
};
export type PracticeTestMedia = MediaAsset;
export type PracticeTest = {
  id: number;
  course: number;
  level: string;
  skill: number;
  skill_detail: Skill;
  title: string;
  description: string;
  duration_minutes: number;
  is_published: boolean;
  questions_count: number;
  media?: PracticeTestMedia[];
  questions?: Question[];
};
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
  submitted_at?: string | null;
  total_score?: string;
  max_score?: string;
  percentage?: string;
  recommended_level?: string | null;
  answers?: Array<{
    id: number;
    question: number;
    answer_text: string;
    is_correct: boolean | null;
    score: string;
    feedback: string | null;
  }>;
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

const list = async <T>(path: string, page = 1) =>
  (await apiClient.get<Paginated<T>>(path, { params: { page } })).data;

export const studentApi = {
  profile: async () => (await apiClient.get<User>("/api/auth/me/")).data,
  updateProfile: async (data: Partial<UpdateProfileRequest>) =>
    (await apiClient.patch<User>("/api/auth/me/", data)).data,
  levels: (page = 1) => list<Level>("/api/levels/", page),
  courses: (page = 1) => list<Course>("/api/courses/", page),
  course: async (id: number) =>
    (await apiClient.get<Course>(`/api/courses/${id}/`)).data,
  lessons: (page = 1) => list<Lesson>("/api/lessons/", page),
  questions: (page = 1) => list<Question>("/api/questions/", page),
  tests: (page = 1) => list<PracticeTest>("/api/practice-tests/", page),
  test: async (id: number) =>
    (await apiClient.get<PracticeTest>(`/api/practice-tests/${id}/`)).data,
  startTest: async (id: number) =>
    (await apiClient.post<PracticeTestAttempt>(`/api/practice-tests/${id}/start/`, {})).data,
  submitTest: async (id: number, data: PracticeTestSubmitRequest) =>
    (await apiClient.post<PracticeTestAttempt>(`/api/practice-tests/${id}/submit/`, data)).data,
  enrollments: (page = 1) => list<Enrollment>("/api/me/enrollments/", page),
  progress: async () =>
    (await apiClient.get<MyProgress>("/api/me/progress/")).data,
  startLesson: async (id: number) =>
    (await apiClient.post(`/api/lessons/${id}/start/`)).data,
  completeLesson: async (id: number) =>
    (await apiClient.post(`/api/lessons/${id}/complete/`)).data,
};
