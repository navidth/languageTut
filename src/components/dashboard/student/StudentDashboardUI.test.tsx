import { screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildExamSubmission, buildHomework, buildPage } from "@/test/fixtures";
import { renderWithStore, testStudent } from "@/test/renderWithStore";
import StudentDashboardUI from "./StudentDashboardUI";

const studentMocks = vi.hoisted(() => ({
  progress: vi.fn(),
  enrollments: vi.fn(),
  mySubmissions: vi.fn(),
}));
const homeworkMocks = vi.hoisted(() => ({ list: vi.fn() }));

vi.mock("@/lib/services/studentApi", () => ({ studentApi: studentMocks }));
vi.mock("@/lib/services/homeworkApi", () => ({ homeworkApi: homeworkMocks }));
vi.mock("@/components/auth/AuthFlowProvider", () => ({
  useAuthFlow: () => ({ startAuthFlow: vi.fn(), busy: false }),
}));

const enrollment = {
  id: 1,
  course: 15,
  course_title: "PT IELTS Course 1",
  source: "purchase",
  created_at: "2026-09-01T00:00:00Z",
};

function courseProgress(id: number, completed: number, updatedAt: string) {
  return {
    id,
    course: id,
    course_title: `دوره ${id}`,
    level: "A2",
    completed_lessons: completed,
    total_lessons: 10,
    progress_percent: `${completed * 10}.00`,
    updated_at: updatedAt,
  };
}

function statsGrid() {
  return screen.getByText("کورس‌های ثبت‌نام‌شده").closest("[aria-busy]") as HTMLElement;
}

describe("StudentDashboardUI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    studentMocks.progress.mockResolvedValue({ courses: [], lessons: [] });
    studentMocks.enrollments.mockResolvedValue(buildPage([]));
    studentMocks.mySubmissions.mockResolvedValue([]);
    homeworkMocks.list.mockResolvedValue(buildPage([]));
  });

  it("holds the place of the numbers while the overview loads", async () => {
    let finish!: () => void;
    studentMocks.progress.mockReturnValue(
      new Promise((resolve) => {
        finish = () =>
          resolve({
            courses: [],
            lessons: [
              { id: 1, status: "completed" },
              { id: 2, status: "completed" },
              { id: 3, status: "in_progress" },
            ],
          });
      }),
    );
    studentMocks.enrollments.mockResolvedValue(buildPage([enrollment]));
    renderWithStore(<StudentDashboardUI />, { user: testStudent });

    expect(statsGrid()).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent("در حال دریافت اطلاعات داشبورد...");
    // No visible loading banner is inserted above the cards.
    expect(
      screen.queryByText("در حال دریافت اطلاعات داشبورد...", { selector: ":not(.sr-only)" }),
    ).not.toBeInTheDocument();
    expect(within(statsGrid()).queryByText("۰")).not.toBeInTheDocument();

    finish();

    await waitFor(() => expect(statsGrid()).toHaveAttribute("aria-busy", "false"));
    expect(within(statsGrid()).getByText("۱")).toBeInTheDocument();
    expect(within(statsGrid()).getByText("۲")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("offers a retry when the overview fails", async () => {
    studentMocks.progress.mockRejectedValue(new Error("network"));
    renderWithStore(<StudentDashboardUI />, { user: testStudent });

    expect(await screen.findByRole("button", { name: "تلاش دوباره" })).toBeInTheDocument();
    expect(statsGrid()).toHaveAttribute("aria-busy", "false");
  });

  it("leads to the course to continue, the homework due and the latest scores", async () => {
    studentMocks.progress.mockResolvedValue({
      courses: [
        courseProgress(15, 10, "2026-10-20T00:00:00Z"),
        courseProgress(16, 3, "2026-10-18T00:00:00Z"),
        courseProgress(17, 6, "2026-10-01T00:00:00Z"),
      ],
      lessons: [],
    });
    studentMocks.mySubmissions.mockResolvedValue([
      buildExamSubmission({ id: 1, practice_test: 51, practice_test_title: "Listening 1", percentage: "90.00" }),
      buildExamSubmission({ id: 2, practice_test: 52, practice_test_title: "Reading 1", percentage: "50.00", submitted_at: "2026-09-11T08:00:00Z" }),
    ]);
    homeworkMocks.list.mockResolvedValue(buildPage([
      buildHomework({ id: 7, title: "Essay", due_at: "2099-01-01T00:00:00Z" }),
      buildHomework({ id: 8, title: "Done", my_submission: null, is_published: false }),
    ]));
    renderWithStore(<StudentDashboardUI />, { user: testStudent });

    // Course 15 is finished, so the most recent unfinished one is offered.
    const continueLink = await screen.findByRole("link", { name: /ادامه یادگیری/ });
    expect(continueLink).toHaveAttribute("href", "/student/all-courses/16");
    expect(screen.getByRole("link", { name: /ادامه دوره/ })).toHaveAttribute("href", "/student/all-courses/16");
    expect(screen.getByText(/۱ تکلیف در انتظار ارسال داری/)).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: /Essay/ })).toHaveAttribute("href", "/student/homework/7");
    expect(within(statsGrid()).getByText("۷۰٪")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Reading 1/ })).toHaveAttribute("href", "/student/tests/52/result");
  });

  it("offers the placement test while the level is unknown", async () => {
    renderWithStore(<StudentDashboardUI />, { user: { ...testStudent, current_level: null } });

    expect(await screen.findByText("سطحت هنوز مشخص نشده است")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /شروع آزمون تعیین سطح/ })).toHaveAttribute("href", "/student/placement-test");
  });

  it("marks the student's level on the CEFR path", async () => {
    renderWithStore(<StudentDashboardUI />, { user: testStudent });

    const path = await screen.findByRole("list", { name: "مسیر سطح‌های زبان" });
    expect(within(path).getByText("A2").closest("li")).toHaveAttribute("aria-current", "step");
  });

  it("asks a visitor without a session to sign in and sends no requests", () => {
    renderWithStore(<StudentDashboardUI />);

    expect(screen.getByRole("button", { name: "ورود به حساب کاربری" })).toBeInTheDocument();
    expect(studentMocks.progress).not.toHaveBeenCalled();
    expect(homeworkMocks.list).not.toHaveBeenCalled();
  });
});
