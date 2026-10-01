"use client";

import { useRef, useState } from "react";
import { normalizeApiError, type ApiFieldErrors } from "@/lib/apiErrors";
import { saveBlob } from "@/lib/files";
import { homeworkApi, type Homework } from "@/lib/homeworkApi";
import { useAppDispatch } from "@/store/hooks";
import {
  fetchHomework,
  homeworkSubmissionRemoved,
  homeworkSubmissionSaved,
} from "@/store/homeworkSlice";

export type SubmissionAction = "submit" | "delete" | "download";

export type SubmissionFeedback = {
  type: "success" | "error";
  text: string;
};

/** Error kinds that suggest the cached homework no longer matches the server. */
const STALE_STATE_KINDS = new Set([
  "validation",
  "authorization",
  "conflict",
  "not-found",
]);

/**
 * Submit / replace, delete and download actions for the current student's
 * answer. Successful changes are written back to the cached homework so the
 * list and detail pages update without refetching.
 */
export function useHomeworkSubmission(homework: Homework) {
  const dispatch = useAppDispatch();
  const inFlight = useRef(false);
  const [busy, setBusy] = useState<SubmissionAction | null>(null);
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState<SubmissionFeedback | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors>({});

  const homeworkId = homework.id;
  const submission = homework.my_submission;

  /** Guards against double clicks; returns false when an action is running. */
  function begin(action: SubmissionAction) {
    if (inFlight.current) return false;
    inFlight.current = true;
    setBusy(action);
    setFeedback(null);
    setFieldErrors({});
    return true;
  }

  function finish() {
    inFlight.current = false;
    setBusy(null);
  }

  async function submit(file: File, notes: string) {
    if (!begin("submit")) return false;
    setProgress(0);
    const replacing = submission !== null;

    try {
      const saved = await homeworkApi.submit(
        homeworkId,
        { file, notes },
        setProgress,
      );
      dispatch(homeworkSubmissionSaved({ homeworkId, submission: saved }));
      setFeedback({
        type: "success",
        text: replacing
          ? "فایل جدید جایگزین ارسال قبلی شد."
          : "تکلیف شما با موفقیت ارسال شد.",
      });
      return true;
    } catch (error) {
      const apiError = normalizeApiError(
        error,
        "ارسال تکلیف ناموفق بود. دوباره تلاش کنید.",
      );
      setFieldErrors(apiError.fieldErrors);
      setFeedback({ type: "error", text: apiError.message });
      if (STALE_STATE_KINDS.has(apiError.kind)) {
        void dispatch(fetchHomework({ id: homeworkId, force: true }));
      }
      return false;
    } finally {
      finish();
    }
  }

  async function remove() {
    if (!submission || !begin("delete")) return false;

    try {
      await homeworkApi.deleteSubmission(submission.id);
      dispatch(homeworkSubmissionRemoved({ homeworkId }));
      setFeedback({ type: "success", text: "پاسخ ارسال‌شده حذف شد." });
      return true;
    } catch (error) {
      const apiError = normalizeApiError(
        error,
        "حذف پاسخ ناموفق بود. دوباره تلاش کنید.",
      );
      if (apiError.kind === "not-found") {
        // Already gone on the server; bring the cache in line with it.
        dispatch(homeworkSubmissionRemoved({ homeworkId }));
        setFeedback({ type: "success", text: "این پاسخ پیش‌تر حذف شده است." });
        return true;
      }
      setFeedback({ type: "error", text: apiError.message });
      if (STALE_STATE_KINDS.has(apiError.kind)) {
        void dispatch(fetchHomework({ id: homeworkId, force: true }));
      }
      return false;
    } finally {
      finish();
    }
  }

  async function download() {
    if (!submission || !begin("download")) return;

    try {
      const { blob, fileName } = await homeworkApi.downloadSubmission(
        submission.id,
      );
      saveBlob(
        blob,
        fileName || submission.file_name || `homework-${homeworkId}`,
      );
    } catch (error) {
      setFeedback({
        type: "error",
        text: normalizeApiError(
          error,
          "دانلود فایل ناموفق بود. دوباره تلاش کنید.",
        ).message,
      });
    } finally {
      finish();
    }
  }

  return { busy, progress, feedback, fieldErrors, submit, remove, download };
}
