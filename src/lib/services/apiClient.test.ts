import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import apiClient, { getJwtExpiry, hasStoredSession, isAccessTokenExpiring, refreshClient } from "@/lib/services/apiClient";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, SESSION_EXPIRED_EVENT } from "@/constants/storage";

type Adapter = (config: InternalAxiosRequestConfig) => Promise<AxiosResponse>;

function base64url(value: string) {
  return Buffer.from(value).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

/** An unsigned JWT shaped like the backend's, expiring in `expiresIn` seconds. */
function jwt(expiresIn: number) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({ token_type: "access", exp: Math.floor(Date.now() / 1000) + expiresIn, user_id: 28 }),
  );
  return `${header}.${payload}.signature`;
}

function ok(config: InternalAxiosRequestConfig, data: unknown): AxiosResponse {
  return { data, status: 200, statusText: "OK", headers: {}, config };
}

function unauthorized(config: InternalAxiosRequestConfig) {
  return new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, {}, {
    data: { detail: "Given token not valid for any token type", code: "token_not_valid" },
    status: 401,
    statusText: "Unauthorized",
    headers: {},
    config,
  });
}

const api = vi.fn<Adapter>();
const refresh = vi.fn<Adapter>();
const originalApiAdapter = apiClient.defaults.adapter;
const originalRefreshAdapter = refreshClient.defaults.adapter;

describe("apiClient session handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    apiClient.defaults.adapter = api;
    refreshClient.defaults.adapter = refresh;
    api.mockImplementation((config) => Promise.resolve(ok(config, { id: 28 })));
    refresh.mockImplementation((config) => Promise.resolve(ok(config, { access: "renewed-access" })));
  });

  afterEach(() => {
    apiClient.defaults.adapter = originalApiAdapter;
    refreshClient.defaults.adapter = originalRefreshAdapter;
  });

  it("sends the stored access token as a bearer header", async () => {
    const access = jwt(3600);
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, "refresh-1");

    await apiClient.get("/api/auth/me/");

    expect(api).toHaveBeenCalledOnce();
    expect(api.mock.calls[0][0].headers.get("Authorization")).toBe(`Bearer ${access}`);
    expect(refresh).not.toHaveBeenCalled();
  });

  it("renews an expiring access token before the request and shares one refresh between concurrent requests", async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, jwt(10));
    localStorage.setItem(REFRESH_TOKEN_KEY, "refresh-1");

    await Promise.all([apiClient.get("/api/auth/me/"), apiClient.get("/api/me/courses/")]);

    expect(refresh).toHaveBeenCalledOnce();
    expect(refresh.mock.calls[0][0].data).toBe(JSON.stringify({ refresh: "refresh-1" }));
    expect(api).toHaveBeenCalledTimes(2);
    for (const [config] of api.mock.calls) {
      expect(config.headers.get("Authorization")).toBe("Bearer renewed-access");
    }
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe("renewed-access");
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe("refresh-1");
  });

  it("refreshes once and retries when the server rejects a token that looked fresh", async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, jwt(3600));
    localStorage.setItem(REFRESH_TOKEN_KEY, "refresh-1");
    api
      .mockImplementationOnce((config) => Promise.reject(unauthorized(config)))
      .mockImplementationOnce((config) => Promise.resolve(ok(config, { id: 28 })));

    const response = await apiClient.get("/api/auth/me/");

    expect(response.data).toEqual({ id: 28 });
    expect(refresh).toHaveBeenCalledOnce();
    expect(api).toHaveBeenCalledTimes(2);
    expect(api.mock.calls[1][0].headers.get("Authorization")).toBe("Bearer renewed-access");
  });

  it("ends the session when the refresh token is rejected", async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, jwt(10));
    localStorage.setItem(REFRESH_TOKEN_KEY, "stale-refresh");
    localStorage.setItem("user", "{}");
    refresh.mockImplementation((config) => Promise.reject(unauthorized(config)));
    const expired = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, expired);

    await expect(apiClient.get("/api/auth/me/")).rejects.toMatchObject({
      kind: "authentication",
      message: "نشست شما منقضی شده است. لطفاً دوباره وارد شوید.",
    });

    expect(api).not.toHaveBeenCalled();
    expect(hasStoredSession()).toBe(false);
    expect(localStorage.getItem("user")).toBeNull();
    expect(expired).toHaveBeenCalledOnce();
    window.removeEventListener(SESSION_EXPIRED_EVENT, expired);
  });

  it("keeps the session when the refresh fails for a network reason", async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, jwt(10));
    localStorage.setItem(REFRESH_TOKEN_KEY, "refresh-1");
    refresh.mockImplementation((config) => Promise.reject(new AxiosError("Network Error", "ERR_NETWORK", config)));
    const expired = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, expired);

    await expect(apiClient.get("/api/auth/me/")).rejects.toMatchObject({ kind: "network" });

    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe("refresh-1");
    expect(expired).not.toHaveBeenCalled();
    window.removeEventListener(SESSION_EXPIRED_EVENT, expired);
  });

  it("never refreshes for sign-in requests", async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, jwt(10));
    localStorage.setItem(REFRESH_TOKEN_KEY, "refresh-1");
    api.mockImplementation((config) => Promise.reject(unauthorized(config)));

    await expect(apiClient.post("/api/auth/login/", { email: "a@b.c", password: "x" })).rejects.toMatchObject({
      status: 401,
    });

    expect(refresh).not.toHaveBeenCalled();
    expect(api).toHaveBeenCalledOnce();
  });

  it.each([
    "/api/auth/login/",
    "/api/auth/password/reset/email-code/",
    "/api/auth/password/reset/email-code/confirm/",
    "/api/auth/password/reset/confirm/",
  ])("sends %s without the stored token, so an expired one cannot block it", async (url) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, jwt(-60));
    localStorage.setItem(REFRESH_TOKEN_KEY, "stale-refresh");

    await apiClient.post(url, {});

    expect(api.mock.calls[0][0].headers.get("Authorization")).toBeUndefined();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("sends anonymous requests without a header and without refreshing", async () => {
    await apiClient.get("/api/homework/");

    expect(api.mock.calls[0][0].headers.get("Authorization")).toBeUndefined();
    expect(refresh).not.toHaveBeenCalled();
  });
});

describe("JWT expiry", () => {
  it("reads the exp claim in milliseconds", () => {
    const expiry = getJwtExpiry(jwt(3600));
    expect(expiry).not.toBeNull();
    expect(Math.round((expiry! - Date.now()) / 1000)).toBeCloseTo(3600, -1);
  });

  it("returns null for tokens it cannot read", () => {
    expect(getJwtExpiry("not-a-jwt")).toBeNull();
    expect(getJwtExpiry("a.!!!.c")).toBeNull();
    expect(getJwtExpiry(`a.${base64url(JSON.stringify({ user_id: 1 }))}.c`)).toBeNull();
  });

  it("treats a token as expiring inside the skew and unreadable tokens as fresh", () => {
    expect(isAccessTokenExpiring(jwt(10))).toBe(true);
    expect(isAccessTokenExpiring(jwt(-60))).toBe(true);
    expect(isAccessTokenExpiring(jwt(3600))).toBe(false);
    expect(isAccessTokenExpiring("opaque-token")).toBe(false);
  });
});
