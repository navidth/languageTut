import apiClient from "./apiClient";

export type CurrentLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type UserRole = "student" | "teacher" | "admin";

export type User = {
  id: number;
  email: string;
  email_verified?: boolean;
  phone_number?: string | null;
  phone_verified?: boolean;
  full_name: string;
  role: UserRole;
  current_level?: CurrentLevel | null;
  date_joined: string;
};

/** Password login takes either an email or a phone number. */
export type LoginRequest =
  | { email: string; phone_number?: never; password: string }
  | { phone_number: string; email?: never; password: string };

export type PhoneLoginRequest = {
  phone_number: string;
  code: string;
};

export type AuthResponse = {
  access: string;
  refresh: string;
  user: User;
};

export type RegisterRequest = {
  email: string;
  phone_number: string;
  password: string;
  full_name: string;
};

export type RegisterResponse = {
  id: number;
  email: string;
  phone_number: string;
  full_name: string;
  current_level?: CurrentLevel | null;
};

/** Optional account features the backend has switched on. */
export type AuthFeatures = {
  sms_enabled: boolean;
};

export type DetailResponse = { detail: string };

export type SmsPasswordResetConfirmRequest = {
  phone_number: string;
  code: string;
  new_password: string;
};

export type EmailPasswordResetConfirmRequest = {
  email: string;
  /** 4 to 8 digits. */
  code: string;
  /** At least 8 characters. */
  new_password: string;
};

/** The `uid` and `token` come from the link in a password reset email. */
export type PasswordResetConfirmRequest = {
  uid: string;
  token: string;
  /** At least 8 characters. */
  new_password: string;
};

/**
 * Body of `PUT /api/auth/me/`, which replaces every editable field.
 * Role, level and the verified flags are read-only there.
 */
export type UserRequest = {
  email: string;
  phone_number: string;
  /** At most 255 characters. */
  full_name: string;
  /** Required when changing email or phone number. */
  current_password?: string;
};

/** Body of `PATCH /api/auth/me/`: only the fields being changed. */
export type PatchedUserRequest = Partial<UserRequest>;

export type TokenRefreshRequest = {
  refresh: string;
};

export type TokenRefreshResponse = {
  access: string;
};

/** Converts Persian and Arabic-Indic digits to ASCII digits. */
export function toLatinDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660));
}

/**
 * Returns the number in the `09123456789` form the API expects, or `null`
 * when it is not an Iranian mobile number. Spaces and a +98 prefix are fine.
 */
export function normalizeIranianMobile(value: string) {
  const digits = toLatinDigits(value).replace(/[\s()-]/g, "");
  const local = digits.replace(/^(?:\+98|0098|98|0)?(?=9\d{9}$)/, "0");
  return /^09\d{9}$/.test(local) ? local : null;
}

export const authApi = {
  login: async (data: LoginRequest) => {
    const response = await apiClient.post<AuthResponse>("/api/auth/login/", data);
    return response.data;
  },

  loginWithCode: async (data: PhoneLoginRequest) => {
    const response = await apiClient.post<AuthResponse>("/api/auth/login/code/", data);
    return response.data;
  },

  /** Answers the same whether or not the number has an account. */
  requestLoginCode: async (phone_number: string) => {
    const response = await apiClient.post<DetailResponse>("/api/auth/login/code/request/", { phone_number });
    return response.data;
  },

  features: async () => {
    const response = await apiClient.get<AuthFeatures>("/api/auth/features/");
    return response.data;
  },

  /** Revokes the refresh token; the access token expires on its own. */
  logout: async (refresh: string) => {
    await apiClient.post("/api/auth/logout/", { refresh });
  },

  /**
   * Emails a reset link carrying a `uid` and `token`, which the
   * /reset-password page confirms. The sign-in dialog uses the code instead.
   */
  requestPasswordReset: async (email: string) => {
    const response = await apiClient.post<DetailResponse>("/api/auth/password/reset/", { email });
    return response.data;
  },

  confirmPasswordReset: async (data: PasswordResetConfirmRequest) => {
    const response = await apiClient.post<DetailResponse>("/api/auth/password/reset/confirm/", data);
    return response.data;
  },

  /** Emails a reset code. Answers the same whether or not the address has an account. */
  requestEmailPasswordReset: async (email: string) => {
    const response = await apiClient.post<DetailResponse>("/api/auth/password/reset/email-code/", { email });
    return response.data;
  },

  confirmEmailPasswordReset: async (data: EmailPasswordResetConfirmRequest) => {
    const response = await apiClient.post<DetailResponse>("/api/auth/password/reset/email-code/confirm/", data);
    return response.data;
  },

  requestSmsPasswordReset: async (phone_number: string) => {
    const response = await apiClient.post<DetailResponse>("/api/auth/password/reset/sms/", { phone_number });
    return response.data;
  },

  confirmSmsPasswordReset: async (data: SmsPasswordResetConfirmRequest) => {
    const response = await apiClient.post<DetailResponse>("/api/auth/password/reset/sms/confirm/", data);
    return response.data;
  },

  /** Texts a code to the signed-in user's phone number. Needs SMS switched on. */
  requestPhoneVerification: async () => {
    const response = await apiClient.post<DetailResponse>("/api/auth/phone/verify/request/", {});
    return response.data;
  },

  verifyPhone: async (code: string) => {
    const response = await apiClient.post<DetailResponse>("/api/auth/phone/verify/", { code });
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await apiClient.post<RegisterResponse>("/api/auth/register/", data);
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get<User>("/api/auth/me/");
    return response.data;
  },

  /** PUT: sends all editable fields at once. */
  replaceMe: async (data: UserRequest) => {
    const response = await apiClient.put<User>("/api/auth/me/", data);
    return response.data;
  },

  /** PATCH: sends only the given fields; the rest stay as they are. */
  updateMe: async (data: PatchedUserRequest) => {
    const response = await apiClient.patch<User>("/api/auth/me/", data);
    return response.data;
  },

  refreshToken: async (data: TokenRefreshRequest) => {
    const response = await apiClient.post<TokenRefreshResponse>("/api/auth/token/refresh/", data);
    return response.data;
  },
};
