import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthenticationModal from "./AuthenticationModal";

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  login: vi.fn((payload: unknown) => ({ type: "auth/login", payload })),
  register: vi.fn((payload: unknown) => ({ type: "auth/register", payload })),
  loadMe: vi.fn(() => ({ type: "auth/loadMe" })),
  features: { smsEnabled: false, loading: false },
  requestLoginCode: vi.fn(),
  requestPasswordReset: vi.fn(),
}));

vi.mock("./useAuthFeatures", () => ({
  useAuthFeatures: () => mocks.features,
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return {
    ...actual,
    authApi: {
      requestLoginCode: mocks.requestLoginCode,
      requestPasswordReset: mocks.requestPasswordReset,
    },
  };
});

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
    mocks.features = { smsEnabled: false, loading: false };
    mocks.requestLoginCode.mockResolvedValue({ detail: "sent" });
    mocks.requestPasswordReset.mockResolvedValue({ detail: "sent" });
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
    // The modal focuses the email field once it opens; wait for that first so
    // it cannot take focus away from the tabs mid-test.
    await waitFor(() => expect(screen.getByLabelText("ایمیل یا شماره موبایل")).toHaveFocus());
    await user.click(signupTab);
    expect(signupTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByLabelText("نام و نام خانوادگی")).toBeInTheDocument();
    expect(screen.getByLabelText("ایمیل")).toBeInTheDocument();
    expect(screen.getByLabelText("شماره موبایل")).toBeInTheDocument();
    expect(screen.getByTestId("authentication-form")).toHaveClass("grid", "grid-cols-1", "sm:grid-cols-2");
    expect(screen.getByRole("tabpanel").parentElement).toHaveClass("!overflow-visible");

    await user.keyboard("{Home}");
    expect(loginTab).toHaveAttribute("aria-selected", "true");
  });

  it("validates required login fields without dispatching an authentication request", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: "ورود و ادامه" }));

    expect(screen.getByText("ایمیل یا شماره موبایل را وارد کنید.")).toBeInTheDocument();
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

  it("logs in and reports the authenticated user without a duplicate profile request", async () => {
    const user = userEvent.setup();
    const { onAuthenticated } = renderModal();

    const emailInput = screen.getByLabelText("ایمیل یا شماره موبایل");
    await waitFor(() => expect(emailInput).toHaveFocus());
    await user.type(emailInput, "learner@example.com");
    await user.type(screen.getByLabelText("رمز عبور"), "secret-password");
    await user.click(screen.getByRole("button", { name: "ورود و ادامه" }));

    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledWith(authenticatedUser, "login"));
    expect(mocks.login).toHaveBeenCalledWith({
      email: "learner@example.com",
      password: "secret-password",
    });
    expect(mocks.loadMe).not.toHaveBeenCalled();
    expect(mocks.dispatch).toHaveBeenCalledOnce();
  });

  it("logs in with a mobile number typed in Persian digits", async () => {
    const user = userEvent.setup();
    const { onAuthenticated } = renderModal();

    await user.type(screen.getByLabelText("ایمیل یا شماره موبایل"), "۰۹۱۲ ۳۴۵ ۶۷۸۹");
    await user.type(screen.getByLabelText("رمز عبور"), "secret-password");
    await user.click(screen.getByRole("button", { name: "ورود و ادامه" }));

    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledWith(authenticatedUser, "login"));
    expect(mocks.login).toHaveBeenCalledWith({
      phone_number: "09123456789",
      password: "secret-password",
    });
  });

  it("rejects an identifier that is neither an email nor a mobile number", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText("ایمیل یا شماره موبایل"), "12345");
    await user.type(screen.getByLabelText("رمز عبور"), "secret-password");
    await user.click(screen.getByRole("button", { name: "ورود و ادامه" }));

    expect(screen.getByText(/ایمیل یا شماره موبایل معتبر نیست/)).toBeInTheDocument();
    expect(mocks.dispatch).not.toHaveBeenCalled();
  });

  it("registers with the required mobile number", async () => {
    const user = userEvent.setup();
    const { onAuthenticated } = renderModal();

    await user.click(screen.getByRole("tab", { name: "ثبت‌نام" }));
    await user.type(screen.getByLabelText("نام و نام خانوادگی"), "زبان‌آموز");
    await user.type(screen.getByLabelText("ایمیل"), "learner@example.com");
    await user.type(screen.getByLabelText("شماره موبایل"), "+989123456789");
    await user.type(screen.getByLabelText("رمز عبور"), "secret-password");
    await user.type(screen.getByLabelText("تکرار رمز عبور"), "secret-password");
    await user.click(screen.getByRole("button", { name: "ساخت حساب و ادامه" }));

    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledWith(authenticatedUser, "signup"));
    expect(mocks.register).toHaveBeenCalledWith({
      email: "learner@example.com",
      phone_number: "09123456789",
      password: "secret-password",
      full_name: "زبان‌آموز",
    });
  });

  it("asks only for an email to recover the password while SMS is off", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: "رمز عبور را فراموش کرده‌ام" }));
    expect(screen.getByText(/لینک تغییر رمز عبور برایت فرستاده شود/)).toBeInTheDocument();
    const emailInput = screen.getByLabelText("ایمیل");
    expect(emailInput).toHaveAttribute("type", "email");

    await user.type(emailInput, "09123456789");
    await user.click(screen.getByRole("button", { name: "ارسال لینک بازیابی" }));
    expect(screen.getByText("یک ایمیل معتبر وارد کنید.")).toBeInTheDocument();
    expect(mocks.requestPasswordReset).not.toHaveBeenCalled();

    await user.clear(emailInput);
    await user.type(emailInput, "learner@example.com");
    await user.click(screen.getByRole("button", { name: "ارسال لینک بازیابی" }));

    expect(await screen.findByText(/لینک تغییر رمز عبور برایش ارسال شد/)).toBeInTheDocument();
    expect(mocks.requestPasswordReset).toHaveBeenCalledWith("learner@example.com");
    expect(screen.queryByLabelText("رمز عبور")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "بازگشت به ورود" }));
    expect(screen.getByLabelText("رمز عبور")).toBeInTheDocument();
  });

  it("accepts a mobile number for recovery when SMS is on", async () => {
    mocks.features = { smsEnabled: true, loading: false };
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: "رمز عبور را فراموش کرده‌ام" }));

    expect(screen.getByLabelText("ایمیل یا شماره موبایل")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ارسال لینک یا کد بازیابی" })).toBeInTheDocument();
    // Recovery has its own screen, so the login method switch steps aside.
    expect(screen.queryByRole("radiogroup", { name: "روش ورود" })).not.toBeInTheDocument();
  });

  it("hides the login method switch while SMS is off", () => {
    renderModal();

    expect(screen.queryByRole("radiogroup", { name: "روش ورود" })).not.toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "با کد پیامکی" })).not.toBeInTheDocument();
  });

  it("logs in with a texted code when SMS is switched on", async () => {
    mocks.features = { smsEnabled: true, loading: false };
    const user = userEvent.setup();
    const { onAuthenticated } = renderModal();

    const passwordMethod = screen.getByRole("radio", { name: "با رمز عبور" });
    expect(passwordMethod).toHaveAttribute("aria-checked", "true");
    await user.click(screen.getByRole("radio", { name: "با کد پیامکی" }));
    expect(screen.getByRole("radio", { name: "با کد پیامکی" })).toHaveAttribute("aria-checked", "true");
    expect(screen.queryByLabelText("رمز عبور")).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("شماره موبایل"), "09123456789");
    await user.click(screen.getByRole("button", { name: "ارسال کد ورود" }));

    expect(await screen.findByLabelText("کد پیامک‌شده")).toBeInTheDocument();
    expect(mocks.requestLoginCode).toHaveBeenCalledWith("09123456789");
    await user.type(screen.getByLabelText("کد پیامک‌شده"), "۱۲۳۴۵۶");
    await user.click(screen.getByRole("button", { name: "ورود و ادامه" }));

    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledWith(authenticatedUser, "login"));
    expect(mocks.login).toHaveBeenCalledWith({ phone_number: "09123456789", code: "123456" });
  });

  it("closes from the header button", async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
