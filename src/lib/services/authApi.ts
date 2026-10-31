import apiClient from "@/lib/services/apiClient";
import type { LoginRequest, AuthResponse, PhoneLoginRequest, AuthFeatures, PasswordResetConfirmRequest, EmailPasswordResetConfirmRequest, SmsPasswordResetConfirmRequest, RegisterRequest, RegisterResponse, User, UserRequest, PatchedUserRequest } from "@/types/auth";
import type { DetailResponse } from "@/types/api";

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

  /** Confirms a reset from the `uid` and `token` in an emailed reset link. */
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
};
