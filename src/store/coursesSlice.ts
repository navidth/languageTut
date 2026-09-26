import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { isCacheFresh } from "@/lib/cache";
import { type Course, type PaginatedCourses, coursesApi } from "@/lib/courses";
import { loadMe, login, logout, register } from "./authSlice";

type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

export type CoursePageState = {
  data: PaginatedCourses | null;
  status: RequestStatus;
  error: string | null;
  lastFetched: number | null;
};

type CoursesState = {
  pages: Record<number, CoursePageState>;
};

const initialState: CoursesState = { pages: {} };

type FetchCoursesRequest = { page?: number; force?: boolean } | number | undefined;

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
      return api.rejectWithValue(
        getApiErrorMessage(error, "دریافت دوره‌ها ناموفق بود."),
      );
    }
  },
  {
    condition: (request, { getState }) => {
      const page = requestPage(request);
      const force = typeof request === "object" && Boolean(request?.force);
      const cached = getState().courses.pages[page];
      if (cached?.status === "loading") return false;
      return force || !isCacheFresh(cached?.lastFetched);
    },
  },
);

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    hydrateCourses(
      state,
      action: { payload: { items: Course[]; count: number; page?: number } },
    ) {
      const page = action.payload.page ?? 1;
      state.pages[page] = {
        data: {
          count: action.payload.count,
          next: null,
          previous: null,
          results: action.payload.items,
        },
        status: "succeeded",
        error: null,
        lastFetched: Date.now(),
      };
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCourses.pending, (state, action) => {
        const page = requestPage(action.meta.arg);
        const cached = state.pages[page];
        state.pages[page] = {
          data: cached?.data ?? null,
          status: "loading",
          error: null,
          lastFetched: cached?.lastFetched ?? null,
        };
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.pages[action.payload.page] = {
          data: action.payload.data,
          status: "succeeded",
          error: null,
          lastFetched: Date.now(),
        };
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        const page = requestPage(action.meta.arg);
        const cached = state.pages[page];
        state.pages[page] = {
          data: cached?.data ?? null,
          status: "failed",
          error: String(action.payload ?? "دریافت دوره‌ها ناموفق بود."),
          lastFetched: cached?.lastFetched ?? null,
        };
      })
      .addCase(logout, () => initialState)
      .addCase(loadMe.rejected, () => initialState)
      .addCase(login.fulfilled, () => initialState)
      .addCase(register.fulfilled, () => initialState);
  },
});

export const { hydrateCourses } = coursesSlice.actions;
export default coursesSlice.reducer;
