import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getApiErrorMessage, toApiErrorInfo } from "@/lib/services/apiErrors";
import { coursesApi } from "@/lib/services/coursesApi";
import { loadMe, login, logout, register } from "@/store/authSlice";
import {
  failedEntry,
  failedPage,
  loadedEntry,
  loadedPage,
  pendingEntry,
  pendingPage,
  shouldFetch,
} from "@/store/entries";
import type { Paginated } from "@/types/api";
import type { Course, Lesson, PaginatedCourses } from "@/types/course";
import type { CoursesState, CoursesThunkConfig, FetchCoursesRequest } from "@/types/store";
import type { PurchaseResponse } from "@/types/student";

const LIST_ERROR = "دریافت دوره‌ها ناموفق بود.";
const DETAIL_ERROR = "دریافت اطلاعات دوره ناموفق بود.";
const LESSONS_ERROR = "دریافت درس‌های دوره ناموفق بود.";
const ACTIVATE_ERROR = "فعال‌سازی دوره ناموفق بود.";

const initialState: CoursesState = { pages: {}, details: {}, lessons: {} };

function requestPage(request: FetchCoursesRequest) {
  return typeof request === "number" ? request : request?.page ?? 1;
}

export const fetchCourses = createAsyncThunk<
  { page: number; data: PaginatedCourses },
  FetchCoursesRequest,
  { state: { courses: CoursesState }; rejectValue: string }
>(
  "courses/list",
  async (request, api) => {
    const page = requestPage(request);
    try {
      return { page, data: await coursesApi.list(page) };
    } catch (error) {
      return api.rejectWithValue(getApiErrorMessage(error, LIST_ERROR));
    }
  },
  {
    condition: (request, { getState }) =>
      shouldFetch(
        getState().courses.pages[requestPage(request)],
        typeof request === "object" && Boolean(request?.force),
      ),
  },
);

export const fetchCourseDetail = createAsyncThunk<
  Course,
  { id: number; force?: boolean },
  CoursesThunkConfig
>(
  "courses/detail",
  async ({ id }, api) => {
    try {
      return await coursesApi.get(id);
    } catch (error) {
      return api.rejectWithValue(toApiErrorInfo(error, DETAIL_ERROR));
    }
  },
  {
    condition: ({ id, force }, { getState }) => shouldFetch(getState().courses.details[id], force),
  },
);

export const fetchCourseLessons = createAsyncThunk<
  Paginated<Lesson>,
  { courseId: number; page: number; force?: boolean },
  CoursesThunkConfig
>(
  "courses/lessons",
  async ({ courseId, page }, api) => {
    try {
      return await coursesApi.lessons(courseId, page);
    } catch (error) {
      return api.rejectWithValue(toApiErrorInfo(error, LESSONS_ERROR));
    }
  },
  {
    condition: ({ courseId, page, force }, { getState }) =>
      shouldFetch(getState().courses.lessons[courseId]?.[page], force),
  },
);

/**
 * Opens a course for the signed-in student: checks access afresh, buys it
 * when needed, and checks again after a free enrollment. A paid course comes
 * back with `purchase.payment_url` for the caller to open.
 */
export const activateCourse = createAsyncThunk<
  { course: Course; purchase: PurchaseResponse | null },
  number,
  CoursesThunkConfig
>("courses/activate", async (id, api) => {
  try {
    const course = await coursesApi.get(id);
    if (course.has_access) return { course, purchase: null };
    const purchase = await coursesApi.purchase(id);
    if (purchase.payment_url) return { course, purchase };
    return { course: await coursesApi.get(id), purchase };
  } catch (error) {
    return api.rejectWithValue(toApiErrorInfo(error, ACTIVATE_ERROR));
  }
});

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchCourses.pending, (state, action) => {
        const page = requestPage(action.meta.arg);
        state.pages[page] = pendingPage(state.pages[page]);
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.pages[action.payload.page] = loadedPage(action.payload.data);
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        const page = requestPage(action.meta.arg);
        state.pages[page] = failedPage(state.pages[page], String(action.payload ?? LIST_ERROR));
      })
      .addCase(fetchCourseDetail.pending, (state, action) => {
        const { id } = action.meta.arg;
        state.details[id] = pendingEntry(state.details[id]);
      })
      .addCase(fetchCourseDetail.fulfilled, (state, action) => {
        state.details[action.meta.arg.id] = loadedEntry(action.payload);
      })
      .addCase(fetchCourseDetail.rejected, (state, action) => {
        const { id } = action.meta.arg;
        state.details[id] = failedEntry(state.details[id], action.payload, DETAIL_ERROR);
      })
      .addCase(fetchCourseLessons.pending, (state, action) => {
        const { courseId, page } = action.meta.arg;
        state.lessons[courseId] ??= {};
        state.lessons[courseId][page] = pendingPage(state.lessons[courseId][page]);
      })
      .addCase(fetchCourseLessons.fulfilled, (state, action) => {
        const { courseId, page } = action.meta.arg;
        state.lessons[courseId] ??= {};
        state.lessons[courseId][page] = loadedPage(action.payload);
      })
      .addCase(fetchCourseLessons.rejected, (state, action) => {
        const { courseId, page } = action.meta.arg;
        state.lessons[courseId] ??= {};
        state.lessons[courseId][page] = failedPage(
          state.lessons[courseId][page],
          action.payload?.message ?? LESSONS_ERROR,
        );
      })
      .addCase(activateCourse.fulfilled, (state, action) => {
        const { course } = action.payload;
        state.details[course.id] = loadedEntry(course);
        // Access may have changed, so lesson pages load again.
        delete state.lessons[course.id];
      })
      // `has_access` belongs to the user, so it never outlives a sign-in change.
      .addCase(logout, () => initialState)
      .addCase(loadMe.rejected, () => initialState)
      .addCase(login.fulfilled, () => initialState)
      .addCase(register.fulfilled, () => initialState);
  },
});

type CoursesRoot = { courses: CoursesState };

export const selectCourseDetail = (state: CoursesRoot, id: number) => state.courses.details[id];

export const selectCourseLessons = (state: CoursesRoot, courseId: number, page: number) =>
  state.courses.lessons[courseId]?.[page];

export default coursesSlice.reducer;
