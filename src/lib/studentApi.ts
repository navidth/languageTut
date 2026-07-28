import apiClient from "./apiClient";
import type { User, UpdateProfileRequest } from "./auth";
import type { Course, Level } from "./courses";
import type { Skill } from "./skills";

export type { Skill } from "./skills";

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type Lesson = {
  id: number; course: number; skill: number; skill_detail: Skill; title: string;
  content: string; audio_url: string | null; video_url: string | null;
  attachment_url: string | null; order: number; is_published: boolean;
};
export type Question = {
  id: number; question_text: string; question_type: string; options: unknown;
  correct_answer?: string | null; explanation?: string | null; points?: string; order?: number;
};
export type PracticeTest = {
  id: number; course: number; level: string; skill: number; skill_detail: Skill;
  title: string; description: string; duration_minutes: number; is_published: boolean;
  questions_count: number; questions?: Question[];
};
export type Enrollment = {
  id: number; course: number; course_title: string; source: string; created_at: string;
};
export type CourseProgress = {
  id: number; course: number; course_title: string; level: string;
  completed_lessons: number; total_lessons: number; progress_percent: string; updated_at: string;
};
export type LessonProgress = {
  id: number; lesson: number; lesson_title: string; status: string; completed_at: string | null;
};
export type MyProgress = { courses: CourseProgress[]; lessons: LessonProgress[] };

const list = async <T>(path: string) => (await apiClient.get<Paginated<T>>(path)).data;

export const studentApi = {
  profile: async () => (await apiClient.get<User>("/api/auth/me/")).data,
  updateProfile: async (data: Partial<UpdateProfileRequest>) =>
    (await apiClient.patch<User>("/api/auth/me/", data)).data,
  levels: () => list<Level>("/api/levels/"),
  courses: () => list<Course>("/api/courses/"),
  lessons: () => list<Lesson>("/api/lessons/"),
  questions: () => list<Question>("/api/questions/"),
  tests: () => list<PracticeTest>("/api/practice-tests/"),
  test: async (id: number) => (await apiClient.get<PracticeTest>(`/api/practice-tests/${id}/`)).data,
  enrollments: () => list<Enrollment>("/api/me/enrollments/"),
  progress: async () => (await apiClient.get<MyProgress>("/api/me/progress/")).data,
  startLesson: async (id: number) => (await apiClient.post(`/api/lessons/${id}/start/`)).data,
  completeLesson: async (id: number) => (await apiClient.post(`/api/lessons/${id}/complete/`)).data,
};
