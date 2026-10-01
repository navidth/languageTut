import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/apiErrors";
import {
  buildHomework,
  buildHomeworkSubmission,
  buildPage,
} from "@/test/fixtures";
import { renderWithStore, testStudent } from "@/test/renderWithStore";
import HomeworkDetailPage from "./HomeworkDetailPage";

const homeworkMocks = vi.hoisted(() => ({
  get: vi.fn(),
  submit: vi.fn(),
  deleteSubmission: vi.fn(),
  downloadSubmission: vi.fn(),
}));
const studentMocks = vi.hoisted(() => ({
  progress: vi.fn(),
  enrollments: vi.fn(),
}));
const fileMocks = vi.hoisted(() => ({ saveBlob: vi.fn() }));
const authFlow = vi.hoisted(() => ({ startAuthFlow: vi.fn() }));

vi.mock("@/lib/homeworkApi", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/homeworkApi")>()),
  homeworkApi: homeworkMocks,
}));
vi.mock("@/lib/studentApi", () => ({ studentApi: studentMocks }));
vi.mock("@/lib/files", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/files")>()),
  saveBlob: fileMocks.saveBlob,
}));
vi.mock("@/components/auth/AuthFlowProvider", () => ({
  useAuthFlow: () => ({ startAuthFlow: authFlow.startAuthFlow, busy: false }),
}));

const answerFile = new File(["my answer"], "essay.pdf", {
  type: "application/pdf",
});

function renderDetail(id = 1, signedIn = true) {
  return renderWithStore(<HomeworkDetailPage id={id} />, {
    user: signedIn ? testStudent : null,
  });
}

describe("HomeworkDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    homeworkMocks.get.mockResolvedValue(buildHomework());
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

  it("shows the homework details with its course", async () => {
    renderDetail();

    expect(
      await screen.findByRole("heading", { name: "Final assignment" }),
    ).toBeInTheDocument();
    expect(screen.getByText("در انتظار ارسال")).toBeInTheDocument();
    expect(screen.getByText("تکلیف دوره")).toBeInTheDocument();
    expect(
      screen.getByText("Upload a single PDF covering everything in this course."),
    ).toBeInTheDocument();
    expect(screen.getByText("پذیرفته می‌شود")).toBeInTheDocument();
    expect(
      await screen.findByRole("link", { name: "PT IELTS Course 1" }),
    ).toHaveAttribute("href", "/student/all-courses/15");
  });

  it("uploads an answer and reflects it without refetching", async () => {
    const user = userEvent.setup();
    homeworkMocks.submit.mockImplementation(
      async (
        _id: number,
        _data: unknown,
        onProgress?: (percent: number) => void,
      ) => {
        onProgress?.(60);
        return buildHomeworkSubmission({ notes: "My notes" });
      },
    );
    renderDetail();

    await user.upload(await screen.findByLabelText("فایل پاسخ"), answerFile);
    await user.type(screen.getByLabelText("توضیحات (اختیاری)"), "My notes");
    await user.click(screen.getByRole("button", { name: "ارسال تکلیف" }));

    await waitFor(() =>
      expect(homeworkMocks.submit).toHaveBeenCalledWith(
        1,
        { file: answerFile, notes: "My notes" },
        expect.any(Function),
      ),
    );
    expect(
      await screen.findByText("تکلیف شما با موفقیت ارسال شد."),
    ).toBeInTheDocument();
    expect(screen.getByText("ارسال شده")).toBeInTheDocument();
    expect(screen.getByText("essay.pdf")).toBeInTheDocument();
    expect(screen.getByText("My notes")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "جایگزینی فایل ارسال‌شده" }),
    ).toBeInTheDocument();
    expect(homeworkMocks.submit).toHaveBeenCalledOnce();
    expect(homeworkMocks.get).toHaveBeenCalledOnce();
  });

  it("requires a file before submitting", async () => {
    const user = userEvent.setup();
    renderDetail();

    await user.click(await screen.findByRole("button", { name: "ارسال تکلیف" }));

    expect(
      screen.getByText("ابتدا فایل پاسخ خود را انتخاب کنید."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("فایل پاسخ")).toBeInvalid();
    expect(homeworkMocks.submit).not.toHaveBeenCalled();
  });

  it("replaces an existing submission with a new file", async () => {
    const user = userEvent.setup();
    homeworkMocks.get.mockResolvedValue(
      buildHomework({
        my_submission: buildHomeworkSubmission({ notes: "First draft" }),
      }),
    );
    homeworkMocks.submit.mockResolvedValue(
      buildHomeworkSubmission({
        file_name: "essay-v2.pdf",
        notes: "First draft",
        updated_at: "2026-09-11T09:00:00Z",
      }),
    );
    renderDetail();

    await user.click(
      await screen.findByRole("button", { name: "جایگزینی فایل ارسال‌شده" }),
    );
    expect(screen.getByLabelText("توضیحات (اختیاری)")).toHaveValue(
      "First draft",
    );
    await user.upload(screen.getByLabelText("فایل پاسخ"), answerFile);
    await user.click(screen.getByRole("button", { name: "جایگزینی فایل" }));

    expect(
      await screen.findByText("فایل جدید جایگزین ارسال قبلی شد."),
    ).toBeInTheDocument();
    expect(screen.getByText("essay-v2.pdf")).toBeInTheDocument();
    expect(homeworkMocks.submit).toHaveBeenCalledWith(
      1,
      { file: answerFile, notes: "First draft" },
      expect.any(Function),
    );
  });

  it("surfaces a rejected upload and resynchronises the homework", async () => {
    const user = userEvent.setup();
    homeworkMocks.submit.mockRejectedValue(
      new ApiError({
        message: "فایل: نوع این فایل مجاز نیست.",
        kind: "validation",
        status: 400,
        fieldErrors: { file: ["نوع این فایل مجاز نیست."] },
      }),
    );
    renderDetail();

    await user.upload(await screen.findByLabelText("فایل پاسخ"), answerFile);
    await user.click(screen.getByRole("button", { name: "ارسال تکلیف" }));

    expect(
      await screen.findByText("فایل: نوع این فایل مجاز نیست."),
    ).toBeInTheDocument();
    expect(screen.getByText("نوع این فایل مجاز نیست.")).toBeInTheDocument();
    await waitFor(() => expect(homeworkMocks.get).toHaveBeenCalledTimes(2));
    expect(screen.getByRole("button", { name: "ارسال تکلیف" })).toBeEnabled();
  });

  it("warns that an answer after the deadline is recorded as late", async () => {
    homeworkMocks.get.mockResolvedValue(
      buildHomework({ is_past_due: true, allow_late_submissions: true }),
    );
    renderDetail();

    expect(
      await screen.findByText("مهلت گذشته · ارسال با تأخیر"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("مهلت این تکلیف گذشته است؛ پاسخ شما با تأخیر ثبت می‌شود."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("فایل پاسخ")).toBeEnabled();
  });

  it("explains that a closed deadline no longer accepts answers", async () => {
    homeworkMocks.get.mockResolvedValue(
      buildHomework({ is_past_due: true, allow_late_submissions: false }),
    );
    renderDetail();

    expect(await screen.findByText("مهلت به پایان رسیده")).toBeInTheDocument();
    expect(
      screen.getByText(
        "مهلت ارسال این تکلیف به پایان رسیده است و ارسال با تأخیر پذیرفته نمی‌شود.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("فایل پاسخ")).not.toBeInTheDocument();
  });

  it("shows the grade and feedback and locks a graded submission", async () => {
    homeworkMocks.get.mockResolvedValue(
      buildHomework({
        my_submission: buildHomeworkSubmission({
          status: "graded",
          score: "18.00",
          percentage: "90.00",
          feedback: "Well structured essay.",
          graded_by: 3,
          graded_by_name: "Ms. Karimi",
          graded_at: "2026-09-11T10:00:00Z",
        }),
      }),
    );
    renderDetail();

    expect(await screen.findByText("نمره‌دهی شده")).toBeInTheDocument();
    expect(screen.getByText("۱۸")).toBeInTheDocument();
    expect(screen.getByText("۹۰٪")).toBeInTheDocument();
    expect(screen.getByText("Well structured essay.")).toBeInTheDocument();
    expect(screen.getByText(/نمره‌دهی توسط Ms\. Karimi/)).toBeInTheDocument();
    expect(screen.queryByLabelText("فایل پاسخ")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /جایگزینی/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /حذف پاسخ/ }),
    ).not.toBeInTheDocument();
  });

  it("deletes an ungraded submission only after confirmation", async () => {
    const user = userEvent.setup();
    homeworkMocks.get.mockResolvedValue(
      buildHomework({ my_submission: buildHomeworkSubmission() }),
    );
    homeworkMocks.deleteSubmission.mockResolvedValue(undefined);
    renderDetail();

    await user.click(
      await screen.findByRole("button", { name: "حذف پاسخ ارسال‌شده" }),
    );
    expect(homeworkMocks.deleteSubmission).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "بله، حذف شود" }));

    await waitFor(() =>
      expect(homeworkMocks.deleteSubmission).toHaveBeenCalledWith(9),
    );
    expect(await screen.findByText("پاسخ ارسال‌شده حذف شد.")).toBeInTheDocument();
    expect(screen.getByText("در انتظار ارسال")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ارسال تکلیف" })).toBeInTheDocument();
    expect(homeworkMocks.get).toHaveBeenCalledOnce();
  });

  it("downloads the submitted file through the API client", async () => {
    const user = userEvent.setup();
    const blob = new Blob(["my answer"]);
    homeworkMocks.get.mockResolvedValue(
      buildHomework({ my_submission: buildHomeworkSubmission() }),
    );
    homeworkMocks.downloadSubmission.mockResolvedValue({ blob, fileName: null });
    renderDetail();

    await user.click(await screen.findByRole("button", { name: "دانلود فایل" }));

    await waitFor(() =>
      expect(fileMocks.saveBlob).toHaveBeenCalledWith(blob, "essay.pdf"),
    );
    expect(homeworkMocks.downloadSubmission).toHaveBeenCalledWith(9);
  });

  it("asks an anonymous visitor to sign in before submitting", async () => {
    const user = userEvent.setup();
    renderDetail(1, false);

    expect(
      await screen.findByText(
        "برای ارسال پاسخ و مشاهده نمره، وارد حساب کاربری خود شوید.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("فایل پاسخ")).not.toBeInTheDocument();
    expect(studentMocks.progress).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "ورود به حساب کاربری" }));
    expect(authFlow.startAuthFlow).toHaveBeenCalledWith("learning");
  });

  it("reports a homework that does not exist", async () => {
    homeworkMocks.get.mockRejectedValue(
      new ApiError({
        message: "اطلاعات یا صفحه درخواستی پیدا نشد.",
        kind: "not-found",
        status: 404,
      }),
    );
    renderDetail(404);

    expect(
      await screen.findByText("تکلیف موردنظر پیدا نشد یا دیگر در دسترس نیست."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "تلاش دوباره" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "بازگشت به تکالیف" }),
    ).toHaveAttribute("href", "/student/homework");
  });

  it("explains a homework the student may not open", async () => {
    homeworkMocks.get.mockRejectedValue(
      new ApiError({
        message: "شما اجازه انجام این عملیات را ندارید.",
        kind: "authorization",
        status: 403,
      }),
    );
    renderDetail();

    expect(
      await screen.findByText("شما اجازه مشاهده این تکلیف را ندارید."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "تلاش دوباره" }),
    ).not.toBeInTheDocument();
  });

  it("offers a retry when loading fails", async () => {
    const user = userEvent.setup();
    homeworkMocks.get.mockRejectedValueOnce(
      new ApiError({
        message: "خطایی در سرور رخ داد.",
        kind: "server",
        status: 500,
      }),
    );
    renderDetail();

    expect(await screen.findByText("خطایی در سرور رخ داد.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "تلاش دوباره" }));

    expect(
      await screen.findByRole("heading", { name: "Final assignment" }),
    ).toBeInTheDocument();
    expect(homeworkMocks.get).toHaveBeenCalledTimes(2);
  });

  it("rejects an invalid homework id without calling the API", () => {
    renderDetail(Number.NaN);

    expect(screen.getByText("شناسه تکلیف معتبر نیست.")).toBeInTheDocument();
    expect(homeworkMocks.get).not.toHaveBeenCalled();
  });
});
