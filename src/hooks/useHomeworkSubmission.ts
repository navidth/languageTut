"use client";

import { useRef, useState } from "react";
import { normalizeApiError } from "@/lib/services/apiErrors";
import { type ApiFieldErrors } from "@/types/api";
import { saveBlob } from "@/lib/utils/files";
import { homeworkApi } from "@/lib/services/homeworkApi";
import { type Homework, type HomeworkSubmission } from "@/types/homework";
import { useAppDispatch } from "@/store/hooks";
import { fetchHomework, homeworkSubmissionRemoved, homeworkSubmissionSaved } from "@/store/homeworkSlice";
import type { SubmissionAction, SubmissionFeedback } from "@/types/homework";
import { STALE_STATE_KINDS } from "@/constants/homework";

/**
 * Submit / replace, delete and download actions for the current student's
 * answer. Successful changes are written back to the cached homework so the
 * list and detail pages update without refetching. `details` is the full
 * submission record, when it has loaded.
 */
export function useHomeworkSubmission(
  homework: Homework,
  details: HomeworkSubmission | null,
) {
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
      dispatch(
        homeworkSubmissionRemoved({ homeworkId, submissionId: submission.id }),
      );
      setFeedback({ type: "success", text: "پاسخ ارسال‌شده حذف شد." });
      return true;
    } catch (error) {
      const apiError = normalizeApiError(
        error,
        "حذف پاسخ ناموفق بود. دوباره تلاش کنید.",
      );
      if (apiError.kind === "not-found") {
        // Already gone on the server; bring the cache in line with it.
        dispatch(
          homeworkSubmissionRemoved({ homeworkId, submissionId: submission.id }),
        );
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
        fileName || details?.file_name || `homework-${homeworkId}`,
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
