import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/apiErrors";
import {
  buildHomework,
  buildHomeworkSubmission,
  buildPage,
} from "@/test/fixtures";
import { logout } from "./authSlice";
import homeworkReducer, {
  fetchHomework,
  fetchHomeworkList,
  homeworkListKey,
  homeworkSubmissionRemoved,
  homeworkSubmissionSaved,
} from "./homeworkSlice";

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  get: vi.fn(),
}));

vi.mock("@/lib/homeworkApi", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/homeworkApi")>()),
  homeworkApi: mocks,
}));

function createStore() {
  return configureStore({ reducer: { homework: homeworkReducer } });
}

describe("homework cache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.list.mockResolvedValue(
      buildPage([buildHomework({ id: 1 }), buildHomework({ id: 2 })]),
    );
    mocks.get.mockResolvedValue(buildHomework({ id: 3 }));
  });

  it("reuses a fresh list page and opens its items without a request", async () => {
    const store = createStore();

    await store.dispatch(fetchHomeworkList({ page: 1 })).unwrap();
    await store.dispatch(fetchHomeworkList({ page: 1 }));
    await store.dispatch(fetchHomework({ id: 2 }));

    expect(mocks.list).toHaveBeenCalledOnce();
    expect(mocks.get).not.toHaveBeenCalled();
    expect(store.getState().homework.details[2].data?.id).toBe(2);
  });

  it("does not start a second request while one is in flight", async () => {
    const store = createStore();

    const first = store.dispatch(fetchHomeworkList({ page: 1 }));
    const second = store.dispatch(fetchHomeworkList({ page: 1 }));
    await Promise.all([first, second]);

    expect(mocks.list).toHaveBeenCalledOnce();
  });

  it("caches each server-side filter separately and honours a forced refresh", async () => {
    const store = createStore();

    await store.dispatch(fetchHomeworkList({ page: 1 })).unwrap();
    await store
      .dispatch(fetchHomeworkList({ page: 1, course: 15, scope: "lesson" }))
      .unwrap();
    await store.dispatch(fetchHomeworkList({ page: 1, force: true })).unwrap();

    expect(mocks.list).toHaveBeenCalledTimes(3);
    expect(mocks.list).toHaveBeenNthCalledWith(2, {
      page: 1,
      course: 15,
      scope: "lesson",
    });
    expect(Object.keys(store.getState().homework.lists)).toEqual([
      homeworkListKey({ page: 1 }),
      homeworkListKey({ page: 1, course: 15, scope: "lesson" }),
    ]);
  });

  it("applies a submission change to every cached copy of the homework", async () => {
    const store = createStore();
    const key = homeworkListKey({ page: 1 });
    await store.dispatch(fetchHomeworkList({ page: 1 })).unwrap();

    store.dispatch(
      homeworkSubmissionSaved({
        homeworkId: 1,
        submission: buildHomeworkSubmission({ id: 9 }),
      }),
    );

    let state = store.getState().homework;
    expect(state.lists[key].data?.results[0].my_submission?.id).toBe(9);
    expect(state.details[1].data?.my_submission?.id).toBe(9);
    expect(state.details[2].data?.my_submission).toBeNull();

    store.dispatch(homeworkSubmissionRemoved({ homeworkId: 1 }));

    state = store.getState().homework;
    expect(state.lists[key].data?.results[0].my_submission).toBeNull();
    expect(state.details[1].data?.my_submission).toBeNull();
  });

  it("refreshes the copy held in list pages when a homework is reloaded", async () => {
    const store = createStore();
    const key = homeworkListKey({ page: 1 });
    await store.dispatch(fetchHomeworkList({ page: 1 })).unwrap();
    mocks.get.mockResolvedValue(buildHomework({ id: 1, is_past_due: true }));

    await store.dispatch(fetchHomework({ id: 1, force: true })).unwrap();

    expect(store.getState().homework.lists[key].data?.results[0].is_past_due).toBe(
      true,
    );
  });

  it("records the failure kind so pages can tell a missing homework apart", async () => {
    const store = createStore();
    mocks.get.mockRejectedValue(
      new ApiError({ message: "پیدا نشد.", kind: "not-found", status: 404 }),
    );

    await store.dispatch(fetchHomework({ id: 99 }));

    expect(store.getState().homework.details[99]).toMatchObject({
      status: "failed",
      error: "پیدا نشد.",
      errorKind: "not-found",
      data: null,
    });
  });

  it("drops the cached homework when the user signs out", async () => {
    const store = createStore();
    await store.dispatch(fetchHomeworkList({ page: 1 })).unwrap();

    store.dispatch(logout());

    expect(store.getState().homework).toEqual({ lists: {}, details: {} });
  });
});
