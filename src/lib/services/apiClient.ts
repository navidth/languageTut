import axios, { AxiosError } from "axios";
import { normalizeApiError } from "@/lib/services/apiErrors";
import { BACKEND_BASE_URL, ACCESS_TOKEN_SKEW_MS } from "@/constants/api";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, SESSION_EXPIRED_EVENT } from "@/constants/storage";
import type { RetryableRequestConfig } from "@/types/api";

const jsonHeaders = { "Content-Type": "application/json" };

const apiClient = axios.create({ baseURL: BACKEND_BASE_URL, headers: jsonHeaders });

/**
 * Refresh calls use their own instance so they skip the interceptors below.
 * Exported for tests, which replace both adapters.
 */
export const refreshClient = axios.create({ baseURL: BACKEND_BASE_URL, headers: jsonHeaders });

let refreshRequest: Promise<string> | null = null;

export function storeTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function getStoredRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearAuthStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  document.cookie = "role=; path=/; Max-Age=0; SameSite=Lax";
  document.cookie = "access_token=; path=/; Max-Age=0; SameSite=Lax";
  document.cookie = "refresh_token=; path=/; Max-Age=0; SameSite=Lax";
}

export function hasStoredSession() {
  if (typeof window === "undefined") return false;
  return Boolean(
    localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY),
  );
}

/** The `exp` claim of a JWT as a millisecond timestamp, or `null` when the token cannot be read. */
export function getJwtExpiry(token: string): number | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const claims: unknown = JSON.parse(atob(padded));
    const exp = (claims as { exp?: unknown } | null)?.exp;
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * True when the access token has expired or will within the skew. A token
 * without a readable `exp` counts as fresh, so the server decides.
 */
export function isAccessTokenExpiring(token: string, now = Date.now()) {
  const expiry = getJwtExpiry(token);
  return expiry !== null && expiry - now <= ACCESS_TOKEN_SKEW_MS;
}

/**
 * Sign-in, sign-up, token refresh and password reset are for visitors without
 * a session. They are sent without a bearer token, because the backend answers
 * 401 to any request carrying an expired one, even on these public endpoints.
 */
function isPublicAuthRequest(url = "") {
  return (
    url.includes("/api/auth/login/") ||
    url.includes("/api/auth/register/") ||
    url.includes("/api/auth/token/refresh/") ||
    url.includes("/api/auth/password/reset/")
  );
}

/**
 * The refresh token itself was rejected (expired, revoked or malformed). A
 * network or server failure is not a reason to drop the session.
 */
function isRefreshRejected(error: unknown) {
  if (!axios.isAxiosError(error)) return true;
  const status = error.response?.status;
  return status !== undefined && status >= 400 && status < 500;
}

/**
 * Ends the session everywhere: storage, the store (through the event) and,
 * away from the public and student pages, the current URL.
 */
function expireSession() {
  clearAuthStorage();
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  const path = window.location.pathname;
  // Student pages are intentionally public at the routing layer. Let their
  // existing loading/error UI handle an unauthenticated API response so
  // browser Back navigation is not replaced by a forced redirect.
  const isStudentRoute = path === "/student" || path.startsWith("/student/");
  if (path !== "/" && !isStudentRoute) {
    window.location.assign("/");
  }
}

/** One refresh at a time: concurrent callers share the same request. */
async function getFreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!refreshToken) {
    throw new Error("Refresh token is missing.");
  }

  if (!refreshRequest) {
    refreshRequest = refreshClient
      .post<{ access: string; refresh?: string }>("/api/auth/token/refresh/", {
        refresh: refreshToken,
      })
      .then((response) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, response.data.access);
        // Ready for the day the backend starts rotating refresh tokens.
        if (response.data.refresh) {
          localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refresh);
        }
        return response.data.access;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

/** Refreshes the access token; a rejected refresh token ends the session. */
async function refreshOrExpire() {
  try {
    return await getFreshAccessToken();
  } catch (error) {
    if (isRefreshRejected(error)) expireSession();
    throw normalizeApiError(error);
  }
}

apiClient.interceptors.request.use(async (config) => {
  if (typeof window === "undefined" || isPublicAuthRequest(config.url)) {
    return config;
  }

  let accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

  // Proactive refresh: the usual case of coming back after an hour away costs
  // no failed round trip, because the token is renewed before the request.
  if (
    accessToken &&
    isAccessTokenExpiring(accessToken) &&
    localStorage.getItem(REFRESH_TOKEN_KEY)
  ) {
    accessToken = await refreshOrExpire();
  }

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

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isPublicAuthRequest(originalRequest.url) ||
      !localStorage.getItem(REFRESH_TOKEN_KEY)
    ) {
      return Promise.reject(normalizeApiError(error));
    }

    // The server rejected a token that still looked fresh here (revoked, or a
    // clock difference the proactive check missed): refresh once and retry.
    originalRequest._retry = true;
    const accessToken = await refreshOrExpire();
    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    return apiClient(originalRequest);
  },
);

export default apiClient;
