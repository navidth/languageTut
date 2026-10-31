import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authApi } from "@/lib/services/authApi";
import { type AuthFeatures, type LoginRequest, type PhoneLoginRequest, type RegisterRequest, type User } from "@/types/auth";
import { clearAuthStorage, getStoredRefreshToken, storeTokens } from "@/lib/services/apiClient";
import { getApiErrorMessage, normalizeApiError } from "@/lib/services/apiErrors";
import { isCacheFresh } from "@/lib/utils/cache";
import type { AuthState, ProfileUpdate, ProfileUpdateError } from "@/types/store";

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
  profileUpdateStatus: "idle",
  profileUpdateError: null,
  features: null,
  featuresStatus: "idle",
  featuresLastFetched: null,
};

/** Features are the same for every visitor, so they survive sign-in and sign-out. */
export const fetchAuthFeatures = createAsyncThunk<
  AuthFeatures,
  void,
  { state: { auth: AuthState }; rejectValue: string }
>(
  "auth/features",
  async (_, api) => {
    try {
      return await authApi.features();
    } catch (error) {
      return api.rejectWithValue(getApiErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const { featuresStatus, featuresLastFetched } = getState().auth;
      return featuresStatus !== "loading" && !isCacheFresh(featuresLastFetched);
    },
  },
);

/** SMS flows stay hidden until the backend says they are on. */
export function selectSmsEnabled(state: { auth: AuthState }) {
  return state.auth.features?.sms_enabled === true;
}

function persistUser(user: User) {
  localStorage.setItem("user", JSON.stringify(user));
  document.cookie = `role=${encodeURIComponent(user.role)}; path=/; SameSite=Lax`;
}

function persistSession(access: string, refresh: string, user: User) {
  storeTokens(access, refresh);
  persistUser(user);
}

// Password and SMS-code logins share one thunk, so every slice that resets on
// `login.fulfilled` covers both.
export const login = createAsyncThunk("auth/login", async (payload: LoginRequest | PhoneLoginRequest, api) => {
  try {
    const session = "code" in payload
      ? await authApi.loginWithCode(payload)
      : await authApi.login(payload);
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

export const updateProfile = createAsyncThunk<
  User,
  ProfileUpdate,
  { rejectValue: ProfileUpdateError }
>(
  "auth/updateProfile",
  async (payload, api) => {
    try {
      const user = payload.method === "put"
        ? await authApi.replaceMe(payload.data)
        : await authApi.updateMe(payload.data);
      persistUser(user);
      return user;
    } catch (error) {
      const apiError = normalizeApiError(error, "ذخیره اطلاعات پروفایل ناموفق بود.");
      return api.rejectWithValue({
        message: apiError.message,
        fieldErrors: apiError.fieldErrors,
      });
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
      .addCase(fetchAuthFeatures.pending, (state) => {
        state.featuresStatus = "loading";
      })
      .addCase(fetchAuthFeatures.fulfilled, (state, action) => {
        state.features = action.payload;
        state.featuresStatus = "succeeded";
        state.featuresLastFetched = Date.now();
      })
      .addCase(fetchAuthFeatures.rejected, (state) => {
        // Keeps the last known answer; with none, SMS stays off.
        state.featuresStatus = "failed";
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
        state.profileUpdateError =
          action.payload?.message ?? "ذخیره اطلاعات پروفایل ناموفق بود.";
      });
  },
});

export const { logout } = authSlice.actions;

/** Signs out locally at once, then asks the server to revoke the refresh token. */
export const signOut = createAsyncThunk("auth/signOut", async (_, api) => {
  const refresh = getStoredRefreshToken();
  api.dispatch(logout());
  if (refresh) await authApi.logout(refresh).catch(() => undefined);
});
export default authSlice.reducer;
