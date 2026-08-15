import apiClient from "./apiClient";

export type CurrentLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type UserRole = "student" | "teacher" | "admin";

export type User = {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  current_level?: CurrentLevel | null;
  date_joined: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  access: string;
  refresh: string;
  user: User;
};

export type RegisterRequest = {
  email: string;
  password: string;
  full_name: string;
  current_level?: CurrentLevel | null;
};

export type RegisterResponse = {
  id: number;
  email: string;
  full_name: string;
  current_level?: CurrentLevel | null;
};

export type ForgotPasswordRequest = { email: string };

export type UpdateProfileRequest = {
  email: string;
  full_name: string;
  current_level?: CurrentLevel;
};

export type TokenRefreshRequest = {
  refresh: string;
};

export type TokenRefreshResponse = {
  access: string;
};

export const authApi = {
  login: async (data: LoginRequest) => {
    const response = await apiClient.post<AuthResponse>("/api/auth/login/", data);
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

  updateMe: async (data: UpdateProfileRequest) => {
    const response = await apiClient.patch<User>("/api/auth/me/", data);
    return response.data;
  },

  refreshToken: async (data: TokenRefreshRequest) => {
    const response = await apiClient.post<TokenRefreshResponse>("/api/auth/token/refresh/", data);
    return response.data;
  },
};
