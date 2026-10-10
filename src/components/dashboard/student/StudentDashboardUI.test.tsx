import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildPage } from "@/test/fixtures";
import { renderWithStore, testStudent } from "@/test/renderWithStore";
import StudentDashboardUI from "./StudentDashboardUI";

const studentMocks = vi.hoisted(() => ({
  progress: vi.fn(),
  enrollments: vi.fn(),
}));

vi.mock("@/lib/studentApi", () => ({ studentApi: studentMocks }));

const enrollment = {
  id: 1,
  course: 15,
  course_title: "PT IELTS Course 1",
  source: "purchase",
  created_at: "2026-09-01T00:00:00Z",
};

describe("StudentDashboardUI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    const stats = screen.getByText("کورس‌های ثبت‌نام‌شده").closest("[aria-busy]");
    expect(stats).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent(
      "در حال دریافت اطلاعات داشبورد...",
    );
    // No visible loading banner is inserted above the cards.
    expect(
      screen.queryByText("در حال دریافت اطلاعات داشبورد...", { selector: ":not(.sr-only)" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("۰")).not.toBeInTheDocument();

    finish();

    await waitFor(() => expect(stats).toHaveAttribute("aria-busy", "false"));
    expect(screen.getByText("۱")).toBeInTheDocument();
    expect(screen.getByText("۲")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("offers a retry when the overview fails", async () => {
    studentMocks.progress.mockRejectedValue(new Error("network"));
    studentMocks.enrollments.mockResolvedValue(buildPage([]));
    renderWithStore(<StudentDashboardUI />, { user: testStudent });

    expect(await screen.findByRole("button", { name: "تلاش دوباره" })).toBeInTheDocument();
    expect(
      screen.getByText("کورس‌های ثبت‌نام‌شده").closest("[aria-busy]"),
    ).toHaveAttribute("aria-busy", "false");
  });
});
