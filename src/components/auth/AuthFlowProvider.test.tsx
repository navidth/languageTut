import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@/lib/auth";
import type { AuthenticationMode } from "@/lib/authFlow";
import { PLACEMENT_SECTION_ID } from "@/lib/routes";
import AuthFlowProvider, { useAuthFlow } from "./AuthFlowProvider";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  dispatch: vi.fn(),
  modalOpen: null as null | boolean,
  modalView: null as null | string,
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
  fetchAuthFeatures: vi.fn(() => ({ type: "auth/features" })),
}));

vi.mock("./AuthenticationModal", () => ({
  default: ({
    open,
    initialView,
    onAuthenticated,
  }: {
    open: boolean;
    initialView: string;
    onAuthenticated: (user: User, mode: AuthenticationMode) => void;
  }) => {
    mocks.modalOpen = open;
    mocks.modalView = initialView;
    mocks.modalOnAuthenticated = onAuthenticated;
    return null;
  },
}));

function SignInButton() {
  const { startAuthFlow } = useAuthFlow();
  return (
    <button type="button" onClick={() => void startAuthFlow()}>
      ورود
    </button>
  );
}

function RecoveryButton() {
  const { startAuthFlow } = useAuthFlow();
  return (
    <button type="button" onClick={() => void startAuthFlow("learning", { view: "forgot" })}>
      بازیابی
    </button>
  );
}

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
    localStorage.clear();
    mocks.modalOpen = null;
    mocks.modalOnAuthenticated = null;
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    window.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
  });

  it("loads the authentication modal only once someone starts signing in", async () => {
    render(
      <AuthFlowProvider>
        <SignInButton />
      </AuthFlowProvider>,
    );

    expect(mocks.modalOpen).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "ورود" }));

    await waitFor(() => expect(mocks.modalOpen).toBe(true));
    expect(mocks.modalView).toBe("password");
  });

  it("opens the dialog on the recovery screen when asked", async () => {
    render(
      <AuthFlowProvider>
        <RecoveryButton />
      </AuthFlowProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "بازیابی" }));

    await waitFor(() => expect(mocks.modalOpen).toBe(true));
    expect(mocks.modalView).toBe("forgot");
  });

  it("scrolls a newly registered user to the placement section instead of the dashboard", async () => {
    render(
      <AuthFlowProvider>
        <SignInButton />
        <section id={PLACEMENT_SECTION_ID} tabIndex={-1}>
          <h2>شما چه سطحی هستید؟</h2>
        </section>
      </AuthFlowProvider>,
    );

    const placementSection = document.getElementById(PLACEMENT_SECTION_ID);
    expect(placementSection).not.toBeNull();
    const scrollIntoView = vi.fn();
    placementSection!.scrollIntoView = scrollIntoView;

    fireEvent.click(screen.getByRole("button", { name: "ورود" }));
    await waitFor(() => expect(mocks.modalOnAuthenticated).not.toBeNull());
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
