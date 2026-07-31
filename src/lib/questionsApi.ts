import apiClient from "./apiClient";

export const QUESTION_TYPES = [
  "multiple_choice",
  "true_false",
  "short_answer",
  "essay",
  "speaking_prompt",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export type Question = {
  id: number;
  question_text: string;
  question_type: QuestionType;
  options: unknown;
  correct_answer: string | null;
  explanation: string | null;
  points: string;
  order: number;
  practice_test: number;
};

export type QuestionRequest = {
  question_text: string;
  question_type: QuestionType;
  options?: unknown;
  correct_answer?: string | null;
  explanation?: string | null;
  points?: string;
  order?: number;
  practice_test: number;
};

export type PaginatedQuestions = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Question[];
};

export const questionsApi = {
  list: async (page = 1) =>
    (await apiClient.get<PaginatedQuestions>("/api/questions/", { params: { page } })).data,
  get: async (id: number) =>
    (await apiClient.get<Question>(`/api/questions/${id}/`)).data,
  create: async (data: QuestionRequest) =>
    (await apiClient.post<Question>("/api/questions/", data)).data,
  update: async (id: number, data: QuestionRequest) =>
    (await apiClient.put<Question>(`/api/questions/${id}/`, data)).data,
  patch: async (id: number, data: Partial<QuestionRequest>) =>
    (await apiClient.patch<Question>(`/api/questions/${id}/`, data)).data,
  remove: async (id: number) => {
    await apiClient.delete(`/api/questions/${id}/`);
  },
};
