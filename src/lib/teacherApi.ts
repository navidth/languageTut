import apiClient from "./apiClient";

export type StudentAnswer = {
  id: number;
  question: number;
  answer_text: string;
  is_correct: boolean | null;
  score: string;
  feedback: string | null;
};

export type Submission = {
  id: number;
  practice_test: number;
  practice_test_title: string;
  started_at: string;
  submitted_at: string | null;
  total_score: string;
  max_score: string;
  answers: StudentAnswer[];
};

export type ManualGrade = {
  id: number;
  submission: number;
  question: number;
  question_text: string;
  question_points: string;
  answer_text: string;
  score: string;
  feedback: string | null;
  is_correct: boolean | null;
};

export type ManualGradeRequest = {
  score?: string;
  feedback?: string | null;
};

export type PaginatedSubmissions = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Submission[];
};

export const teacherApi = {
  profile: async () => (await apiClient.get<import("./auth").User>("/api/auth/me/")).data,
  submissions: async (page = 1) =>
    (await apiClient.get<PaginatedSubmissions>("/api/teacher/submissions/", { params: { page } })).data,
  submission: async (id: number) =>
    (await apiClient.get<Submission>(`/api/teacher/submissions/${id}/`)).data,
  answer: async (id: number) =>
    (await apiClient.get<ManualGrade>(`/api/teacher/answers/${id}/`)).data,
  gradeAnswer: async (id: number, data: ManualGradeRequest) =>
    (await apiClient.patch<ManualGrade>(`/api/teacher/answers/${id}/`, data)).data,
};
