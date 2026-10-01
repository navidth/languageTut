import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import studentReducer, {
  fetchEnrolledCourses,
  fetchExamSubmissions,
  fetchPracticeTestDetail,
  fetchStudentOverview,
  fetchStudentResource,
  invalidateExamSubmissions,
  selectLatestExamSubmissions,
} from "./studentSlice";

const mocks = vi.hoisted(() => ({
  progress: vi.fn(),
  enrollments: vi.fn(),
  course: vi.fn(),
  levels: vi.fn(),
  mySubmissions: vi.fn(),
  test: vi.fn(),
}));

vi.mock("@/lib/studentApi", () => ({
  studentApi: {
    progress: mocks.progress,
    enrollments: mocks.enrollments,
    course: mocks.course,
    levels: mocks.levels,
    mySubmissions: mocks.mySubmissions,
    test: mocks.test,
  },
}));

function createStore() {
  return configureStore({ reducer: { student: studentReducer } });
}

describe("student cache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.progress.mockResolvedValue({ courses: [], lessons: [] });
    mocks.enrollments.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [{ id: 1, course: 42, course_title: "Course", source: "purchase", created_at: "" }],
    });
    mocks.course.mockResolvedValue({ id: 42, title: "Course" });
    mocks.levels.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [{ id: 1, code: "A1", title: "A1", order: 1 }],
    });
  });

  it("reuses fresh overview data", async () => {
    const store = createStore();

    await store.dispatch(fetchStudentOverview()).unwrap();
    await store.dispatch(fetchStudentOverview());

    expect(mocks.progress).toHaveBeenCalledOnce();
    expect(mocks.enrollments).toHaveBeenCalledOnce();
  });

  it("reuses overview enrollments and the assembled enrolled-course page", async () => {
    const store = createStore();

    await store.dispatch(fetchStudentOverview()).unwrap();
    await store.dispatch(fetchEnrolledCourses({ page: 1 })).unwrap();
    await store.dispatch(fetchEnrolledCourses({ page: 1 }));

    expect(mocks.enrollments).toHaveBeenCalledOnce();
    expect(mocks.course).toHaveBeenCalledOnce();
  });

  it("deduplicates fresh resource pages but permits an explicit refresh", async () => {
    const store = createStore();

    await store.dispatch(fetchStudentResource({ kind: "levels", page: 1 })).unwrap();
    await store.dispatch(fetchStudentResource({ kind: "levels", page: 1 }));
    await store.dispatch(fetchStudentResource({ kind: "levels", page: 1, force: true })).unwrap();

    expect(mocks.levels).toHaveBeenCalledTimes(2);
  });

  it("reuses the exam history until a new attempt invalidates it", async () => {
    mocks.mySubmissions.mockResolvedValue([
      { id: 90, practice_test: 51, submitted_at: "2026-09-10T08:12:00Z", answers: [] },
      { id: 91, practice_test: 60, submitted_at: null, answers: [] },
    ]);
    const store = createStore();

    await store.dispatch(fetchExamSubmissions()).unwrap();
    await store.dispatch(fetchExamSubmissions());
    expect(mocks.mySubmissions).toHaveBeenCalledOnce();

    store.dispatch(invalidateExamSubmissions());
    await store.dispatch(fetchExamSubmissions()).unwrap();

    expect(mocks.mySubmissions).toHaveBeenCalledTimes(2);
    expect(selectLatestExamSubmissions(store.getState())).toEqual({
      51: expect.objectContaining({ id: 90 }),
    });
  });

  it("caches practice test details per test", async () => {
    mocks.test.mockImplementation(async (id: number) => ({ id, title: "Test" }));
    const store = createStore();

    await store.dispatch(fetchPracticeTestDetail({ id: 51 })).unwrap();
    await store.dispatch(fetchPracticeTestDetail({ id: 51 }));
    await store.dispatch(fetchPracticeTestDetail({ id: 60 })).unwrap();

    expect(mocks.test).toHaveBeenCalledTimes(2);
    expect(store.getState().student.testDetails[60].data?.id).toBe(60);
  });
});
