import { describe, expect, it } from "vitest";
import {
  buildAnswer,
  buildExamSubmission,
  buildPracticeTest,
} from "@/test/fixtures";
import {
  collectTestQuestions,
  completedSubmissionsForTest,
  formatAttemptDuration,
  formatRecommendedLevel,
  latestCompletedSubmissionsByTest,
  resolveAnswerOutcome,
  summarizeExamResult,
} from "./examPresentation";

describe("resolveAnswerOutcome", () => {
  it("separates graded, pending and missing answers", () => {
    expect(resolveAnswerOutcome(buildAnswer({ question: 1 }))).toBe("correct");
    expect(
      resolveAnswerOutcome(buildAnswer({ question: 1, is_correct: false })),
    ).toBe("incorrect");
    expect(
      resolveAnswerOutcome(buildAnswer({ question: 1, is_correct: null })),
    ).toBe("pending");
    expect(
      resolveAnswerOutcome(buildAnswer({ question: 1, answer_text: "  " })),
    ).toBe("unanswered");
    expect(resolveAnswerOutcome(undefined)).toBe("unanswered");
  });
});

describe("summarizeExamResult", () => {
  const submission = buildExamSubmission({
    answers: [
      buildAnswer({ question: 1 }),
      buildAnswer({ question: 2, is_correct: false, score: "0.00" }),
      buildAnswer({ question: 3, is_correct: null, score: "0.00" }),
    ],
  });

  it("counts every outcome against the full question list", () => {
    const questions = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

    expect(summarizeExamResult(submission, questions)).toEqual({
      totalQuestions: 4,
      answered: 3,
      correct: 1,
      incorrect: 1,
      pending: 1,
      unanswered: 1,
      totalScore: 2,
      maxScore: 8,
      percentage: 25,
      isFullyGraded: false,
    });
  });

  it("falls back to the recorded answers when questions are unavailable", () => {
    expect(summarizeExamResult(submission, [])).toMatchObject({
      totalQuestions: 3,
      unanswered: 0,
    });
  });

  it("derives the percentage when the API does not report one", () => {
    const summary = summarizeExamResult(
      buildExamSubmission({
        total_score: "6.00",
        max_score: "8.00",
        percentage: "",
      }),
      [],
    );

    expect(summary.percentage).toBe(75);
    expect(summary.isFullyGraded).toBe(true);
  });
});

describe("exam history helpers", () => {
  const older = buildExamSubmission({
    id: 1,
    submitted_at: "2026-09-01T08:00:00Z",
  });
  const newer = buildExamSubmission({
    id: 2,
    submitted_at: "2026-09-10T08:00:00Z",
  });
  const unfinished = buildExamSubmission({ id: 3, submitted_at: null });
  const otherTest = buildExamSubmission({ id: 4, practice_test: 60 });
  const all = [older, unfinished, newer, otherTest];

  it("lists the finished attempts at one test, newest first", () => {
    expect(completedSubmissionsForTest(all, 51).map((item) => item.id)).toEqual(
      [2, 1],
    );
  });

  it("keeps the newest finished attempt per test", () => {
    const latest = latestCompletedSubmissionsByTest(all);

    expect(latest[51].id).toBe(2);
    expect(latest[60].id).toBe(4);
    expect(Object.keys(latest)).toHaveLength(2);
  });

  it("does not treat an unfinished attempt as a result", () => {
    expect(latestCompletedSubmissionsByTest([unfinished])).toEqual({});
  });
});

describe("collectTestQuestions", () => {
  const first = { id: 1, question_text: "A", question_type: "essay", options: null, order: 1 };
  const second = { id: 2, question_text: "B", question_type: "essay", options: null, order: 2 };

  it("orders the flat question list", () => {
    const test = buildPracticeTest({ questions: [second, first] });

    expect(collectTestQuestions(test).map((item) => item.id)).toEqual([1, 2]);
  });

  it("falls back to the questions nested in sections", () => {
    const test = buildPracticeTest({
      questions: [],
      sections: [
        { id: 5, practice_test: 51, questions: [second] },
        { id: 6, practice_test: 51, questions: [first, second] },
      ],
    });

    expect(collectTestQuestions(test).map((item) => item.id)).toEqual([1, 2]);
  });

  it("handles a missing test", () => {
    expect(collectTestQuestions(null)).toEqual([]);
  });
});

describe("result formatting", () => {
  it("formats a recommended level from either API shape", () => {
    expect(
      formatRecommendedLevel({ id: 2, code: "B1", title: "Intermediate", order: 3 }),
    ).toBe("B1 · Intermediate");
    expect(
      formatRecommendedLevel({ id: 2, code: "B1", title: "B1", order: 3 }),
    ).toBe("B1");
    expect(formatRecommendedLevel("A2")).toBe("A2");
    expect(formatRecommendedLevel(null)).toBeNull();
  });

  it("describes how long an attempt took", () => {
    expect(
      formatAttemptDuration("2026-09-10T08:00:00Z", "2026-09-10T08:12:00Z"),
    ).toBe("۱۲ دقیقه");
    expect(
      formatAttemptDuration("2026-09-10T08:00:00Z", "2026-09-10T08:00:20Z"),
    ).toBe("کمتر از یک دقیقه");
    expect(formatAttemptDuration("2026-09-10T08:00:00Z", null)).toBeNull();
  });
});
