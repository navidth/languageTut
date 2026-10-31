import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildExamSubmission,
  buildPage,
  buildPracticeTest,
} from "@/test/fixtures";
import { renderWithStore, testStudent } from "@/test/renderWithStore";
import StudentResourcePage from "@/components/dashboard/student/StudentResourcePage";

const studentMocks = vi.hoisted(() => ({
  tests: vi.fn(),
  levels: vi.fn(),
  mySubmissions: vi.fn(),
}));

vi.mock("@/lib/services/studentApi", () => ({ studentApi: studentMocks }));

describe("StudentResourcePage exam results", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    studentMocks.tests.mockResolvedValue(
      buildPage([
        buildPracticeTest({ id: 51 }),
        buildPracticeTest({ id: 60, title: "PT Reading Practice 1" }),
      ]),
    );
    studentMocks.levels.mockResolvedValue(
      buildPage([{ id: 1, code: "A1", title: "Beginner", order: 1 }]),
    );
    studentMocks.mySubmissions.mockResolvedValue([
      buildExamSubmission({ practice_test: 51 }),
      buildExamSubmission({ id: 91, practice_test: 60, submitted_at: null }),
    ]);
  });

  it("offers the result of an exam the student has completed", async () => {
    renderWithStore(<StudentResourcePage kind="tests" />, { user: testStudent });

    expect(
      await screen.findByRole("link", { name: "مشاهده نتیجه" }),
    ).toHaveAttribute("href", "/student/tests/51/result");
    expect(screen.getAllByRole("link", { name: "ورود به آزمون" })).toHaveLength(2);
    expect(studentMocks.mySubmissions).toHaveBeenCalledOnce();
  });

  it("does not request exam results for anonymous visitors", async () => {
    renderWithStore(<StudentResourcePage kind="tests" />);

    await screen.findByRole("heading", { name: "PT Reading Practice 1" });
    expect(studentMocks.mySubmissions).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("link", { name: "مشاهده نتیجه" }),
    ).not.toBeInTheDocument();
  });

  it("does not request exam results on other resource pages", async () => {
    renderWithStore(<StudentResourcePage kind="levels" />, { user: testStudent });

    await screen.findByRole("heading", { name: "Beginner" });
    await waitFor(() => expect(studentMocks.levels).toHaveBeenCalledOnce());
    expect(studentMocks.mySubmissions).not.toHaveBeenCalled();
  });
});
