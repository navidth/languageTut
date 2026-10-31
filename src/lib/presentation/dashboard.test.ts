import { describe, expect, it } from "vitest";
import {
  dashboardHeadline,
  firstName,
  percentTone,
  scoreTone,
  summarizeExams,
  summarizeHomework,
  summarizeLearning,
} from "@/lib/presentation/dashboard";
import { buildExamSubmission, buildHomework, buildPage, buildSubmissionSummary } from "@/test/fixtures";
import type { CourseProgress } from "@/types/student";

function course(id: number, completed: number, total: number, updatedAt: string): CourseProgress {
  return {
    id,
    course: id * 10,
    course_title: `Course ${id}`,
    level: "A2",
    completed_lessons: completed,
    total_lessons: total,
    progress_percent: ((completed / total) * 100).toFixed(2),
    updated_at: updatedAt,
  };
}

describe("dashboard summaries", () => {
  it("picks the most recently active unfinished course to continue", () => {
    const summary = summarizeLearning({
      courses: [
        course(1, 2, 10, "2026-10-01T00:00:00Z"),
        course(2, 5, 5, "2026-10-20T00:00:00Z"),
        course(3, 1, 5, "2026-10-10T00:00:00Z"),
      ],
      lessons: [
        { id: 1, lesson: 1, lesson_title: "a", status: "completed", completed_at: null },
        { id: 2, lesson: 2, lesson_title: "b", status: "in_progress", completed_at: null },
      ],
    });

    expect(summary.courses.map((item) => item.id)).toEqual([2, 3, 1]);
    // Course 2 is finished, so the next most recent one is continued.
    expect(summary.continueCourse?.id).toBe(3);
    expect(summary.completedLessons).toBe(1);
    expect(summary.totalLessons).toBe(20);
    expect(summary.overallPercent).toBe(40);
  });

  it("has no overall percentage without lessons", () => {
    const summary = summarizeLearning({ courses: [], lessons: [] });

    expect(summary.overallPercent).toBeNull();
    expect(summary.continueCourse).toBeNull();
  });

  it("averages the latest graded score of each test", () => {
    const summary = summarizeExams([
      buildExamSubmission({ id: 1, practice_test: 5, percentage: "40.00", submitted_at: "2026-10-01T00:00:00Z" }),
      buildExamSubmission({ id: 2, practice_test: 5, percentage: "80.00", submitted_at: "2026-10-05T00:00:00Z" }),
      buildExamSubmission({ id: 3, practice_test: 6, percentage: "60.00", submitted_at: "2026-10-03T00:00:00Z" }),
      buildExamSubmission({ id: 4, practice_test: 7, percentage: "10.00", submitted_at: "2026-10-04T00:00:00Z", grading_status: "pending" }),
      buildExamSubmission({ id: 5, practice_test: 8, submitted_at: null }),
    ]);

    expect(summary.taken).toBe(3);
    expect(summary.averagePercent).toBe(70);
    expect(summary.recent.map((item) => item.id)).toEqual([2, 4, 3]);
  });

  it("colours a score by the test's pass mark, else by its percentage", () => {
    expect(scoreTone({ percentage: "45.00", passed: true })).toBe("success");
    expect(scoreTone({ percentage: "95.00", passed: false })).toBe("danger");
    expect(scoreTone({ percentage: "95.00", grading_status: "pending" })).toBe("warning");
    expect(scoreTone({ percentage: "85.00" })).toBe("success");
    expect(percentTone(60)).toBe("accent");
    expect(percentTone(20)).toBe("danger");
  });

  it("lists homework that can still be sent, nearest deadline first", () => {
    const summary = summarizeHomework(buildPage([
      buildHomework({ id: 1, due_at: "2026-11-10T00:00:00Z" }),
      buildHomework({ id: 2, due_at: "2026-11-02T00:00:00Z" }),
      buildHomework({ id: 3, my_submission: buildSubmissionSummary() }),
      buildHomework({ id: 4, has_started: false }),
      buildHomework({ id: 5, due_at: null }),
    ], { next: "http://api.test/api/homework/?page=2" }));

    expect(summary.pending.map((item) => item.id)).toEqual([2, 1, 5]);
    expect(summary.partial).toBe(true);
  });

  it("leads with homework, then the course to continue, then the placement test", () => {
    const continueCourse = course(1, 3, 10, "2026-10-01T00:00:00Z");

    expect(dashboardHeadline({
      pendingHomework: 2,
      nearestDue: { text: "۲ روز تا پایان مهلت", tone: "neutral" },
      continueCourse,
      hasLevel: true,
    })).toBe("۲ تکلیف در انتظار ارسال داری؛ فوری‌ترین: ۲ روز تا پایان مهلت.");
    expect(dashboardHeadline({ pendingHomework: 0, nearestDue: null, continueCourse, hasLevel: true }))
      .toBe("در «Course 1» ۳۰٪ جلو رفته‌ای؛ همین امروز ادامه بده.");
    expect(dashboardHeadline({ pendingHomework: 0, nearestDue: null, continueCourse: null, hasLevel: false }))
      .toContain("آزمون تعیین سطح");
  });

  it("greets by the first name", () => {
    expect(firstName("  نوید طاهری ")).toBe("نوید");
    expect(firstName("")).toBeNull();
  });
});
