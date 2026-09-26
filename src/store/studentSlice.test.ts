import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import studentReducer, {
  fetchEnrolledCourses,
  fetchStudentOverview,
  fetchStudentResource,
} from "./studentSlice";

const mocks = vi.hoisted(() => ({
  progress: vi.fn(),
  enrollments: vi.fn(),
  course: vi.fn(),
  levels: vi.fn(),
}));

vi.mock("@/lib/studentApi", () => ({
  studentApi: {
    progress: mocks.progress,
    enrollments: mocks.enrollments,
    course: mocks.course,
    levels: mocks.levels,
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
});
