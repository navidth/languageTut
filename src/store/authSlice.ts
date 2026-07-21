import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authApi, LoginRequest, RegisterRequest, User } from "@/lib/auth";

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

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "خطایی در ارتباط با سرور رخ داد.";
}

export const login = createAsyncThunk("auth/login", async (payload: LoginRequest, api) => {
  try {
    const session = await authApi.login(payload);
    persistSession(session.access, session.refresh, session.user);
    const user = await authApi.getMe();
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch (error) {
    return api.rejectWithValue(errorMessage(error));
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
    return api.rejectWithValue(errorMessage(error));
  }
});

export const loadMe = createAsyncThunk("auth/me", async (_, api) => {
  try {
    if (!localStorage.getItem("accessToken")) return null;
    const user = await authApi.getMe();
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch (error) {
    return api.rejectWithValue(errorMessage(error));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.status = "idle";
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      document.cookie = "role=; path=/; Max-Age=0; SameSite=Lax";
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
      .addCase(loadMe.fulfilled, (state, action) => { state.user = action.payload; state.status = action.payload ? "authenticated" : "idle"; })
      .addCase(login.rejected, rejected)
      .addCase(register.rejected, rejected)
      .addCase(loadMe.rejected, rejected);
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
