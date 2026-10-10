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
  /** `null` until graded. */
  percentage: string | null;
  feedback: string;
  graded_by: number | null;
  graded_by_name: string;
  graded_at: string | null;
  submitted_at: string;
  updated_at: string;
};

/**
 * The short form of the student's submission that the homework list and
 * detail endpoints embed as `my_submission`. The file name, notes, feedback
 * and grading details only come from `/api/homework-submissions/{id}/`.
 */
export type HomeworkSubmissionSummary = Pick<
  HomeworkSubmission,
  "id" | "status" | "score" | "is_late" | "submitted_at"
>;

export function toSubmissionSummary(
  submission: HomeworkSubmission,
): HomeworkSubmissionSummary {
  const { id, status, score, is_late, submitted_at } = submission;
  return { id, status, score, is_late, submitted_at };
}

/**
 * Swagger now types `my_submission` as the full record; older responses sent
 * only the summary. This tells the two apart so a full one can be reused.
 */
export function isFullSubmission(
  submission: HomeworkSubmissionSummary | null | undefined,
): submission is HomeworkSubmission {
  const candidate = submission as Partial<HomeworkSubmission> | null | undefined;
  return (
    typeof candidate?.file_name === "string" &&
    typeof candidate.updated_at === "string" &&
    typeof candidate.max_score === "string"
  );
}

/** A file the teacher hands out with the assignment (worksheet, audio, ...). */
export type HomeworkAttachment = {
  id: number;
  homework: number;
  title: string;
  file_name: string;
  /** Bytes. */
  file_size: number;
  download_url: string;
  created_at: string;
};

export type Homework = {
  id: number;
  course: number;
  course_title: string;
  /** `null` for a course-wide assignment. */
  lesson: number | null;
  lesson_title: string | null;
  scope: HomeworkScope;
  title: string;
  instructions: string;
  attachments: HomeworkAttachment[];
  /** Submissions open at this time; `null` opens them on publish. */
  starts_at: string | null;
  due_at: string | null;
  max_score: string;
  allow_late_submissions: boolean;
  is_published: boolean;
  /** `false` while `starts_at` is still ahead. */
  has_started: boolean;
  is_past_due: boolean;
  /** The server's answer to "can a submission be sent now?". */
  is_open: boolean;
  created_by: number | null;
  created_by_name: string;
  /** The requesting student's own submission; `null` until they submit. */
  my_submission: HomeworkSubmissionSummary | null;
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

  getSubmission: async (id: number) =>
    (await apiClient.get<HomeworkSubmission>(`/api/homework-submissions/${id}/`))
      .data,

  deleteSubmission: async (id: number) => {
    await apiClient.delete(`/api/homework-submissions/${id}/`);
  },

  /**
   * The download endpoints need the bearer token, so files are fetched
   * through the API client instead of being linked to directly.
   */
  downloadSubmission: (id: number) =>
    downloadFile(`/api/homework-submissions/${id}/download/`),

  /** A teacher's attachment; also needs the bearer token. */
  downloadAttachment: (id: number) =>
    downloadFile(`/api/homework-attachments/${id}/download/`),
};

async function downloadFile(path: string): Promise<DownloadedFile> {
  const response = await apiClient.get<Blob>(path, { responseType: "blob" });
  return {
    blob: response.data,
    fileName: parseContentDispositionFilename(
      response.headers["content-disposition"],
    ),
  };
}
