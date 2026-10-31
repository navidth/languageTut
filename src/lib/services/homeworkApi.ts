import apiClient from "@/lib/services/apiClient";
import { parseContentDispositionFilename } from "@/lib/utils/files";
import type { Paginated } from "@/types/api";
import type { HomeworkListParams, Homework, HomeworkSubmitRequest, HomeworkSubmission } from "@/types/homework";
import type { UploadProgressHandler, DownloadedFile } from "@/types/api";

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
