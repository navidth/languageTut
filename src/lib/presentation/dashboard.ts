import { latestCompletedSubmissionsByTest } from "@/lib/presentation/exam";
import { resolveHomeworkStatus } from "@/lib/presentation/homework";
import { parseDecimal } from "@/lib/utils/format";
import { SCORE_GOOD_PERCENT, SCORE_WEAK_PERCENT } from "@/constants/student";
import type { Paginated } from "@/types/api";
import type { ExamSubmission } from "@/types/exam";
import type { DueDateInfo, Homework } from "@/types/homework";
import type {
  CourseProgress,
  ExamSummary,
  HomeworkSummary,
  LearningSummary,
  MyProgress,
} from "@/types/student";
import type { RingTone } from "@/types/ui";

/** Milliseconds of an API date; 0 when missing, so it sorts last. */
function timeOf(value: string | null | undefined) {
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function coursePercent(course: Pick<CourseProgress, "progress_percent">) {
  return Math.min(100, Math.max(0, parseDecimal(course.progress_percent) ?? 0));
}

export function summarizeLearning({ courses, lessons }: MyProgress): LearningSummary {
  const sorted = [...courses].sort((a, b) => timeOf(b.updated_at) - timeOf(a.updated_at));
  const totalLessons = courses.reduce((sum, course) => sum + course.total_lessons, 0);
  const finished = courses.reduce((sum, course) => sum + course.completed_lessons, 0);

  return {
    completedLessons: lessons.filter((lesson) => lesson.status === "completed").length,
    totalLessons,
    overallPercent: totalLessons > 0 ? Math.round((finished / totalLessons) * 100) : null,
    courses: sorted,
    continueCourse: sorted.find((course) => coursePercent(course) < 100) ?? null,
  };
}

/** A score still being graded counts in no average. */
function isGraded(submission: ExamSubmission) {
  return submission.grading_status !== "pending";
}

export function summarizeExams(submissions: ExamSubmission[]): ExamSummary {
  const latest = Object.values(latestCompletedSubmissionsByTest(submissions)).sort(
    (a, b) => timeOf(b.submitted_at) - timeOf(a.submitted_at) || b.id - a.id,
  );
  const scores = latest
    .filter(isGraded)
    .map((submission) => parseDecimal(submission.percentage))
    .filter((score): score is number => score !== null);

  return {
    taken: latest.length,
    averagePercent: scores.length
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : null,
    recent: latest,
  };
}

/** Uses the test's own pass mark when it has one. */
export function scoreTone(
  submission: Pick<ExamSubmission, "percentage" | "passed" | "grading_status">,
): RingTone {
  if (submission.grading_status === "pending") return "warning";
  if (submission.passed === true) return "success";
  if (submission.passed === false) return "danger";
  return percentTone(parseDecimal(submission.percentage));
}

export function percentTone(percent: number | null): RingTone {
  if (percent === null) return "accent";
  if (percent >= SCORE_GOOD_PERCENT) return "success";
  return percent >= SCORE_WEAK_PERCENT ? "accent" : "danger";
}

/** Homework that can be sent now and has not been, nearest deadline first. */
export function summarizeHomework(page: Paginated<Homework> | null | undefined): HomeworkSummary {
  const pending = (page?.results ?? [])
    .filter((homework) => {
      const status = resolveHomeworkStatus(homework);
      return status === "open" || status === "late-open";
    })
    .sort((a, b) => (timeOf(a.due_at) || Infinity) - (timeOf(b.due_at) || Infinity));

  return { pending, partial: Boolean(page?.next) };
}

/** The one sentence under the greeting: the most useful next step. */
export function dashboardHeadline({
  pendingHomework,
  nearestDue,
  continueCourse,
  hasLevel,
}: {
  pendingHomework: number;
  nearestDue: DueDateInfo | null;
  continueCourse: CourseProgress | null;
  hasLevel: boolean;
}) {
  if (pendingHomework > 0) {
    const count = `${pendingHomework.toLocaleString("fa-IR")} تکلیف در انتظار ارسال داری`;
    return nearestDue ? `${count}؛ فوری‌ترین: ${nearestDue.text}.` : `${count}.`;
  }
  if (continueCourse) {
    const percent = Math.round(coursePercent(continueCourse)).toLocaleString("fa-IR");
    return `در «${continueCourse.course_title}» ${percent}٪ جلو رفته‌ای؛ همین امروز ادامه بده.`;
  }
  if (!hasLevel) return "با آزمون تعیین سطح، مسیر یادگیری مناسب خودت را پیدا کن.";
  return "یک دوره انتخاب کن و مسیر یادگیری‌ات را شروع کن.";
}

/** "نوید" from "نوید طاهری"; the whole name when it has one word. */
export function firstName(fullName: string | null | undefined) {
  return fullName?.trim().split(/\s+/)[0] || null;
}
