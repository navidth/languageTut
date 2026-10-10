import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeStore } from "@/store";
import { fetchAuthFeatures, logout, selectSmsEnabled, updateProfile } from "./authSlice";

const mocks = vi.hoisted(() => ({
  features: vi.fn(),
  updateMe: vi.fn(),
  replaceMe: vi.fn(),
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return { ...actual, authApi: { ...actual.authApi, ...mocks } };
});

describe("auth features", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the features once and keeps them across sign-out", async () => {
    mocks.features.mockResolvedValue({ sms_enabled: true });
    const store = makeStore();

    await Promise.all([
      store.dispatch(fetchAuthFeatures()),
      store.dispatch(fetchAuthFeatures()),
    ]);
    await store.dispatch(fetchAuthFeatures());

    expect(mocks.features).toHaveBeenCalledOnce();
    expect(selectSmsEnabled(store.getState())).toBe(true);

    store.dispatch(logout());
    expect(selectSmsEnabled(store.getState())).toBe(true);
  });

  it("keeps SMS off when the features request fails", async () => {
    mocks.features.mockRejectedValue(new Error("offline"));
    const store = makeStore();

    await store.dispatch(fetchAuthFeatures());

    expect(store.getState().auth.featuresStatus).toBe("failed");
    expect(selectSmsEnabled(store.getState())).toBe(false);
  });
});

describe("updateProfile", () => {
  const saved = {
    id: 7,
    email: "new@example.com",
    phone_number: "09123456789",
    full_name: "نام",
    role: "student" as const,
    date_joined: "2026-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.updateMe.mockResolvedValue(saved);
    mocks.replaceMe.mockResolvedValue(saved);
  });

  it("uses PATCH for partial changes and PUT for a full replace", async () => {
    const store = makeStore();

    await store.dispatch(updateProfile({ method: "patch", data: { full_name: "نام" } }));
    expect(mocks.updateMe).toHaveBeenCalledWith({ full_name: "نام" });

    const full = { email: "new@example.com", phone_number: "09123456789", full_name: "نام", current_password: "pw" };
    await store.dispatch(updateProfile({ method: "put", data: full }));
    expect(mocks.replaceMe).toHaveBeenCalledWith(full);
    expect(store.getState().auth.user).toEqual(saved);
    expect(store.getState().auth.profileUpdateStatus).toBe("succeeded");
  });

  it("rejects with the message and the field errors", async () => {
    const store = makeStore();
    const { AxiosError } = await import("axios");
    mocks.updateMe.mockRejectedValue(new AxiosError("x", "ERR_BAD_REQUEST", undefined, undefined, {
      status: 400,
      data: { email: ["user with this email already exists."] },
      statusText: "",
      headers: {},
      config: {},
    } as never));

    const action = await store.dispatch(updateProfile({ method: "patch", data: { email: "taken@example.com" } }));

    expect(action.payload).toEqual({
      message: "ایمیل: این اطلاعات قبلاً ثبت شده است.",
      fieldErrors: { email: ["این اطلاعات قبلاً ثبت شده است."] },
    });
    expect(store.getState().auth.profileUpdateStatus).toBe("failed");
  });
});
