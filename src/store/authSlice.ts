import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  authApi,
  type LoginRequest,
  type RegisterRequest,
  type UpdateProfileRequest,
  type User,
} from "@/lib/auth";
import { clearAuthStorage } from "@/lib/apiClient";
import { getApiErrorMessage } from "@/lib/apiErrors";

type AuthState = {
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "error";
  error: string | null;
  profileUpdateStatus: "idle" | "loading" | "succeeded" | "failed";
  profileUpdateError: string | null;
};

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
  profileUpdateStatus: "idle",
  profileUpdateError: null,
};

function persistUser(user: User) {
  localStorage.setItem("user", JSON.stringify(user));
  document.cookie = `role=${encodeURIComponent(user.role)}; path=/; SameSite=Lax`;
}

function persistSession(access: string, refresh: string, user: User) {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
  persistUser(user);
}

export const login = createAsyncThunk("auth/login", async (payload: LoginRequest, api) => {
  try {
    const session = await authApi.login(payload);
    persistSession(session.access, session.refresh, session.user);
    return session.user;
  } catch (error) {
    return api.rejectWithValue(getApiErrorMessage(error, "ورود به حساب کاربری ناموفق بود."));
  }
});

export const register = createAsyncThunk("auth/register", async (payload: RegisterRequest, api) => {
  try {
    await authApi.register(payload);
    const session = await authApi.login({ email: payload.email, password: payload.password });
    persistSession(session.access, session.refresh, session.user);
    return session.user;
  } catch (error) {
    return api.rejectWithValue(getApiErrorMessage(error, "ساخت حساب کاربری ناموفق بود."));
  }
});

export const loadMe = createAsyncThunk("auth/me", async (_, api) => {
  try {
    const user = await authApi.getMe();
    persistUser(user);
    return user;
  } catch (error) {
    clearAuthStorage();
    return api.rejectWithValue(getApiErrorMessage(error, "دریافت اطلاعات حساب کاربری ناموفق بود."));
  }
}, {
  condition: (_, { getState }) => {
    const state = getState() as { auth: AuthState };
    return state.auth.status !== "loading";
  },
});

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (payload: UpdateProfileRequest, api) => {
    try {
      const user = await authApi.updateMe(payload);
      persistUser(user);
      return user;
    } catch (error) {
      return api.rejectWithValue(
        getApiErrorMessage(error, "ذخیره اطلاعات پروفایل ناموفق بود."),
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.status = "idle";
      state.error = null;
      state.profileUpdateStatus = "idle";
      state.profileUpdateError = null;
      clearAuthStorage();
    },
  },
  extraReducers(builder) {
    const pending = (state: AuthState) => { state.status = "loading" as const; state.error = null; };
    const rejected = (state: AuthState, action: { payload?: unknown }) => {
      state.status = "error";
      state.error = String(action.payload ?? "خطای ناشناخته");
    };
    builder
      .addCase(login.pending, pending)
      .addCase(register.pending, pending)
      .addCase(loadMe.pending, pending)
      .addCase(login.fulfilled, (state, action) => { state.user = action.payload; state.status = "authenticated"; })
      .addCase(register.fulfilled, (state, action) => { state.user = action.payload; state.status = "authenticated"; })
      .addCase(loadMe.fulfilled, (state, action) => { state.user = action.payload; state.status = "authenticated"; })
      .addCase(login.rejected, rejected)
      .addCase(register.rejected, rejected)
      .addCase(loadMe.rejected, (state, action) => {
        state.user = null;
        rejected(state, action);
      })
      .addCase(updateProfile.pending, (state) => {
        state.profileUpdateStatus = "loading";
        state.profileUpdateError = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "authenticated";
        state.profileUpdateStatus = "succeeded";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.profileUpdateStatus = "failed";
        state.profileUpdateError = String(
          action.payload ?? "ذخیره اطلاعات پروفایل ناموفق بود.",
        );
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
