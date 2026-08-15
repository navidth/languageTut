import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { normalizeApiError } from "./apiErrors";

export const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://2.144.27.2:8000";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const apiClient = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshRequest: Promise<string> | null = null;

export function clearAuthStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  document.cookie = "role=; path=/; Max-Age=0; SameSite=Lax";
  document.cookie = "access_token=; path=/; Max-Age=0; SameSite=Lax";
  document.cookie = "refresh_token=; path=/; Max-Age=0; SameSite=Lax";
}

async function getFreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("Refresh token is missing.");
  }

  if (!refreshRequest) {
    refreshRequest = refreshClient
      .post<{ access: string }>("/api/auth/token/refresh/", {
        refresh: refreshToken,
      })
      .then((response) => {
        localStorage.setItem("accessToken", response.data.access);
        return response.data.access;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

apiClient.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (typeof window === "undefined") {
      return Promise.reject(normalizeApiError(error));
    }

    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const requestUrl = originalRequest?.url ?? "";
    const isAuthenticationRequest =
      requestUrl.includes("/api/auth/login/") ||
      requestUrl.includes("/api/auth/register/") ||
      requestUrl.includes("/api/auth/token/refresh/");
    const hasRefreshToken = Boolean(localStorage.getItem("refreshToken"));

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthenticationRequest ||
      !hasRefreshToken
    ) {
      return Promise.reject(normalizeApiError(error));
    }

    originalRequest._retry = true;

    try {
      const accessToken = await getFreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearAuthStorage();
      // Student pages are intentionally public at the routing layer. Let their
      // existing loading/error UI handle an unauthenticated API response so
      // browser Back navigation is not replaced by a forced redirect.
      const isStudentRoute =
        window.location.pathname === "/student" ||
        window.location.pathname.startsWith("/student/");
      if (window.location.pathname !== "/" && !isStudentRoute) {
        window.location.assign("/");
      }
      return Promise.reject(normalizeApiError(refreshError));
    }
  },
);

export default apiClient;
