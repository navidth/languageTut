import { describe, expect, it } from "vitest";
import { buildHomework, buildSubmissionSummary } from "@/test/fixtures";
import {
  canDeleteHomeworkSubmission,
  canSubmitHomework,
  describeDueDate,
  parseHomeworkSearchParams,
  resolveHomeworkStatus,
} from "./homeworkPresentation";

describe("resolveHomeworkStatus", () => {
  it.each([
    ["open", {}],
    ["not-started", { has_started: false, starts_at: "2026-12-01T08:00:00Z" }],
    ["late-open", { is_past_due: true, allow_late_submissions: true }],
    ["closed", { is_past_due: true, allow_late_submissions: false }],
    ["unpublished", { is_published: false }],
    ["submitted", { my_submission: buildSubmissionSummary() }],
    [
      "submitted-late",
      { my_submission: buildSubmissionSummary({ is_late: true }) },
    ],
    [
      "graded",
      {
        my_submission: buildSubmissionSummary({
          status: "graded",
          score: "18.00",
        }),
      },
    ],
  ] as const)("maps the backend fields to %s", (expected, overrides) => {
    expect(resolveHomeworkStatus(buildHomework(overrides))).toBe(expected);
  });

  it("keeps reporting an existing submission after the deadline closes", () => {
    const homework = buildHomework({
      is_past_due: true,
      allow_late_submissions: false,
      my_submission: buildSubmissionSummary(),
    });

    expect(resolveHomeworkStatus(homework)).toBe("submitted");
  });
});

describe("homework submission permissions", () => {
  it("follows the server is_open flag, including a start time still ahead", () => {
    expect(canSubmitHomework(buildHomework({ has_started: false }))).toBe(false);
    // The server has the final say even when the other flags look open.
    expect(canSubmitHomework(buildHomework({ is_open: false }))).toBe(false);
    expect(canSubmitHomework(buildHomework({ is_open: true }))).toBe(true);
  });


  it("allows a first upload and a replacement while the window is open", () => {
    expect(canSubmitHomework(buildHomework())).toBe(true);
    expect(
      canSubmitHomework(
        buildHomework({ my_submission: buildSubmissionSummary() }),
      ),
    ).toBe(true);
  });

  it("accepts late uploads only when the homework allows them", () => {
    expect(
      canSubmitHomework(
        buildHomework({ is_past_due: true, allow_late_submissions: true }),
      ),
    ).toBe(true);
    expect(
      canSubmitHomework(
        buildHomework({ is_past_due: true, allow_late_submissions: false }),
      ),
    ).toBe(false);
  });

  it("locks a graded submission against replacement and deletion", () => {
    const graded = buildHomework({
      my_submission: buildSubmissionSummary({ status: "graded" }),
    });

    expect(canSubmitHomework(graded)).toBe(false);
    expect(canDeleteHomeworkSubmission(graded)).toBe(false);
  });

  it("only offers deletion when an ungraded submission exists", () => {
    expect(canDeleteHomeworkSubmission(buildHomework())).toBe(false);
    expect(
      canDeleteHomeworkSubmission(
        buildHomework({ my_submission: buildSubmissionSummary() }),
      ),
    ).toBe(true);
  });
});

describe("describeDueDate", () => {
  const now = Date.parse("2026-09-10T06:00:00Z");

  it("counts the days left before a distant deadline", () => {
    expect(describeDueDate("2026-09-15T06:00:00Z", now)).toEqual({
      text: "۵ روز تا پایان مهلت",
      tone: "neutral",
    });
  });

  it("warns when the deadline is less than two days away", () => {
    expect(describeDueDate("2026-09-10T11:00:00Z", now)).toEqual({
      text: "۵ ساعت تا پایان مهلت",
      tone: "warning",
    });
  });

  it("reports how long ago the deadline passed", () => {
    expect(describeDueDate("2026-09-08T06:00:00Z", now)).toEqual({
      text: "۲ روز از مهلت گذشته است",
      tone: "danger",
    });
  });

  it("returns nothing without a deadline or a reference time", () => {
    expect(describeDueDate(null, now)).toBeNull();
    expect(describeDueDate("2026-09-15T06:00:00Z", null)).toBeNull();
    expect(describeDueDate("not-a-date", now)).toBeNull();
  });
});

describe("parseHomeworkSearchParams", () => {
  it("reads valid filters from the query string", () => {
    expect(
      parseHomeworkSearchParams({ page: "2", course: "15", scope: "lesson" }),
    ).toEqual({ page: 2, course: 15, scope: "lesson" });
  });

  it("ignores values the API would reject", () => {
    expect(
      parseHomeworkSearchParams({ page: "x", course: "-3", scope: "all" }),
    ).toEqual({ page: 1, course: undefined, scope: undefined });
  });

  it("uses the first value of a repeated parameter", () => {
    expect(parseHomeworkSearchParams({ course: ["19", "21"] }).course).toBe(19);
  });
});
