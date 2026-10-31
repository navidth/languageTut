import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toApiErrorInfo } from "@/lib/services/apiErrors";
import { homeworkApi } from "@/lib/services/homeworkApi";
import { isFullSubmission, toSubmissionSummary } from "@/lib/presentation/homework";
import { type Homework, type HomeworkSubmission, type HomeworkSubmissionSummary } from "@/types/homework";
import type { Paginated } from "@/types/api";
import { loadMe, login, logout, register } from "@/store/authSlice";
import { failedEntry, loadedEntry, pendingEntry, shouldFetch } from "@/store/entries";
import type { HomeworkState, HomeworkListFilters, HomeworkThunkConfig } from "@/types/store";

const initialState: HomeworkState = { lists: {}, details: {}, submissions: {} };

const LIST_ERROR = "دریافت تکالیف ناموفق بود.";
const DETAIL_ERROR = "دریافت اطلاعات تکلیف ناموفق بود.";
const SUBMISSION_ERROR = "دریافت جزئیات پاسخ ارسال‌شده ناموفق بود.";

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
    condition: ({ force, ...filters }, { getState }) =>
      shouldFetch(getState().homework.lists[homeworkListKey(filters)], force),
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
    condition: ({ id, force }, { getState }) =>
      shouldFetch(getState().homework.details[id], force),
  },
);

/**
 * Loads the student's full submission; the homework itself only carries its
 * summary.
 */
export const fetchHomeworkSubmission = createAsyncThunk<
  HomeworkSubmission,
  { id: number; force?: boolean },
  HomeworkThunkConfig
>(
  "homework/submission",
  async ({ id }, api) => {
    try {
      return await homeworkApi.getSubmission(id);
    } catch (error) {
      return api.rejectWithValue(toApiErrorInfo(error, SUBMISSION_ERROR));
    }
  },
  {
    condition: ({ id, force }, { getState }) =>
      shouldFetch(getState().homework.submissions[id], force),
  },
);

/**
 * Keeps a full `my_submission` as the submission record, so the detail page
 * does not request it again. A summary-only one is left for that request.
 */
function cacheEmbeddedSubmission(
  state: HomeworkState,
  homework: Homework,
  fetchedAt: number,
) {
  const submission = homework.my_submission;
  if (!isFullSubmission(submission)) return;
  if (state.submissions[submission.id]?.status === "loading") return;
  state.submissions[submission.id] = loadedEntry(submission, fetchedAt);
}

/** Applies a submission change to every cached copy of the homework. */
function setCachedSubmission(
  state: HomeworkState,
  homeworkId: number,
  submission: HomeworkSubmissionSummary | null,
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
      const { homeworkId, submission } = action.payload;
      setCachedSubmission(state, homeworkId, toSubmissionSummary(submission));
      state.submissions[submission.id] = loadedEntry(submission);
    },
    homeworkSubmissionRemoved(
      state,
      action: PayloadAction<{ homeworkId: number; submissionId: number }>,
    ) {
      setCachedSubmission(state, action.payload.homeworkId, null);
      delete state.submissions[action.payload.submissionId];
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
          cacheEmbeddedSubmission(state, homework, fetchedAt);
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
        const fetchedAt = Date.now();
        state.details[homework.id] = loadedEntry(homework, fetchedAt);
        cacheEmbeddedSubmission(state, homework, fetchedAt);
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
      .addCase(fetchHomeworkSubmission.pending, (state, action) => {
        const { id } = action.meta.arg;
        state.submissions[id] = pendingEntry(state.submissions[id]);
      })
      .addCase(fetchHomeworkSubmission.fulfilled, (state, action) => {
        const submission = action.payload;
        state.submissions[submission.id] = loadedEntry(submission);
      })
      .addCase(fetchHomeworkSubmission.rejected, (state, action) => {
        const { id } = action.meta.arg;
        state.submissions[id] = failedEntry(
          state.submissions[id],
          action.payload,
          SUBMISSION_ERROR,
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
