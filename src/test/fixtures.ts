import type { Homework, HomeworkSubmission } from "@/lib/homeworkApi";
import type {
  ExamSubmission,
  Paginated,
  PracticeTest,
  StudentAnswer,
} from "@/lib/studentApi";

export function buildPage<T>(
  results: T[],
  overrides: Partial<Paginated<T>> = {},
): Paginated<T> {
  return {
    count: results.length,
    next: null,
    previous: null,
    results,
    ...overrides,
  };
}

export function buildHomeworkSubmission(
  overrides: Partial<HomeworkSubmission> = {},
): HomeworkSubmission {
  return {
    id: 9,
    homework: 1,
    homework_title: "Final assignment",
    student: 7,
    student_name: "Sara",
    student_email: "student@example.com",
    file_name: "essay.pdf",
    download_url: "http://api.test/api/homework-submissions/9/download/",
    notes: "",
    status: "submitted",
    is_late: false,
    score: null,
    max_score: "20.00",
    percentage: "0.00",
    feedback: "",
    graded_by: null,
    graded_by_name: "",
    graded_at: null,
    submitted_at: "2026-09-10T08:00:00Z",
    updated_at: "2026-09-10T08:00:00Z",
    ...overrides,
  };
}

export function buildHomework(overrides: Partial<Homework> = {}): Homework {
  return {
    id: 1,
    course: 15,
    lesson: null,
    lesson_title: null,
    scope: "course",
    title: "Final assignment",
    instructions: "Upload a single PDF covering everything in this course.",
    due_at: "2026-10-05T06:00:00Z",
    max_score: "20.00",
    allow_late_submissions: true,
    is_published: true,
    is_past_due: false,
    my_submission: null,
    created_at: "2026-09-05T06:00:00Z",
    updated_at: "2026-09-05T06:00:00Z",
    ...overrides,
  };
}

export function buildAnswer(
  overrides: Partial<StudentAnswer> & Pick<StudentAnswer, "question">,
): StudentAnswer {
  return {
    id: overrides.question * 10,
    answer_text: "Option A",
    is_correct: true,
    score: "2.00",
    feedback: null,
    ...overrides,
  };
}

export function buildExamSubmission(
  overrides: Partial<ExamSubmission> = {},
): ExamSubmission {
  return {
    id: 90,
    practice_test: 51,
    practice_test_title: "PT Listening Practice 1",
    exam_type: "practice",
    started_at: "2026-09-10T08:00:00Z",
    submitted_at: "2026-09-10T08:12:00Z",
    total_score: "2.00",
    max_score: "8.00",
    percentage: "25.00",
    recommended_level: null,
    answers: [],
    ...overrides,
  };
}

export function buildPracticeTest(
  overrides: Partial<PracticeTest> = {},
): PracticeTest {
  return {
    id: 51,
    course: 15,
    level: "PT",
    skill: 1,
    skill_detail: { id: 1, name: "listening", order: 1 },
    exam_type: "practice",
    title: "PT Listening Practice 1",
    description: "Development listening practice test for PT.",
    duration_minutes: 20,
    is_published: true,
    questions_count: 0,
    media: [],
    questions: [],
    ...overrides,
  };
}
