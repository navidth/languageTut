import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  toApiErrorInfo,
  type ApiErrorInfo,
  type ApiErrorKind,
} from "@/lib/apiErrors";
import { isCacheFresh } from "@/lib/cache";
import {
  homeworkApi,
  type Homework,
  type HomeworkScope,
  type HomeworkSubmission,
} from "@/lib/homeworkApi";
import type { Paginated } from "@/lib/studentApi";
import { loadMe, login, logout, register } from "./authSlice";

type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

export type HomeworkEntry<T> = {
  data: T | null;
  status: RequestStatus;
  error: string | null;
  errorKind: ApiErrorKind | null;
  lastFetched: number | null;
};

export type HomeworkListFilters = {
  page: number;
  course?: number;
  scope?: HomeworkScope;
};

export type HomeworkState = {
  /** Server-filtered pages, keyed by `homeworkListKey`. */
  lists: Record<string, HomeworkEntry<Paginated<Homework>>>;
  details: Record<number, HomeworkEntry<Homework>>;
};

const initialState: HomeworkState = { lists: {}, details: {} };

type HomeworkThunkConfig = {
  state: { homework: HomeworkState };
  rejectValue: ApiErrorInfo;
};

const LIST_ERROR = "دریافت تکالیف ناموفق بود.";
const DETAIL_ERROR = "دریافت اطلاعات تکلیف ناموفق بود.";

export function homeworkListKey({ page, course, scope }: HomeworkListFilters) {
  return `${page}|${course ?? ""}|${scope ?? ""}`;
}

export const fetchHomeworkList = createAsyncThunk<
  { key: string; data: Paginated<Homework> },
  HomeworkListFilters & { force?: boolean },
  HomeworkThunkConfig
>(
  "homework/list",
  async ({ page, course, scope }, api) => {
    try {
      return {
        key: homeworkListKey({ page, course, scope }),
        data: await homeworkApi.list({ page, course, scope }),
      };
    } catch (error) {
      return api.rejectWithValue(toApiErrorInfo(error, LIST_ERROR));
    }
  },
  {
    condition: ({ force, ...filters }, { getState }) => {
      const entry = getState().homework.lists[homeworkListKey(filters)];
      if (entry?.status === "loading") return false;
      return Boolean(force) || !isCacheFresh(entry?.lastFetched);
    },
  },
);

export const fetchHomework = createAsyncThunk<
  Homework,
  { id: number; force?: boolean },
  HomeworkThunkConfig
>(
  "homework/retrieve",
  async ({ id }, api) => {
    try {
      return await homeworkApi.get(id);
    } catch (error) {
      return api.rejectWithValue(toApiErrorInfo(error, DETAIL_ERROR));
    }
  },
  {
    condition: ({ id, force }, { getState }) => {
      const entry = getState().homework.details[id];
      if (entry?.status === "loading") return false;
      return Boolean(force) || !isCacheFresh(entry?.lastFetched);
    },
  },
);

function pendingEntry<T>(
  entry: HomeworkEntry<T> | undefined,
): HomeworkEntry<T> {
  return {
    data: entry?.data ?? null,
    status: "loading",
    error: null,
    errorKind: null,
    lastFetched: entry?.lastFetched ?? null,
  };
}

function loadedEntry<T>(data: T, fetchedAt: number): HomeworkEntry<T> {
  return {
    data,
    status: "succeeded",
    error: null,
    errorKind: null,
    lastFetched: fetchedAt,
  };
}

function failedEntry<T>(
  entry: HomeworkEntry<T> | undefined,
  info: ApiErrorInfo | undefined,
  fallback: string,
): HomeworkEntry<T> {
  return {
    data: entry?.data ?? null,
    status: "failed",
    error: info?.message ?? fallback,
    errorKind: info?.kind ?? "unknown",
    lastFetched: entry?.lastFetched ?? null,
  };
}

/** Applies a submission change to every cached copy of the homework. */
function setCachedSubmission(
  state: HomeworkState,
  homeworkId: number,
  submission: HomeworkSubmission | null,
) {
  const detail = state.details[homeworkId]?.data;
  if (detail) detail.my_submission = submission;

  for (const entry of Object.values(state.lists)) {
    const cached = entry.data?.results.find((item) => item.id === homeworkId);
    if (cached) cached.my_submission = submission;
  }
}

const homeworkSlice = createSlice({
  name: "homework",
  initialState,
  reducers: {
    homeworkSubmissionSaved(
      state,
      action: PayloadAction<{
        homeworkId: number;
        submission: HomeworkSubmission;
      }>,
    ) {
      setCachedSubmission(
        state,
        action.payload.homeworkId,
        action.payload.submission,
      );
    },
    homeworkSubmissionRemoved(
      state,
      action: PayloadAction<{ homeworkId: number }>,
    ) {
      setCachedSubmission(state, action.payload.homeworkId, null);
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchHomeworkList.pending, (state, action) => {
        const key = homeworkListKey(action.meta.arg);
        state.lists[key] = pendingEntry(state.lists[key]);
      })
      .addCase(fetchHomeworkList.fulfilled, (state, action) => {
        const { key, data } = action.payload;
        const fetchedAt = Date.now();
        state.lists[key] = loadedEntry(data, fetchedAt);
        // The list returns complete homework objects, so opening one of them
        // does not need another request.
        for (const homework of data.results) {
          if (state.details[homework.id]?.status === "loading") continue;
          state.details[homework.id] = loadedEntry(homework, fetchedAt);
        }
      })
      .addCase(fetchHomeworkList.rejected, (state, action) => {
        const key = homeworkListKey(action.meta.arg);
        state.lists[key] = failedEntry(
          state.lists[key],
          action.payload,
          LIST_ERROR,
        );
      })
      .addCase(fetchHomework.pending, (state, action) => {
        const { id } = action.meta.arg;
        state.details[id] = pendingEntry(state.details[id]);
      })
      .addCase(fetchHomework.fulfilled, (state, action) => {
        const homework = action.payload;
        state.details[homework.id] = loadedEntry(homework, Date.now());
        for (const entry of Object.values(state.lists)) {
          const index =
            entry.data?.results.findIndex((item) => item.id === homework.id) ??
            -1;
          if (entry.data && index >= 0) entry.data.results[index] = homework;
        }
      })
      .addCase(fetchHomework.rejected, (state, action) => {
        const { id } = action.meta.arg;
        state.details[id] = failedEntry(
          state.details[id],
          action.payload,
          DETAIL_ERROR,
        );
      })
      .addCase(logout, () => initialState)
      .addCase(loadMe.rejected, () => initialState)
      .addCase(login.fulfilled, () => initialState)
      .addCase(register.fulfilled, () => initialState);
  },
});

export const { homeworkSubmissionRemoved, homeworkSubmissionSaved } =
  homeworkSlice.actions;
export default homeworkSlice.reducer;
