import apiClient from "@/lib/services/apiClient";
import type { Paginated } from "@/types/api";
import type { Lesson } from "@/types/course";
import type {
  ExamSubmission,
  PracticeTest,
  PracticeTestAttempt,
  PracticeTestSubmitRequest,
  Question,
} from "@/types/exam";
import type { Level } from "@/types/level";
import type { CourseProgress, Enrollment, MyProgress } from "@/types/student";

const list = async <T>(path: string, page = 1) =>
  (await apiClient.get<Paginated<T>>(path, { params: { page } })).data;

export const studentApi = {
  levels: (page = 1) => list<Level>("/api/levels/", page),
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
