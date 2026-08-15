import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthenticationModal from "./AuthenticationModal";

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  login: vi.fn((payload: unknown) => ({ type: "auth/login", payload })),
  register: vi.fn((payload: unknown) => ({ type: "auth/register", payload })),
  loadMe: vi.fn(() => ({ type: "auth/loadMe" })),
}));

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mocks.dispatch,
}));

vi.mock("@/store/authSlice", () => ({
  login: mocks.login,
  register: mocks.register,
  loadMe: mocks.loadMe,
}));

const authenticatedUser = {
  id: 7,
  email: "learner@example.com",
  full_name: "زبان‌آموز",
  role: "student" as const,
  current_level: "A2" as const,
  date_joined: "2026-08-10T00:00:00Z",
};

function renderModal(overrides: Partial<React.ComponentProps<typeof AuthenticationModal>> = {}) {
  const props = {
    open: true,
    profileError: "",
    onClose: vi.fn(),
    onAuthenticated: vi.fn(),
    ...overrides,
  };

  render(<AuthenticationModal {...props} />);
  return props;
}

describe("AuthenticationModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.dispatch.mockImplementation(() => ({
      unwrap: () => Promise.resolve(authenticatedUser),
    }));
  });

  it("uses the authentication tabs as the modal header without a brand title", () => {
    renderModal();

    const tablist = screen.getByRole("tablist", { name: "ورود یا ساخت حساب" });
    const header = tablist.parentElement?.parentElement;

    expect(screen.queryByText("ورود به ExamificatioN")).not.toBeInTheDocument();
    expect(tablist.closest(".max-w-2xl")).toBeInTheDocument();
    expect(tablist).toHaveClass("flex", "items-end", "gap-8");
    expect(screen.getByRole("tab", { name: "ورود" })).toHaveClass("auth-tab", "border-b-2");
    expect(header).toHaveClass("from-secondary-soft/80", "to-card", "[&>button]:shrink-0");
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("switches between login and sign-up tabs with mouse and keyboard", async () => {
    const user = userEvent.setup();
    renderModal();

    const loginTab = screen.getByRole("tab", { name: "ورود" });
    const signupTab = screen.getByRole("tab", { name: "ثبت‌نام" });

    expect(loginTab).toHaveAttribute("aria-selected", "true");
    await user.click(signupTab);
    expect(signupTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByLabelText("نام و نام خانوادگی")).toBeInTheDocument();
    expect(screen.getByTestId("authentication-form")).toHaveClass("grid", "grid-cols-1", "sm:grid-cols-2");
    expect(screen.getByRole("tabpanel").parentElement).toHaveClass("!overflow-visible");

    await user.keyboard("{Home}");
    expect(loginTab).toHaveAttribute("aria-selected", "true");
  });

  it("validates required login fields without dispatching an authentication request", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: "ورود و ادامه" }));

    expect(screen.getByText("یک ایمیل معتبر وارد کنید.")).toBeInTheDocument();
    expect(screen.getByText("رمز عبور را وارد کنید.")).toBeInTheDocument();
    expect(mocks.dispatch).not.toHaveBeenCalled();
  });

  it("toggles password visibility accessibly", async () => {
    const user = userEvent.setup();
    renderModal();

    const password = screen.getByLabelText("رمز عبور");
    expect(password).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "نمایش رمز عبور" }));
    expect(password).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "پنهان کردن رمز عبور" })).toHaveAttribute("aria-pressed", "true");
  });

  it("logs in, refreshes the profile, and reports the authenticated user", async () => {
    const user = userEvent.setup();
    const { onAuthenticated } = renderModal();

    const emailInput = screen.getByLabelText("ایمیل");
    await waitFor(() => expect(emailInput).toHaveFocus());
    await user.type(emailInput, "learner@example.com");
    await user.type(screen.getByLabelText("رمز عبور"), "secret-password");
    await user.click(screen.getByRole("button", { name: "ورود و ادامه" }));

    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledWith(authenticatedUser, "login"));
    expect(mocks.login).toHaveBeenCalledWith({
      email: "learner@example.com",
      password: "secret-password",
    });
    expect(mocks.loadMe).toHaveBeenCalledOnce();
    expect(mocks.dispatch).toHaveBeenCalledTimes(2);
  });

  it("closes from the header button", async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
