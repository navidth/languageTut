import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/services/apiErrors";
import {
  buildHomework,
  buildSubmissionSummary,
  buildPage,
} from "@/test/fixtures";
import { renderWithStore, testStudent } from "@/test/renderWithStore";
import HomeworkListPage from "./HomeworkListPage";

const homeworkMocks = vi.hoisted(() => ({ list: vi.fn() }));
const studentMocks = vi.hoisted(() => ({
  progress: vi.fn(),
  enrollments: vi.fn(),
}));

vi.mock("@/lib/services/homeworkApi", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/services/homeworkApi")>()),
  homeworkApi: homeworkMocks,
}));
vi.mock("@/lib/services/studentApi", () => ({ studentApi: studentMocks }));

const gradedHomework = buildHomework({
  id: 2,
  lesson: 149,
  lesson_title: "PT Listening Lesson 1",
  scope: "lesson",
  title: "Written exercise",
  my_submission: buildSubmissionSummary({
    id: 12,
    homework: 2,
    status: "graded",
    score: "18.00",
    percentage: "90.00",
  }),
});

describe("HomeworkListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    homeworkMocks.list.mockResolvedValue(
      buildPage([buildHomework(), gradedHomework]),
    );
    studentMocks.progress.mockResolvedValue({ courses: [], lessons: [] });
    studentMocks.enrollments.mockResolvedValue(
      buildPage([
        {
          id: 1,
          course: 15,
          course_title: "PT IELTS Course 1",
          source: "purchase",
          created_at: "2026-09-01T00:00:00Z",
        },
      ]),
    );
  });

  it("lists homework with its status, course and grade", async () => {
    renderWithStore(<HomeworkListPage />, { user: testStudent });

    expect(
      await screen.findByRole("heading", { name: "Final assignment" }),
    ).toBeInTheDocument();
    expect(screen.getByText("در انتظار ارسال")).toBeInTheDocument();
    expect(screen.getByText("نمره‌دهی شده")).toBeInTheDocument();
    expect(screen.getByText("۱۸ از ۲۰")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "مشاهده و ارسال پاسخ" }),
    ).toHaveAttribute("href", "/student/homework/1");
    expect(
      screen.getByRole("link", { name: "مشاهده نمره و بازخورد" }),
    ).toHaveAttribute("href", "/student/homework/2");
    // The course name comes from the homework itself.
    expect(
      await screen.findByText("General English A1 · PT Listening Lesson 1"),
    ).toBeInTheDocument();
    expect(homeworkMocks.list).toHaveBeenCalledOnce();
    expect(homeworkMocks.list).toHaveBeenCalledWith({
      page: 1,
      course: undefined,
      scope: undefined,
    });
  });

  it("starts from the filters in the page URL", async () => {
    renderWithStore(
      <HomeworkListPage initialPage={2} initialCourse={15} initialScope="lesson" />,
      { user: testStudent },
    );

    await screen.findByRole("heading", { name: "Final assignment" });
    expect(homeworkMocks.list).toHaveBeenCalledWith({
      page: 2,
      course: 15,
      scope: "lesson",
    });
    expect(screen.getByLabelText("نوع تکلیف")).toHaveValue("lesson");
    expect(screen.getByLabelText("دوره")).toHaveValue("15");
  });

  it("filters on the server and returns to the first page", async () => {
    const user = userEvent.setup();
    renderWithStore(<HomeworkListPage initialPage={2} />, { user: testStudent });
    await screen.findByRole("heading", { name: "Final assignment" });

    await user.selectOptions(screen.getByLabelText("نوع تکلیف"), "lesson");
    await waitFor(() =>
      expect(homeworkMocks.list).toHaveBeenLastCalledWith({
        page: 1,
        course: undefined,
        scope: "lesson",
      }),
    );

    await screen.findByRole("option", { name: "PT IELTS Course 1" });
    await user.selectOptions(screen.getByLabelText("دوره"), "15");
    await waitFor(() =>
      expect(homeworkMocks.list).toHaveBeenLastCalledWith({
        page: 1,
        course: 15,
        scope: "lesson",
      }),
    );

    await user.click(screen.getByRole("button", { name: "حذف فیلترها" }));
    await waitFor(() =>
      expect(homeworkMocks.list).toHaveBeenLastCalledWith({
        page: 1,
        course: undefined,
        scope: undefined,
      }),
    );
    expect(homeworkMocks.list).toHaveBeenCalledTimes(4);
  });

  it("requests the next page from the pagination controls", async () => {
    const user = userEvent.setup();
    homeworkMocks.list.mockResolvedValue(
      buildPage([buildHomework()], {
        count: 12,
        next: "http://api.test/api/homework/?page=2",
      }),
    );
    renderWithStore(<HomeworkListPage />, { user: testStudent });

    await user.click(await screen.findByRole("button", { name: "صفحه بعد" }));

    await waitFor(() =>
      expect(homeworkMocks.list).toHaveBeenLastCalledWith({
        page: 2,
        course: undefined,
        scope: undefined,
      }),
    );
  });

  it("shows skeletons while the first page is loading", () => {
    homeworkMocks.list.mockReturnValue(new Promise(() => undefined));
    renderWithStore(<HomeworkListPage />, { user: testStudent });

    expect(screen.getByText("در حال دریافت تکالیف...")).toBeInTheDocument();
  });

  it("shows an empty state, and a different one when filters hide everything", async () => {
    const user = userEvent.setup();
    homeworkMocks.list.mockResolvedValue(buildPage([]));
    renderWithStore(<HomeworkListPage />, { user: testStudent });

    expect(
      await screen.findByText("در حال حاضر تکلیفی برای شما ثبت نشده است."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "حذف فیلترها" })).toBeDisabled();

    await user.selectOptions(screen.getByLabelText("نوع تکلیف"), "course");

    expect(
      await screen.findByText("با این فیلترها تکلیفی پیدا نشد."),
    ).toBeInTheDocument();
  });

  it("shows the API error and retries on demand", async () => {
    const user = userEvent.setup();
    homeworkMocks.list.mockRejectedValueOnce(
      new ApiError({
        message: "خطایی در سرور رخ داد.",
        kind: "server",
        status: 500,
      }),
    );
    renderWithStore(<HomeworkListPage />, { user: testStudent });

    expect(await screen.findByText("خطایی در سرور رخ داد.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "تلاش دوباره" }));

    expect(
      await screen.findByRole("heading", { name: "Final assignment" }),
    ).toBeInTheDocument();
    expect(homeworkMocks.list).toHaveBeenCalledTimes(2);
  });

  it("lets anonymous visitors browse without requesting private data", async () => {
    renderWithStore(<HomeworkListPage />);

    expect(
      await screen.findByRole("heading", { name: "Final assignment" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "برای مشاهده وضعیت ارسال و نمره‌های خود، وارد حساب کاربری شوید.",
      ),
    ).toBeInTheDocument();
    expect(studentMocks.progress).not.toHaveBeenCalled();
    expect(studentMocks.enrollments).not.toHaveBeenCalled();
  });
});
