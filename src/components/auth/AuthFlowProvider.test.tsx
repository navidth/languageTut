import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@/lib/auth";
import type { AuthenticationMode } from "@/lib/authFlow";
import { PLACEMENT_SECTION_ID } from "@/lib/routes";
import AuthFlowProvider from "./AuthFlowProvider";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  dispatch: vi.fn(),
  modalOnAuthenticated: null as null | ((user: User, mode: AuthenticationMode) => void),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mocks.dispatch,
  useAppSelector: (selector: (state: { auth: { status: "idle"; user: null } }) => unknown) =>
    selector({ auth: { status: "idle", user: null } }),
}));

vi.mock("@/store/authSlice", () => ({
  loadMe: vi.fn(() => ({ type: "auth/me" })),
}));

vi.mock("./AuthenticationModal", () => ({
  default: ({
    onAuthenticated,
  }: {
    onAuthenticated: (user: User, mode: AuthenticationMode) => void;
  }) => {
    mocks.modalOnAuthenticated = onAuthenticated;
    return null;
  },
}));

const newlyRegisteredStudent: User = {
  id: 24,
  email: "new-student@example.com",
  full_name: "زبان‌آموز جدید",
  role: "student",
  current_level: "A1",
  date_joined: "2026-08-14T00:00:00Z",
};

describe("AuthFlowProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.modalOnAuthenticated = null;
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    window.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
  });

  it("scrolls a newly registered user to the placement section instead of the dashboard", async () => {
    render(
      <AuthFlowProvider>
        <section id={PLACEMENT_SECTION_ID} tabIndex={-1}>
          <h2>شما چه سطحی هستید؟</h2>
        </section>
      </AuthFlowProvider>,
    );

    const placementSection = document.getElementById(PLACEMENT_SECTION_ID);
    expect(placementSection).not.toBeNull();
    const scrollIntoView = vi.fn();
    placementSection!.scrollIntoView = scrollIntoView;

    expect(mocks.modalOnAuthenticated).not.toBeNull();
    act(() => {
      mocks.modalOnAuthenticated?.(newlyRegisteredStudent, "signup");
    });

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: "auto",
        block: "start",
      });
    });
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
