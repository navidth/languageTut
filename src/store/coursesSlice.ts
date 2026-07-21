import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Course, coursesApi } from "@/lib/courses";

type CoursesState = {
  items: Course[];
  count: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: CoursesState = { items: [], count: 0, status: "idle", error: null };

export const fetchCourses = createAsyncThunk("courses/list", (page: number = 1) => coursesApi.list(page));

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    hydrateCourses(state, action: { payload: { items: Course[]; count: number } }) {
      state.items = action.payload.items;
      state.count = action.payload.count;
      state.status = "succeeded";
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCourses.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.results;
        state.count = action.payload.count;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "دریافت دوره‌ها ناموفق بود.";
      });
  },
});

export const { hydrateCourses } = coursesSlice.actions;
export default coursesSlice.reducer;
