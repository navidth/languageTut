import apiClient from "./apiClient";
import { parseContentDispositionFilename } from "./files";
import type { Paginated } from "./studentApi";

export const HOMEWORK_SCOPES = ["course", "lesson"] as const;
export type HomeworkScope = (typeof HOMEWORK_SCOPES)[number];

export const HOMEWORK_SUBMISSION_STATUSES = ["submitted", "graded"] as const;
export type HomeworkSubmissionStatus =
  (typeof HOMEWORK_SUBMISSION_STATUSES)[number];

export type HomeworkSubmission = {
  id: number;
  homework: number;
  homework_title: string;
  student: number;
  student_name: string;
  student_email: string;
  file_name: string;
  download_url: string;
  notes: string;
  status: HomeworkSubmissionStatus;
  is_late: boolean;
  score: string | null;
  max_score: string;
  percentage: string;
  feedback: string;
  graded_by: number | null;
  graded_by_name: string;
  graded_at: string | null;
  submitted_at: string;
  updated_at: string;
};

export type Homework = {
  id: number;
  course: number;
  /** `null` for a course-wide assignment. */
  lesson: number | null;
  lesson_title: string | null;
  scope: HomeworkScope;
  title: string;
  instructions: string;
  due_at: string | null;
  max_score: string;
  allow_late_submissions: boolean;
  is_published: boolean;
  is_past_due: boolean;
  /** The requesting student's own submission; `null` until they submit. */
  my_submission: HomeworkSubmission | null;
  /** Staff-only counter; the API omits it for students. */
  submissions_count?: number;
  created_at: string;
  updated_at: string;
};

export type HomeworkListParams = {
  page?: number;
  course?: number;
  lesson?: number;
  scope?: HomeworkScope;
};


export type HomeworkSubmitRequest = {
  file: File;
  notes?: string;
};

export type UploadProgressHandler = (percent: number) => void;

export type DownloadedFile = {
  blob: Blob;
  fileName: string | null;
};

function definedParams<T extends Record<string, unknown>>(params: T) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null),
  );
}

export const homeworkApi = {
  list: async (params: HomeworkListParams = {}) =>
    (
      await apiClient.get<Paginated<Homework>>("/api/homework/", {
        params: definedParams(params),
      })
    ).data,

  get: async (id: number) =>
    (await apiClient.get<Homework>(`/api/homework/${id}/`)).data,

  /** Uploads the student's answer, or replaces the one already submitted. */
  submit: async (
    id: number,
    data: HomeworkSubmitRequest,
    onProgress?: UploadProgressHandler,
  ) => {
    const body = new FormData();
    body.append("file", data.file);
    const notes = data.notes?.trim();
    if (notes) body.append("notes", notes);

    const response = await apiClient.post<HomeworkSubmission>(
      `/api/homework/${id}/submit/`,
      body,
      {
        // Overrides the client's JSON default so the browser sends the
        // multipart boundary instead of axios serializing the form to JSON.
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (!onProgress) return;
          const total = event.total ?? data.file.size;
          if (total <= 0) return;
          onProgress(Math.min(100, Math.round((event.loaded / total) * 100)));
        },
      },
    );
    return response.data;
  },

  deleteSubmission: async (id: number) => {
    await apiClient.delete(`/api/homework-submissions/${id}/`);
  },

  /**
   * The download endpoint needs the bearer token, so the file is fetched
   * through the API client instead of being linked to directly.
   */
  downloadSubmission: async (id: number): Promise<DownloadedFile> => {
    const response = await apiClient.get<Blob>(
      `/api/homework-submissions/${id}/download/`,
      { responseType: "blob" },
    );
    return {
      blob: response.data,
      fileName: parseContentDispositionFilename(
        response.headers["content-disposition"],
      ),
    };
  },
};
