import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LandingAuthCheck, { INITIAL_ROLE_REDIRECT_KEY } from "./LandingAuthCheck";

const mocks = vi.hoisted(() => ({
  authState: {
    status: "idle" as "idle" | "loading" | "authenticated" | "error",
    user: null as null | {
      id: number;
      email: string;
      full_name: string;
      role: "student" | "teacher" | "admin";
      date_joined: string;
    },
  },
  dispatch: vi.fn(),
  push: vi.fn(),
  loadMe: vi.fn(() => ({ type: "auth/me" })),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mocks.dispatch,
  useAppSelector: (selector: (state: { auth: typeof mocks.authState }) => unknown) =>
    selector({ auth: mocks.authState }),
}));

vi.mock("@/store/authSlice", () => ({
  loadMe: mocks.loadMe,
}));

const teacher = {
  id: 12,
  email: "teacher@example.com",
  full_name: "مدرس",
  role: "teacher" as const,
  date_joined: "2026-08-10T00:00:00Z",
};

describe("LandingAuthCheck", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    mocks.authState.status = "idle";
    mocks.authState.user = null;
  });

  it("redirects a returning user once according to their role", async () => {
    localStorage.setItem("accessToken", "stored-token");
    const view = render(
      <LandingAuthCheck><span>صفحه اصلی</span></LandingAuthCheck>,
    );

    expect(screen.getByText("صفحه اصلی")).toBeInTheDocument();
    await waitFor(() => expect(mocks.dispatch).toHaveBeenCalledWith({ type: "auth/me" }));

    mocks.authState.status = "authenticated";
    mocks.authState.user = teacher;
    view.rerender(<LandingAuthCheck><span>صفحه اصلی</span></LandingAuthCheck>);

    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/teacher"));
    expect(sessionStorage.getItem(INITIAL_ROLE_REDIRECT_KEY)).toBe("1");
  });

  it("does not redirect again after browser Back returns to the landing page", async () => {
    localStorage.setItem("refreshToken", "stored-refresh-token");
    sessionStorage.setItem(INITIAL_ROLE_REDIRECT_KEY, "1");
    const view = render(
      <LandingAuthCheck><span>صفحه اصلی</span></LandingAuthCheck>,
    );

    await waitFor(() => expect(mocks.dispatch).toHaveBeenCalled());
    mocks.authState.status = "authenticated";
    mocks.authState.user = teacher;
    view.rerender(<LandingAuthCheck><span>صفحه اصلی</span></LandingAuthCheck>);

    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("leaves the existing fresh-login flow in control when no prior session existed", () => {
    const view = render(
      <LandingAuthCheck><span>صفحه اصلی</span></LandingAuthCheck>,
    );

    mocks.authState.status = "authenticated";
    mocks.authState.user = { ...teacher, role: "student" };
    view.rerender(<LandingAuthCheck><span>صفحه اصلی</span></LandingAuthCheck>);

    expect(mocks.dispatch).not.toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
