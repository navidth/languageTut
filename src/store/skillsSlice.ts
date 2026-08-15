import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getApiErrorMessage, getApiSuccessMessage } from "@/lib/apiErrors";
import {
  type PaginatedSkills,
  type PatchedSkillRequest,
  type Skill,
  type SkillRequest,
  skillsApi,
} from "@/lib/skills";

type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

type SkillsState = {
  items: Skill[];
  selected: Skill | null;
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  detailRequestedId: number | null;
  listStatus: RequestStatus;
  detailStatus: RequestStatus;
  mutationStatus: RequestStatus;
  listError: string | null;
  detailError: string | null;
  mutationError: string | null;
  successMessage: string | null;
};

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
};

type ThunkConfig = {
  state: { skills: SkillsState };
  rejectValue: string;
};

export const fetchSkills = createAsyncThunk<
  PaginatedSkills,
  number | undefined,
  ThunkConfig
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
    condition: (_, { getState }) =>
      getState().skills.listStatus !== "loading",
  },
);

export const fetchSkill = createAsyncThunk<Skill, number, ThunkConfig>(
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
      );
    },
  },
);

export const createSkill = createAsyncThunk<Skill, SkillRequest, ThunkConfig>(
  "skills/create",
  async (payload, api) => {
    try {
      return await skillsApi.create(payload);
    } catch (error) {
      return api.rejectWithValue(getApiErrorMessage(error, "ایجاد مهارت ناموفق بود."));
    }
  },
);

export const replaceSkill = createAsyncThunk<
  Skill,
  { id: number; data: SkillRequest },
  ThunkConfig
>("skills/update", async ({ id, data }, api) => {
  try {
    return await skillsApi.update(id, data);
  } catch (error) {
    return api.rejectWithValue(getApiErrorMessage(error, "ویرایش مهارت ناموفق بود."));
  }
});

export const updateSkill = createAsyncThunk<
  Skill,
  { id: number; data: PatchedSkillRequest },
  ThunkConfig
>("skills/patch", async ({ id, data }, api) => {
  try {
    return await skillsApi.patch(id, data);
  } catch (error) {
    return api.rejectWithValue(getApiErrorMessage(error, "ویرایش مهارت ناموفق بود."));
  }
});

export const deleteSkill = createAsyncThunk<number, number, ThunkConfig>(
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
    clearSelectedSkill(state) {
      state.selected = null;
      state.detailRequestedId = null;
      state.detailError = null;
      state.detailStatus = "idle";
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
        state.successMessage = getApiSuccessMessage(201, "مهارت با موفقیت ایجاد شد.");
      })
      .addCase(createSkill.rejected, mutationRejected)
      .addCase(replaceSkill.pending, mutationPending)
      .addCase(replaceSkill.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        updateStoredSkill(state, action.payload);
        state.successMessage = getApiSuccessMessage(200, "مهارت با موفقیت ویرایش شد.");
      })
      .addCase(replaceSkill.rejected, mutationRejected)
      .addCase(updateSkill.pending, mutationPending)
      .addCase(updateSkill.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        updateStoredSkill(state, action.payload);
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
        state.successMessage = getApiSuccessMessage(204, "مهارت با موفقیت حذف شد.");
      })
      .addCase(deleteSkill.rejected, mutationRejected);
  },
});

export const { clearSelectedSkill, clearSkillFeedback } = skillsSlice.actions;
export default skillsSlice.reducer;
