import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TestDetailPage from "./TestDetailPage";

const mocks = vi.hoisted(() => ({
  test: vi.fn(),
  startTest: vi.fn(),
  submitTest: vi.fn(),
}));

vi.mock("@/lib/studentApi", () => ({
  studentApi: mocks,
}));

const practiceTest = {
  id: 51,
  course: 15,
  level: "PT",
  skill: 1,
  skill_detail: { id: 1, name: "listening", order: 1 },
  title: "PT Listening Practice 1",
  description: "Development listening practice test for PT.",
  duration_minutes: 20,
  is_published: true,
  questions_count: 2,
  media: [],
  questions: [
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
  ],
};

describe("TestDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.test.mockResolvedValue(practiceTest);
    mocks.startTest.mockResolvedValue({ id: 90, practice_test: 51 });
    mocks.submitTest.mockResolvedValue({
      id: 90,
      practice_test: 51,
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

  it("starts the test when the detail route opens", async () => {
    render(<TestDetailPage id={51} />);

    await screen.findByRole("heading", { name: "PT Listening Practice 1" });
    await waitFor(() => expect(mocks.startTest).toHaveBeenCalledWith(51));
    expect(mocks.startTest).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText("نمره: ۲")).toHaveLength(2);
    expect(screen.getByText("مدل: چندگزینه‌ای")).toBeInTheDocument();
    expect(screen.getByText("مدل: پاسخ کوتاه")).toBeInTheDocument();
    expect(screen.queryByText("multiple_choice")).not.toBeInTheDocument();
    expect(screen.queryByText("short_answer")).not.toBeInTheDocument();
    expect(screen.getByTestId("question-203")).toHaveAttribute("dir", "ltr");
    expect(screen.getByTestId("question-205")).toHaveClass("text-left");
  });

  it("renders true/false questions with explicit choices and metadata", async () => {
    mocks.test.mockResolvedValue({
      ...practiceTest,
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

    render(<TestDetailPage id={57} />);

    expect(await screen.findByText("مدل: درست / نادرست")).toBeInTheDocument();
    expect(screen.queryByText("true_false")).not.toBeInTheDocument();
    expect(screen.getByText("نمره: ۱")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText("صحیح")).toBeEnabled());
    expect(screen.getByLabelText("غلط")).toBeEnabled();
    expect(screen.getByLabelText("صحیح").closest("div")).toHaveClass("grid-cols-2");
  });

  it("submits all answers only after the test is complete", async () => {
    const user = userEvent.setup();
    render(<TestDetailPage id={51} />);

    const submitButton = await screen.findByRole("button", { name: "ثبت نهایی آزمون" });
    await waitFor(() => expect(screen.getByLabelText("Option A")).toBeEnabled());
    expect(submitButton).toBeDisabled();

    await user.click(screen.getByLabelText("Option A"));
    await user.type(screen.getByLabelText("پاسخ سؤال ۲"), "practice");
    expect(submitButton).toBeEnabled();

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
  });
});
