import type { HOMEWORK_SCOPES, HOMEWORK_SUBMISSION_STATUSES } from "@/constants/homework";
import type { StatusTone } from "@/types/ui";

export type HomeworkScope = (typeof HOMEWORK_SCOPES)[number];

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

/**
 * UI state of a homework for the current student. The backend only reports
 * `submitted` / `graded` on a submission, so the remaining states are derived
 * from `my_submission`, `has_started`, `is_past_due` and
 * `allow_late_submissions`.
 */
export type HomeworkDisplayStatus =
  | "not-started"
  | "open"
  | "late-open"
  | "closed"
  | "submitted"
  | "submitted-late"
  | "graded"
  | "unpublished";

export type HomeworkStatusSource = Pick<
  Homework,
  | "is_published"
  | "has_started"
  | "is_past_due"
  | "is_open"
  | "allow_late_submissions"
  | "my_submission"
>;

export type DueDateInfo = {
  text: string;
  tone: StatusTone;
};

export type HomeworkSearchParams = {
  page: number;
  course?: number;
  scope?: HomeworkScope;
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

export type SubmissionAction = "submit" | "delete" | "download";

export type SubmissionFeedback = {
  type: "success" | "error";
  text: string;
};
