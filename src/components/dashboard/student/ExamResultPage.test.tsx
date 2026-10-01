import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/apiErrors";
import {
  buildAnswer,
  buildExamSubmission,
  buildPage,
  buildPracticeTest,
} from "@/test/fixtures";
import { renderWithStore, testStudent } from "@/test/renderWithStore";
import ExamResultPage from "./ExamResultPage";

const studentMocks = vi.hoisted(() => ({
  mySubmissions: vi.fn(),
  test: vi.fn(),
  progress: vi.fn(),
  enrollments: vi.fn(),
}));
const authFlow = vi.hoisted(() => ({ startAuthFlow: vi.fn() }));

vi.mock("@/lib/studentApi", () => ({ studentApi: studentMocks }));
vi.mock("@/components/auth/AuthFlowProvider", () => ({
  useAuthFlow: () => ({ startAuthFlow: authFlow.startAuthFlow, busy: false }),
}));

const practiceTest = buildPracticeTest({
  questions_count: 4,
  questions: [
    {
      id: 1,
      question_text: "Choose the best answer.",
      question_type: "multiple_choice",
      options: ["Option A", "Option B"],
      points: "2.00",
      order: 1,
    },
    {
      id: 2,
      question_text: "The statement is true.",
      question_type: "true_false",
      options: null,
      points: "2.00",
      order: 2,
    },
    {
      id: 3,
      question_text: "Describe your city.",
      question_type: "essay",
      options: null,
      points: "2.00",
      order: 3,
    },
    {
      id: 4,
      question_text: "Type the word practice.",
      question_type: "short_answer",
      options: null,
      points: "2.00",
      order: 4,
    },
  ],
});

const completedAttempt = buildExamSubmission({
  answers: [
    buildAnswer({ question: 1 }),
    buildAnswer({
      question: 2,
      answer_text: "false",
      is_correct: false,
      score: "0.00",
      feedback: "Review lesson 3.",
    }),
    buildAnswer({
      question: 3,
      answer_text: "My city is large.",
      is_correct: null,
      score: "0.00",
    }),
  ],
});

function renderResult(id = 51, signedIn = true) {
  return renderWithStore(<ExamResultPage id={id} />, {
    user: signedIn ? testStudent : null,
  });
}

/** The count shown next to a label in the summary grid. */
function summaryCount(label: string) {
  const summary = screen.getByLabelText("خلاصه نتیجه");
  return within(summary).getByText(label).nextElementSibling;
}

describe("ExamResultPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    studentMocks.mySubmissions.mockResolvedValue([completedAttempt]);
    studentMocks.test.mockResolvedValue(practiceTest);
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

  it("shows the score summary of a completed exam", async () => {
    renderResult();

    expect(
      await screen.findByRole("heading", { name: "PT Listening Practice 1" }),
    ).toBeInTheDocument();
    expect(screen.getByText("آزمون تمرینی")).toBeInTheDocument();
    expect(
      await screen.findByRole("link", { name: "PT IELTS Course 1" }),
    ).toHaveAttribute("href", "/student/all-courses/15");
    expect(screen.getByText(/سطح PT · شنیداری/)).toBeInTheDocument();
    expect(screen.getByText("در انتظار تصحیح مدرس")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "درصد: ۲۵٪" })).toBeInTheDocument();
    expect(screen.getByText("از ۸")).toBeInTheDocument();
    expect(screen.getByText("تکمیل‌شده")).toBeInTheDocument();
    expect(screen.getByText("۱۲ دقیقه")).toBeInTheDocument();
    expect(summaryCount("پاسخ‌های صحیح")).toHaveTextContent("۱");
    expect(summaryCount("پاسخ‌های اشتباه")).toHaveTextContent("۱");
    expect(summaryCount("بدون پاسخ")).toHaveTextContent("۱");
    expect(summaryCount("در انتظار تصحیح")).toHaveTextContent("۱");
    expect(studentMocks.mySubmissions).toHaveBeenCalledOnce();
    expect(studentMocks.test).toHaveBeenCalledOnce();
    expect(studentMocks.test).toHaveBeenCalledWith(51);
  });

  it("lists every question with the student's answer, outcome and score", async () => {
    renderResult();

    const [first, second, third, fourth] = await screen.findAllByRole("listitem");

    expect(within(first).getByText("Choose the best answer.")).toBeInTheDocument();
    expect(within(first).getByText("پاسخ صحیح")).toBeInTheDocument();
    expect(within(first).getByText("Option A")).toBeInTheDocument();
    expect(within(first).getByText("نمره: ۲ از ۲")).toBeInTheDocument();
    expect(within(first).getByText("مدل: چندگزینه‌ای")).toBeInTheDocument();

    expect(within(second).getByText("پاسخ اشتباه")).toBeInTheDocument();
    expect(within(second).getByText("غلط")).toBeInTheDocument();
    expect(within(second).getByText("نمره: ۰ از ۲")).toBeInTheDocument();
    expect(within(second).getByText("Review lesson 3.")).toBeInTheDocument();

    expect(within(third).getByText("در انتظار تصحیح")).toBeInTheDocument();
    expect(within(third).getByText("My city is large.")).toBeInTheDocument();
    expect(within(third).getByText("نمره: — از ۲")).toBeInTheDocument();

    expect(within(fourth).getByText("بدون پاسخ")).toBeInTheDocument();
    expect(within(fourth).getByText("پاسخی ثبت نشده است.")).toBeInTheDocument();
  });

  it("does not show correct answers the API keeps from students", async () => {
    renderResult();

    await screen.findAllByRole("listitem");
    expect(screen.queryByText("پاسخ درست")).not.toBeInTheDocument();
    expect(screen.queryByText("Option B")).not.toBeInTheDocument();
  });

  it("marks a fully graded result as final", async () => {
    studentMocks.mySubmissions.mockResolvedValue([
      buildExamSubmission({
        total_score: "8.00",
        percentage: "100.00",
        recommended_level: { id: 3, code: "B1", title: "Intermediate", order: 3 },
        answers: practiceTest.questions!.map((question) =>
          buildAnswer({ question: question.id }),
        ),
      }),
    ]);
    renderResult();

    expect(await screen.findByText("نتیجه نهایی")).toBeInTheDocument();
    expect(screen.getByText("B1 · Intermediate")).toBeInTheDocument();
    expect(summaryCount("پاسخ‌های صحیح")).toHaveTextContent("۴");
    expect(
      screen.queryByRole("button", { name: "به‌روزرسانی نتیجه" }),
    ).not.toBeInTheDocument();
  });

  it("refreshes a result that is still waiting for grading", async () => {
    const user = userEvent.setup();
    renderResult();

    await user.click(
      await screen.findByRole("button", { name: "به‌روزرسانی نتیجه" }),
    );

    await waitFor(() =>
      expect(studentMocks.mySubmissions).toHaveBeenCalledTimes(2),
    );
  });

  it("switches between several attempts at the same exam", async () => {
    const user = userEvent.setup();
    studentMocks.mySubmissions.mockResolvedValue([
      buildExamSubmission({
        id: 80,
        submitted_at: "2026-09-01T08:10:00Z",
        percentage: "50.00",
      }),
      completedAttempt,
    ]);
    renderResult();

    expect(
      await screen.findByRole("img", { name: "درصد: ۲۵٪" }),
    ).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("نمایش نتیجه"), "80");

    expect(screen.getByRole("img", { name: "درصد: ۵۰٪" })).toBeInTheDocument();
  });

  it("explains that an unfinished exam has no result yet", async () => {
    studentMocks.mySubmissions.mockResolvedValue([
      buildExamSubmission({ submitted_at: null }),
    ]);
    renderResult();

    expect(
      await screen.findByText(/این آزمون هنوز تکمیل نشده است/),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ادامه آزمون" })).toHaveAttribute(
      "href",
      "/student/tests/51",
    );
  });

  it("explains that the student has not taken the exam", async () => {
    studentMocks.mySubmissions.mockResolvedValue([
      buildExamSubmission({ practice_test: 60 }),
    ]);
    renderResult();

    expect(
      await screen.findByText(/شما هنوز در این آزمون شرکت نکرده‌اید/),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "شروع آزمون" })).toHaveAttribute(
      "href",
      "/student/tests/51",
    );
    expect(screen.getByRole("link", { name: "بازگشت به آزمون‌ها" })).toHaveAttribute(
      "href",
      "/student/tests",
    );
  });

  it("reports an exam that does not exist", async () => {
    studentMocks.mySubmissions.mockResolvedValue([]);
    studentMocks.test.mockRejectedValue(
      new ApiError({ message: "پیدا نشد.", kind: "not-found", status: 404 }),
    );
    renderResult(999);

    expect(
      await screen.findByText("آزمون موردنظر پیدا نشد یا دیگر در دسترس نیست."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "شروع آزمون" })).not.toBeInTheDocument();
  });

  it("still shows a past result when the exam itself is unavailable", async () => {
    studentMocks.test.mockRejectedValue(
      new ApiError({ message: "پیدا نشد.", kind: "not-found", status: 404 }),
    );
    renderResult();

    expect(
      await screen.findByText(/متن سؤال‌های این آزمون در دسترس نیست/),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("My city is large.")).toBeInTheDocument();
  });

  it("blocks a result the student may not see", async () => {
    studentMocks.mySubmissions.mockRejectedValue(
      new ApiError({
        message: "شما اجازه انجام این عملیات را ندارید.",
        kind: "authorization",
        status: 403,
      }),
    );
    renderResult();

    expect(
      await screen.findByText("شما اجازه مشاهده نتیجه این آزمون را ندارید."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "تلاش دوباره" }),
    ).not.toBeInTheDocument();
  });

  it("offers a retry when the result cannot be loaded", async () => {
    const user = userEvent.setup();
    studentMocks.mySubmissions.mockRejectedValueOnce(
      new ApiError({
        message: "خطایی در سرور رخ داد.",
        kind: "server",
        status: 500,
      }),
    );
    renderResult();

    expect(await screen.findByText("خطایی در سرور رخ داد.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "تلاش دوباره" }));

    expect(
      await screen.findByRole("heading", { name: "PT Listening Practice 1" }),
    ).toBeInTheDocument();
    expect(studentMocks.mySubmissions).toHaveBeenCalledTimes(2);
  });

  it("asks an anonymous visitor to sign in without calling the API", async () => {
    const user = userEvent.setup();
    renderResult(51, false);

    expect(
      screen.getByText("برای مشاهده نتیجه آزمون، وارد حساب کاربری خود شوید."),
    ).toBeInTheDocument();
    expect(studentMocks.mySubmissions).not.toHaveBeenCalled();
    expect(studentMocks.test).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "ورود به حساب کاربری" }));
    expect(authFlow.startAuthFlow).toHaveBeenCalledWith("learning");
  });

  it("loads the result while a stored session is still being restored", async () => {
    localStorage.setItem("accessToken", "token");
    renderResult(51, false);

    expect(screen.getByText("در حال دریافت نتیجه آزمون...")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "PT Listening Practice 1" }),
    ).toBeInTheDocument();
  });

  it("rejects an invalid exam id without calling the API", () => {
    renderResult(Number.NaN);

    expect(screen.getByText("شناسه آزمون معتبر نیست.")).toBeInTheDocument();
    expect(studentMocks.mySubmissions).not.toHaveBeenCalled();
  });
});
