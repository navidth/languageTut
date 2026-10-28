"use client";

import {
  useEffect,
  useId,
  useState,
  type FormEvent,
} from "react";
import { HiDownload, HiPaperClip, HiTrash, HiUpload } from "react-icons/hi";
import LoginPrompt from "@/components/auth/LoginPrompt";
import { useSessionState } from "@/components/auth/useSessionState";
import FileDropzone from "@/components/ui/FileDropzone";
import { Skeleton } from "@/components/ui/Skeleton";
import StatusBadge from "@/components/ui/StatusBadge";
import type { ApiFieldErrors } from "@/lib/apiErrors";
import { formatPersianDateTime } from "@/lib/date";
import { formatDecimal } from "@/lib/format";
import type {
  Homework,
  HomeworkSubmission,
  HomeworkSubmissionSummary,
} from "@/lib/homeworkApi";
import {
  canDeleteHomeworkSubmission,
  canSubmitHomework,
  describeHomeworkStatus,
  isSubmissionWindowOpen,
} from "@/lib/homeworkPresentation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchHomeworkSubmission } from "@/store/homeworkSlice";
import {
  useHomeworkSubmission,
  type SubmissionAction,
} from "./useHomeworkSubmission";

export default function HomeworkSubmissionPanel({
  homework,
}: {
  homework: Homework;
}) {
  const session = useSessionState();
  const role = useAppSelector((state) => state.auth.user?.role);
  const headingId = useId();

  return (
    <section
      className="surface-card mt-6 rounded-3xl p-6"
      aria-labelledby={headingId}
    >
      <h2 id={headingId} className="text-xl font-black">
        پاسخ شما
      </h2>

      {(session === "unknown" || session === "restoring") && (
        <div role="status" className="mt-5">
          <span className="sr-only">در حال بررسی حساب کاربری...</span>
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      )}
      {session === "anonymous" && (
        <LoginPrompt
          className="mt-5"
          message="برای ارسال پاسخ و مشاهده نمره، وارد حساب کاربری خود شوید."
        />
      )}
      {session === "authenticated" && role !== "student" && (
        <p className="feedback-warning mt-5 rounded-2xl p-4 text-sm" role="status">
          ارسال تکلیف فقط با حساب دانش‌آموز امکان‌پذیر است.
        </p>
      )}
      {session === "authenticated" && role === "student" && (
        <StudentSubmission homework={homework} />
      )}
    </section>
  );
}

/** Whether the full record still agrees with the summary on the homework. */
function matchesSummary(
  submission: HomeworkSubmission,
  summary: HomeworkSubmissionSummary,
) {
  return (
    submission.status === summary.status &&
    submission.score === summary.score &&
    submission.is_late === summary.is_late &&
    submission.submitted_at === summary.submitted_at
  );
}

function StudentSubmission({ homework }: { homework: Homework }) {
  const dispatch = useAppDispatch();
  const summary = homework.my_submission;
  const submissionId = summary?.id ?? null;
  const entry = useAppSelector((state) =>
    submissionId === null ? undefined : state.homework.submissions[submissionId],
  );
  const submission = entry?.data ?? null;
  // A reloaded homework can be ahead of the cached record, e.g. after grading.
  const outdated = Boolean(
    summary && submission && !matchesSummary(submission, summary),
  );
  const { busy, progress, feedback, fieldErrors, submit, remove, download } =
    useHomeworkSubmission(homework, submission);
  const windowOpen = isSubmissionWindowOpen(homework);
  const canSubmit = canSubmitHomework(homework);
  const canDelete = canDeleteHomeworkSubmission(homework);
  const detailsFailed = Boolean(summary && !submission && entry?.status === "failed");
  const loadingDetails = Boolean(summary && !submission && !detailsFailed);

  useEffect(() => {
    if (submissionId !== null) {
      void dispatch(fetchHomeworkSubmission({ id: submissionId, force: outdated }));
    }
  }, [dispatch, outdated, submissionId]);

  function reloadDetails() {
    if (submissionId !== null) {
      void dispatch(fetchHomeworkSubmission({ id: submissionId, force: true }));
    }
  }

  return (
    <div className="mt-5 space-y-5">
      {feedback && (
        <p
          className={`${feedback.type === "success" ? "feedback-success" : "feedback-error"} rounded-2xl p-4 text-sm`}
          role={feedback.type === "error" ? "alert" : "status"}
        >
          {feedback.text}
        </p>
      )}

      {submission && (
        <SubmittedFile
          submission={submission}
          downloading={busy === "download"}
          disabled={busy !== null}
          onDownload={download}
        />
      )}
      {loadingDetails && (
        <div role="status">
          <span className="sr-only">در حال دریافت پاسخ ارسال‌شده...</span>
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      )}
      {detailsFailed && (
        <div
          className="feedback-error flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 text-sm"
          role="alert"
        >
          <span>{entry?.error}</span>
          <button
            type="button"
            onClick={reloadDetails}
            className="ghost-button rounded-xl px-4 py-2 text-xs"
          >
            تلاش دوباره
          </button>
        </div>
      )}
      {submission?.status === "graded" && <GradeSummary submission={submission} />}

      {!summary && !canSubmit && (
        <p
          className={`${homework.is_published && !homework.has_started ? "feedback-warning" : "feedback-error"} rounded-2xl p-4 text-sm`}
          role="status"
        >
          {!homework.is_published
            ? "این تکلیف هنوز منتشر نشده است."
            : !homework.has_started
              ? describeHomeworkStatus(homework)
              : "مهلت ارسال این تکلیف به پایان رسیده است و ارسال با تأخیر پذیرفته نمی‌شود."}
        </p>
      )}
      {summary && summary.status !== "graded" && !windowOpen && (
        <p className="feedback-warning rounded-2xl p-4 text-sm" role="status">
          مهلت این تکلیف به پایان رسیده است و امکان جایگزینی فایل وجود ندارد.
        </p>
      )}

      {canSubmit && !loadingDetails && (
        <SubmissionForm
          key={summary ? `${summary.id}:${submission?.updated_at ?? ""}` : "new"}
          replacing={summary !== null}
          initialNotes={submission?.notes ?? ""}
          late={homework.is_past_due}
          busy={busy}
          progress={progress}
          fieldErrors={fieldErrors}
          onSubmit={submit}
        />
      )}
      {canDelete && !loadingDetails && (
        <DeleteSubmission
          deleting={busy === "delete"}
          disabled={busy !== null}
          windowOpen={windowOpen}
          onDelete={remove}
        />
      )}
    </div>
  );
}

function SubmittedFile({
  submission,
  downloading,
  disabled,
  onDownload,
}: {
  submission: HomeworkSubmission;
  downloading: boolean;
  disabled: boolean;
  onDownload: () => void;
}) {
  const edited = submission.updated_at !== submission.submitted_at;

  return (
    <div className="rounded-2xl border border-border bg-secondary-soft/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-brand-accent">
            <HiPaperClip className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-bold" dir="auto">
              {submission.file_name || "فایل ارسال‌شده"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              ارسال در {formatPersianDateTime(submission.submitted_at)}
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={disabled}
          aria-busy={downloading}
          onClick={onDownload}
          className="ghost-button inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm"
        >
          <HiDownload className="size-4" aria-hidden="true" />
          {downloading ? "در حال دانلود..." : "دانلود فایل"}
        </button>
      </div>

      {(submission.is_late || edited) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {submission.is_late && (
            <StatusBadge tone="warning">ارسال با تأخیر</StatusBadge>
          )}
          {edited && (
            <span className="text-xs text-muted-foreground">
              آخرین به‌روزرسانی: {formatPersianDateTime(submission.updated_at)}
            </span>
          )}
        </div>
      )}

      {submission.notes?.trim() && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">توضیحات شما</p>
          <p className="mt-1 whitespace-pre-line text-sm leading-7" dir="auto">
            {submission.notes}
          </p>
        </div>
      )}
    </div>
  );
}

function GradeSummary({ submission }: { submission: HomeworkSubmission }) {
  const gradedBy = submission.graded_by_name?.trim();
  const feedback = submission.feedback?.trim();

  return (
    <div className="rounded-2xl border border-border p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">نمره شما</p>
          <p className="mt-1 text-3xl font-black text-success">
            {formatDecimal(submission.score)}
            <span className="ms-2 text-base font-bold text-muted-foreground">
              از {formatDecimal(submission.max_score)}
            </span>
          </p>
        </div>
        <StatusBadge tone="success">
          {formatDecimal(submission.percentage)}٪
        </StatusBadge>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {gradedBy ? `نمره‌دهی توسط ${gradedBy}` : "نمره‌دهی شده"}
        {submission.graded_at &&
          ` · ${formatPersianDateTime(submission.graded_at)}`}
      </p>
      <div className="mt-4 rounded-xl bg-secondary-soft p-4">
        <p className="text-sm font-bold">بازخورد مدرس</p>
        <p
          className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground"
          dir="auto"
        >
          {feedback || "مدرس بازخوردی ثبت نکرده است."}
        </p>
      </div>
    </div>
  );
}

function SubmissionForm({
  replacing,
  initialNotes,
  late,
  busy,
  progress,
  fieldErrors,
  onSubmit,
}: {
  replacing: boolean;
  initialNotes: string;
  late: boolean;
  busy: SubmissionAction | null;
  progress: number;
  fieldErrors: ApiFieldErrors;
  onSubmit: (file: File, notes: string) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(!replacing);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState(initialNotes);
  const [fileError, setFileError] = useState("");
  const fileLabelId = useId();
  const fileInputId = useId();
  const fileErrorId = useId();
  const notesId = useId();

  const uploading = busy === "submit";
  const disabled = busy !== null;
  const shownFileError = fileError || fieldErrors.file?.[0] || "";
  const notesError = fieldErrors.notes?.[0];

  function chooseFile(selected: File | null) {
    setFile(selected);
    setFileError(selected?.size === 0 ? "فایل انتخاب‌شده خالی است." : "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;
    if (!file) {
      setFileError("ابتدا فایل پاسخ خود را انتخاب کنید.");
      return;
    }
    if (file.size === 0) {
      setFileError("فایل انتخاب‌شده خالی است.");
      return;
    }
    await onSubmit(file, notes);
  }

  if (!open) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="ghost-button inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm"
      >
        <HiUpload className="size-4" aria-hidden="true" />
        جایگزینی فایل ارسال‌شده
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-busy={uploading}
      className="rounded-2xl border border-border p-5"
    >
      <h3 className="font-bold">{replacing ? "ارسال نسخه جدید" : "ارسال پاسخ"}</h3>
      {replacing && (
        <p className="mt-2 text-sm text-muted-foreground">
          فایل جدید جایگزین فایل قبلی می‌شود.
        </p>
      )}
      {late && (
        <p className="feedback-warning mt-4 rounded-xl p-3 text-sm" role="status">
          مهلت این تکلیف گذشته است؛ پاسخ شما با تأخیر ثبت می‌شود.
        </p>
      )}

      <p id={fileLabelId} className="mb-2 mt-5 text-sm font-bold">
        فایل پاسخ
      </p>
      <FileDropzone
        id={fileInputId}
        file={file}
        onFileChange={chooseFile}
        disabled={disabled}
        invalid={Boolean(shownFileError)}
        aria-labelledby={fileLabelId}
        aria-describedby={shownFileError ? fileErrorId : undefined}
        hint="یک فایل شامل پاسخ خود را بارگذاری کنید."
      />
      {shownFileError && (
        <p id={fileErrorId} className="mt-2 text-xs text-destructive" role="alert">
          {shownFileError}
        </p>
      )}

      <label htmlFor={notesId} className="mb-2 mt-5 block text-sm font-bold">
        توضیحات (اختیاری)
      </label>
      <textarea
        id={notesId}
        value={notes}
        rows={4}
        disabled={disabled}
        onChange={(event) => setNotes(event.target.value)}
        className="w-full rounded-xl border border-input bg-card p-3 text-sm leading-7"
        placeholder="اگر نکته‌ای برای مدرس دارید، اینجا بنویسید."
        dir="auto"
        aria-invalid={Boolean(notesError)}
      />
      {notesError && (
        <p className="mt-2 text-xs text-destructive" role="alert">
          {notesError}
        </p>
      )}

      {uploading && (
        <div className="mt-5">
          <div
            role="progressbar"
            aria-label="پیشرفت بارگذاری"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="h-2 overflow-hidden rounded-full bg-secondary-soft"
          >
            <div
              className="h-full rounded-full bg-brand-accent transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            در حال بارگذاری... {progress.toLocaleString("fa-IR")}٪
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={disabled}
          className="brand-button rounded-xl px-6 py-3 text-sm"
        >
          {uploading
            ? "در حال ارسال..."
            : replacing
              ? "جایگزینی فایل"
              : "ارسال تکلیف"}
        </button>
        {replacing && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen(false)}
            className="ghost-button rounded-xl px-6 py-3 text-sm"
          >
            انصراف
          </button>
        )}
      </div>
    </form>
  );
}

function DeleteSubmission({
  deleting,
  disabled,
  windowOpen,
  onDelete,
}: {
  deleting: boolean;
  disabled: boolean;
  windowOpen: boolean;
  onDelete: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-2 rounded-xl px-2 py-1 text-sm font-bold text-destructive hover:bg-destructive-soft"
      >
        <HiTrash className="size-4" aria-hidden="true" />
        حذف پاسخ ارسال‌شده
      </button>
    );
  }

  return (
    <div className="feedback-error rounded-2xl p-4" role="alert">
      <p className="text-sm font-bold">آیا از حذف پاسخ خود مطمئن هستید؟</p>
      <p className="mt-1 text-sm">
        {windowOpen
          ? "فایل ارسال‌شده حذف می‌شود و می‌توانید دوباره پاسخ خود را ارسال کنید."
          : "مهلت این تکلیف به پایان رسیده است و پس از حذف، امکان ارسال دوباره ندارید."}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={disabled}
          aria-busy={deleting}
          onClick={onDelete}
          className="rounded-xl bg-destructive px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          {deleting ? "در حال حذف..." : "بله، حذف شود"}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setConfirming(false)}
          className="ghost-button rounded-xl px-5 py-2 text-sm"
        >
          انصراف
        </button>
      </div>
    </div>
  );
}
