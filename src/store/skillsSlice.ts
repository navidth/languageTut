import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getApiErrorMessage, getApiSuccessMessage } from "@/lib/services/apiErrors";
import { isCacheFresh } from "@/lib/utils/cache";
import { type PaginatedSkills, type PatchedSkillRequest, type Skill, type SkillRequest } from "@/types/skill";
import { skillsApi } from "@/lib/services/skillsApi";
import type { SkillsState, SkillsThunkConfig } from "@/types/store";


const initialState: SkillsState = {
  items: [],
  selected: null,
  count: 0,
  next: null,
  previous: null,
  page: 1,
  detailRequestedId: null,
  listStatus: "idle",
  detailStatus: "idle",
  mutationStatus: "idle",
  listError: null,
  detailError: null,
  mutationError: null,
  successMessage: null,
  listLastFetched: null,
  detailLastFetched: null,
};

export const fetchSkills = createAsyncThunk<
  PaginatedSkills,
  number | undefined,
  SkillsThunkConfig
>(
  "skills/list",
  async (page = 1, api) => {
    try {
      return await skillsApi.list(page);
    } catch (error) {
      return api.rejectWithValue(getApiErrorMessage(error, "دریافت مهارت‌ها ناموفق بود."));
    }
  },
  {
    condition: (page = 1, { getState }) => {
      const state = getState().skills;
      if (state.listStatus === "loading") return false;
      return state.page !== page || !isCacheFresh(state.listLastFetched);
    },
  },
);

export const fetchSkill = createAsyncThunk<Skill, number, SkillsThunkConfig>(
  "skills/retrieve",
  async (id, api) => {
    try {
      return await skillsApi.get(id);
    } catch (error) {
      return api.rejectWithValue(getApiErrorMessage(error, "دریافت مهارت ناموفق بود."));
    }
  },
  {
    condition: (id, { getState }) => {
      const state = getState().skills;
      return !(
        state.detailStatus === "loading" &&
        state.detailRequestedId === id
      ) && !(
        state.selected?.id === id &&
        isCacheFresh(state.detailLastFetched)
      );
    },
  },
);

export const createSkill = createAsyncThunk<Skill, SkillRequest, SkillsThunkConfig>(
  "skills/create",
  async (payload, api) => {
    try {
      return await skillsApi.create(payload);
    } catch (error) {
      return api.rejectWithValue(getApiErrorMessage(error, "ایجاد مهارت ناموفق بود."));
    }
  },
);

export const updateSkill = createAsyncThunk<
  Skill,
  { id: number; data: PatchedSkillRequest },
  SkillsThunkConfig
>("skills/patch", async ({ id, data }, api) => {
  try {
    return await skillsApi.patch(id, data);
  } catch (error) {
    return api.rejectWithValue(getApiErrorMessage(error, "ویرایش مهارت ناموفق بود."));
  }
});

export const deleteSkill = createAsyncThunk<number, number, SkillsThunkConfig>(
  "skills/delete",
  async (id, api) => {
    try {
      await skillsApi.remove(id);
      return id;
    } catch (error) {
      return api.rejectWithValue(getApiErrorMessage(error, "حذف مهارت ناموفق بود."));
    }
  },
);

function updateStoredSkill(state: SkillsState, skill: Skill) {
  const index = state.items.findIndex((item) => item.id === skill.id);
  if (index >= 0) state.items[index] = skill;
  if (state.selected?.id === skill.id) state.selected = skill;
}

const skillsSlice = createSlice({
  name: "skills",
  initialState,
  reducers: {
    clearSkillFeedback(state) {
      state.mutationError = null;
      state.successMessage = null;
      state.mutationStatus = "idle";
    },
  },
  extraReducers(builder) {
    const mutationPending = (state: SkillsState) => {
      state.mutationStatus = "loading" as const;
      state.mutationError = null;
      state.successMessage = null;
    };
    const mutationRejected = (
      state: SkillsState,
      action: { payload?: unknown },
    ) => {
      state.mutationStatus = "failed";
      state.mutationError = String(
        action.payload ?? "عملیات مهارت ناموفق بود.",
      );
    };

    builder
      .addCase(fetchSkills.pending, (state, action) => {
        state.listStatus = "loading";
        state.listError = null;
        state.page = action.meta.arg ?? 1;
      })
      .addCase(fetchSkills.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = action.payload.results;
        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
        state.listLastFetched = Date.now();
      })
      .addCase(fetchSkills.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError = String(
          action.payload ?? "دریافت مهارت‌ها ناموفق بود.",
        );
      })
      .addCase(fetchSkill.pending, (state, action) => {
        state.detailStatus = "loading";
        state.detailRequestedId = action.meta.arg;
        state.detailError = null;
        state.selected = null;
      })
      .addCase(fetchSkill.fulfilled, (state, action) => {
        if (state.detailRequestedId !== action.meta.arg) return;
        state.detailStatus = "succeeded";
        state.selected = action.payload;
        state.detailLastFetched = Date.now();
      })
      .addCase(fetchSkill.rejected, (state, action) => {
        if (state.detailRequestedId !== action.meta.arg) return;
        state.detailStatus = "failed";
        state.detailError = String(
          action.payload ?? "دریافت مهارت ناموفق بود.",
        );
      })
      .addCase(createSkill.pending, mutationPending)
      .addCase(createSkill.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        state.items.push(action.payload);
        state.items.sort((a, b) => a.order - b.order);
        state.count += 1;
        state.listLastFetched = Date.now();
        state.successMessage = getApiSuccessMessage(201, "مهارت با موفقیت ایجاد شد.");
      })
      .addCase(createSkill.rejected, mutationRejected)
      .addCase(updateSkill.pending, mutationPending)
      .addCase(updateSkill.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        updateStoredSkill(state, action.payload);
        state.listLastFetched = Date.now();
        state.successMessage = getApiSuccessMessage(200, "مهارت با موفقیت ویرایش شد.");
      })
      .addCase(updateSkill.rejected, mutationRejected)
      .addCase(deleteSkill.pending, mutationPending)
      .addCase(deleteSkill.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        state.items = state.items.filter(
          (item) => item.id !== action.payload,
        );
        if (state.selected?.id === action.payload) state.selected = null;
        state.count = Math.max(0, state.count - 1);
        state.listLastFetched = Date.now();
        state.successMessage = getApiSuccessMessage(204, "مهارت با موفقیت حذف شد.");
      })
      .addCase(deleteSkill.rejected, mutationRejected);
  },
});

export const { clearSkillFeedback } = skillsSlice.actions;
export default skillsSlice.reducer;
