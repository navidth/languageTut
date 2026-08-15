import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authApi, LoginRequest, RegisterRequest, User } from "@/lib/auth";
import { clearAuthStorage } from "@/lib/apiClient";
import { getApiErrorMessage } from "@/lib/apiErrors";

type AuthState = {
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "error";
  error: string | null;
};

const initialState: AuthState = { user: null, status: "idle", error: null };

function persistSession(access: string, refresh: string, user: User) {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
  localStorage.setItem("user", JSON.stringify(user));
  document.cookie = `role=${encodeURIComponent(user.role)}; path=/; SameSite=Lax`;
}

export const login = createAsyncThunk("auth/login", async (payload: LoginRequest, api) => {
  try {
    const session = await authApi.login(payload);
    persistSession(session.access, session.refresh, session.user);
    const user = await authApi.getMe();
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch (error) {
    return api.rejectWithValue(getApiErrorMessage(error, "ورود به حساب کاربری ناموفق بود."));
  }
});

export const register = createAsyncThunk("auth/register", async (payload: RegisterRequest, api) => {
  try {
    await authApi.register(payload);
    const session = await authApi.login({ email: payload.email, password: payload.password });
    persistSession(session.access, session.refresh, session.user);
    const user = await authApi.getMe();
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch (error) {
    return api.rejectWithValue(getApiErrorMessage(error, "ساخت حساب کاربری ناموفق بود."));
  }
});

export const loadMe = createAsyncThunk("auth/me", async (_, api) => {
  try {
    const user = await authApi.getMe();
    localStorage.setItem("user", JSON.stringify(user));
    document.cookie = `role=${encodeURIComponent(user.role)}; path=/; SameSite=Lax`;
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

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.status = "idle";
      state.error = null;
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
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
