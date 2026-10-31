import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithStore } from "@/test/renderWithStore";
import TestDetailPage from "@/components/dashboard/student/TestDetailPage";

const mocks = vi.hoisted(() => ({
  test: vi.fn(),
  startTest: vi.fn(),
  submitTest: vi.fn(),
}));
const courseMocks = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/lib/services/studentApi", () => ({
  studentApi: mocks,
}));
vi.mock("@/lib/services/coursesApi", () => ({
  coursesApi: courseMocks,
}));

function apiError(status: number, data: unknown) {
  return new AxiosError(
    "Request failed",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    { status, data, statusText: "", headers: {}, config: {} } as AxiosResponse,
  );
}

const practiceTest = {
  id: 51,
  course: 15,
  level: "PT",
  skill: 1,
  skill_detail: { id: 1, name: "listening", order: 1 },
  title: "PT Listening Practice 1",
  description: "Development listening practice test for PT.",
  duration_minutes: 20,
  max_attempts: null,
  is_free: true,
  is_published: true,
  questions_count: 2,
  media: [],
};

const questions = [
  {
    id: 203,
    question_text: "Choose the best answer.",
    question_type: "multiple_choice",
    options: ["Option A", "Option B"],
    points: "2.00",
    order: 1,
  },
  {
    id: 205,
    question_text: "Type the word practice.",
    question_type: "short_answer",
    options: null,
    points: "2.00",
    order: 2,
  },
];

const lockedTest = {
  ...practiceTest,
  questions_locked: true,
  active_submission: null,
  questions: [],
};

function runningTest(deadlineInMs = 20 * 60_000) {
  return {
    ...practiceTest,
    questions_locked: false,
    active_submission: {
      id: 90,
      started_at: new Date().toISOString(),
      deadline: new Date(Date.now() + deadlineInMs).toISOString(),
    },
    questions,
  };
}

/** Serves the locked detail until `/start/` is called, as the API does. */
function serveTest(locked: object, running: object) {
  let started = false;
  mocks.startTest.mockImplementation(async () => {
    started = true;
    return { id: 90, practice_test: 51, started_at: new Date().toISOString() };
  });
  mocks.test.mockImplementation(async () => (started ? running : locked));
}

describe("TestDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    serveTest(lockedTest, runningTest());
    mocks.submitTest.mockResolvedValue({
      id: 90,
      practice_test: 51,
      grading_status: "graded",
      total_score: "4.00",
      max_score: "4.00",
      percentage: "100.00",
      recommended_level: null,
      answers: [
        {
          id: 385,
          question: 203,
          answer_text: "Option A",
          is_correct: false,
          score: "0.00",
          feedback: null,
        },
        {
          id: 386,
          question: 205,
          answer_text: "practice",
          is_correct: true,
          score: "2.00",
          feedback: null,
        },
      ],
    });
  });

  it("waits for the student before starting, then reloads the questions", async () => {
    const user = userEvent.setup();
    renderWithStore(<TestDetailPage id={51} />);

    await screen.findByRole("heading", { name: "PT Listening Practice 1" });
    expect(mocks.startTest).not.toHaveBeenCalled();
    expect(screen.queryByTestId("question-203")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "شروع آزمون" }));

    expect(await screen.findByTestId("question-203")).toHaveAttribute("dir", "ltr");
    expect(mocks.startTest).toHaveBeenCalledTimes(1);
    expect(mocks.startTest).toHaveBeenCalledWith(51);
    expect(mocks.test).toHaveBeenCalledTimes(2);
    expect(screen.getAllByText("نمره: ۲")).toHaveLength(2);
    expect(screen.getByText("مدل: چندگزینه‌ای")).toBeInTheDocument();
    expect(screen.getByText("مدل: پاسخ کوتاه")).toBeInTheDocument();
    expect(screen.queryByText("multiple_choice")).not.toBeInTheDocument();
    expect(screen.getByTestId("question-205")).toHaveClass("text-left");
    expect(screen.getByRole("timer")).toHaveTextContent(/^(۲۰:۰۰|۱۹:۵۹)$/);
  });

  it("resumes a running attempt without calling start again", async () => {
    mocks.test.mockResolvedValue({
      ...runningTest(),
      questions_count: 1,
      questions: [{
        id: 228,
        question_text: "The statement is true.",
        question_type: "true_false",
        options: null,
        points: "1.00",
        order: 1,
      }],
    });

    renderWithStore(<TestDetailPage id={57} />);

    expect(await screen.findByText("مدل: درست / نادرست")).toBeInTheDocument();
    expect(mocks.startTest).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "شروع آزمون" })).not.toBeInTheDocument();
    expect(screen.getByText("نمره: ۱")).toBeInTheDocument();
    expect(screen.getByLabelText("صحیح")).toBeEnabled();
    expect(screen.getByLabelText("صحیح").closest("div")).toHaveClass("grid-cols-2");
  });

  it("plays only pre-start media before the attempt, then all exam media", async () => {
    const user = userEvent.setup();
    const media = [
      {
        id: 10,
        media_type: "video",
        title: "ویدئوی راهنما",
        available_before_start: true,
        stream_url: "http://2.144.27.2:8000/api/test-media/10/stream/",
      },
      {
        id: 12,
        media_type: "audio",
        title: "صدای بخش اول",
        available_before_start: false,
        stream_url: "http://2.144.27.2:8000/api/test-media/12/stream/",
      },
    ];
    const running = runningTest();
    serveTest(
      { ...lockedTest, media },
      {
        ...running,
        media,
        questions: [{
          ...questions[0],
          media: [{
            id: 11,
            media_type: "voice",
            title: "صدای سؤال",
            stream_url: "http://2.144.27.2:8000/api/question-media/11/stream/",
          }],
        }],
      },
    );

    const { container } = renderWithStore(<TestDetailPage id={51} />);

    expect(await screen.findByLabelText(/^ویدئوی راهنما/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^صدای بخش اول/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "شروع آزمون" }));

    expect(await screen.findByLabelText(/^صدای بخش اول/)).toBeInTheDocument();
    expect(screen.getByLabelText("صدای سؤال")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "رسانه سؤال ۱" })).toBeInTheDocument();
    const sources = container.querySelectorAll("source");
    expect(sources[0]).toHaveAttribute("src", "http://2.144.27.2:8000/api/test-media/10/stream/");
    expect(sources[2]).toHaveAttribute("src", "http://2.144.27.2:8000/api/question-media/11/stream/");
  });

  it("submits all answers only after the test is complete", async () => {
    const user = userEvent.setup();
    renderWithStore(<TestDetailPage id={51} />);

    await user.click(await screen.findByRole("button", { name: "شروع آزمون" }));
    const submitButton = await screen.findByRole("button", { name: "ثبت نهایی آزمون" });
    expect(submitButton).toBeDisabled();

    await user.click(screen.getByLabelText("Option A"));
    await user.type(screen.getByLabelText("پاسخ سؤال ۲"), "practice");
    expect(submitButton).toBeEnabled();
    expect(JSON.parse(window.localStorage.getItem("practice-test-answers:90") ?? "{}"))
      .toEqual({ 203: "Option A", 205: "practice" });

    await user.click(submitButton);

    await waitFor(() => {
      expect(mocks.submitTest).toHaveBeenCalledWith(51, {
        answers: [
          { question: 203, answer_text: "Option A" },
          { question: 205, answer_text: "practice" },
        ],
      });
    });
    expect(await screen.findByText("آزمون با موفقیت ثبت شد.")).toBeInTheDocument();
    expect(screen.getByText("امتیاز شما: 4.00 از 4.00")).toBeInTheDocument();
    expect(screen.getByText("درصد: 100.00٪")).toBeInTheDocument();
    expect(screen.getByTestId("question-203")).toHaveStyle({
      borderColor: "var(--destructive)",
    });
    expect(screen.getByTestId("question-205")).toHaveStyle({
      borderColor: "var(--success)",
    });
    expect(screen.getByText(/پاسخ اشتباه/)).toBeInTheDocument();
    expect(screen.getByText(/پاسخ صحیح/)).toBeInTheDocument();
    expect(window.localStorage.getItem("practice-test-answers:90")).toBeNull();
    expect(
      screen.getByRole("link", { name: "مشاهده نتیجه کامل" }),
    ).toHaveAttribute("href", "/student/tests/51/result");
  });

  it("restores answers saved for the running attempt", async () => {
    window.localStorage.setItem(
      "practice-test-answers:90",
      JSON.stringify({ 205: "saved" }),
    );
    mocks.test.mockResolvedValue(runningTest());

    renderWithStore(<TestDetailPage id={51} />);

    expect(await screen.findByLabelText("پاسخ سؤال ۲")).toHaveValue("saved");
  });

  it("auto-submits just before the deadline", async () => {
    mocks.test.mockResolvedValue(runningTest(3_000));

    renderWithStore(<TestDetailPage id={51} />);

    await waitFor(() => {
      expect(mocks.submitTest).toHaveBeenCalledWith(51, {
        answers: [
          { question: 203, answer_text: "" },
          { question: 205, answer_text: "" },
        ],
      });
    });
    expect(mocks.submitTest).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("آزمون با موفقیت ثبت شد.")).toBeInTheDocument();
  });

  it("explains a late submit and offers a new attempt", async () => {
    mocks.test
      .mockResolvedValueOnce(runningTest(-1_000))
      .mockResolvedValue(lockedTest);
    mocks.submitTest.mockRejectedValue(
      apiError(400, { detail: "The time limit for this attempt has passed." }),
    );

    renderWithStore(<TestDetailPage id={51} />);

    expect(
      await screen.findByText("زمان این تلاش به پایان رسیده بود و پاسخ‌ها ثبت نشد."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "شروع دوباره آزمون" })).toBeEnabled();
    expect(screen.queryByLabelText("Option A")).not.toBeInTheDocument();
  });

  it("shows the reason when the server refuses to start", async () => {
    const user = userEvent.setup();
    mocks.startTest.mockRejectedValue(
      apiError(403, { detail: "You have used all 2 attempts for this test." }),
    );

    renderWithStore(<TestDetailPage id={51} />);
    await user.click(await screen.findByRole("button", { name: "شروع آزمون" }));

    expect(
      await screen.findByText("You have used all 2 attempts for this test."),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("question-203")).not.toBeInTheDocument();
  });

  it("offers the course for purchase when a paid test is forbidden", async () => {
    mocks.test.mockRejectedValue(
      apiError(403, { detail: "Enroll in this course to take its tests." }),
    );
    courseMocks.get.mockResolvedValue({ id: 18, title: "دوره آیلتس", has_access: false });

    renderWithStore(<TestDetailPage id={64} courseId={18} />);

    expect(
      await screen.findByText("برای شرکت در این آزمون، ابتدا دوره آن را تهیه کنید."),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("link", { name: "خرید دوره «دوره آیلتس»" }),
    ).toHaveAttribute("href", "/student/all-courses/18");
    expect(courseMocks.get).toHaveBeenCalledWith(18);
  });
});
