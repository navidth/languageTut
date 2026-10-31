import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthenticationModal from "@/components/auth/AuthenticationModal";

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  login: vi.fn((payload: unknown) => ({ type: "auth/login", payload })),
  register: vi.fn((payload: unknown) => ({ type: "auth/register", payload })),
  loadMe: vi.fn(() => ({ type: "auth/loadMe" })),
  features: { smsEnabled: false, loading: false },
  requestLoginCode: vi.fn(),
  requestEmailPasswordReset: vi.fn(),
  confirmEmailPasswordReset: vi.fn(),
  requestSmsPasswordReset: vi.fn(),
  confirmSmsPasswordReset: vi.fn(),
}));

vi.mock("@/hooks/useAuthFeatures", () => ({
  useAuthFeatures: () => mocks.features,
}));

vi.mock("@/lib/services/authApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/services/authApi")>();
  return {
    ...actual,
    authApi: {
      requestLoginCode: mocks.requestLoginCode,
      requestEmailPasswordReset: mocks.requestEmailPasswordReset,
      confirmEmailPasswordReset: mocks.confirmEmailPasswordReset,
      requestSmsPasswordReset: mocks.requestSmsPasswordReset,
      confirmSmsPasswordReset: mocks.confirmSmsPasswordReset,
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
    mocks.requestEmailPasswordReset.mockResolvedValue({ detail: "sent" });
    mocks.confirmEmailPasswordReset.mockResolvedValue({ detail: "changed" });
    mocks.requestSmsPasswordReset.mockResolvedValue({ detail: "sent" });
    mocks.confirmSmsPasswordReset.mockResolvedValue({ detail: "changed" });
  });

  it("uses the authentication tabs as the header, beside a close button and the brand panel", () => {
    renderModal();

    const tablist = screen.getByRole("tablist", { name: "ورود یا ساخت حساب" });

    expect(screen.queryByText("ورود به ExamificatioN")).not.toBeInTheDocument();
    // The wide dialog leaves room for the brand panel next to the form.
    expect(tablist.closest(".max-w-4xl")).toBeInTheDocument();
    expect(tablist).toHaveClass("flex", "items-end", "gap-8");
    expect(screen.getByRole("tab", { name: "ورود" })).toHaveClass("auth-tab", "border-b-2");
    expect(screen.getByRole("button", { name: "بستن" })).toBeInTheDocument();
    expect(screen.getByText("مسیر شخصی شما برای پیشرفت")).toBeInTheDocument();
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

    await user.keyboard("{Home}");
    expect(loginTab).toHaveAttribute("aria-selected", "true");
  });

  it("links to the other tab under the form", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: "ساخت حساب جدید" }));
    expect(screen.getByRole("tab", { name: "ثبت‌نام" })).toHaveAttribute("aria-selected", "true");

    await user.click(screen.getByRole("button", { name: "ورود به حساب" }));
    expect(screen.getByRole("tab", { name: "ورود" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByLabelText("رمز عبور")).toBeInTheDocument();
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

  it("resets the password with an emailed code and signs straight in", async () => {
    const user = userEvent.setup();
    const { onAuthenticated } = renderModal();

    await user.click(screen.getByRole("button", { name: "رمز عبور را فراموش کرده‌ام" }));
    expect(screen.getByText(/کد بازیابی برایت فرستاده شود/)).toBeInTheDocument();
    const emailInput = screen.getByLabelText("ایمیل");
    expect(emailInput).toHaveAttribute("type", "email");

    await user.type(emailInput, "09123456789");
    await user.click(screen.getByRole("button", { name: "ارسال کد بازیابی" }));
    expect(screen.getByText("یک ایمیل معتبر وارد کنید.")).toBeInTheDocument();
    expect(mocks.requestEmailPasswordReset).not.toHaveBeenCalled();

    await user.clear(emailInput);
    await user.type(emailInput, "learner@example.com");
    await user.click(screen.getByRole("button", { name: "ارسال کد بازیابی" }));

    expect(await screen.findByText(/کد بازیابی به آن فرستاده شد/)).toBeInTheDocument();
    expect(mocks.requestEmailPasswordReset).toHaveBeenCalledWith("learner@example.com");
    expect(emailInput).toHaveAttribute("readonly");
    const codeInput = screen.getByLabelText("کد ارسال‌شده به ایمیل");
    await waitFor(() => expect(codeInput).toHaveFocus());

    // The code is required, and the new password needs eight characters.
    await user.type(screen.getByLabelText("رمز عبور جدید"), "short");
    await user.click(screen.getByRole("button", { name: "تغییر رمز و ورود" }));
    expect(screen.getByText("کد بازیابی را وارد کنید.")).toBeInTheDocument();
    expect(screen.getByText("رمز عبور باید حداقل ۸ کاراکتر باشد.")).toBeInTheDocument();
    expect(mocks.confirmEmailPasswordReset).not.toHaveBeenCalled();

    await user.type(codeInput, "۱۲۳۴۵۶");
    // A complete code moves straight on to the new password.
    await waitFor(() => expect(screen.getByLabelText("رمز عبور جدید")).toHaveFocus());
    await user.clear(screen.getByLabelText("رمز عبور جدید"));
    await user.type(screen.getByLabelText("رمز عبور جدید"), "new-secret-password");
    await user.click(screen.getByRole("button", { name: "تغییر رمز و ورود" }));

    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledWith(authenticatedUser, "login"));
    expect(mocks.confirmEmailPasswordReset).toHaveBeenCalledWith({
      email: "learner@example.com",
      code: "123456",
      new_password: "new-secret-password",
    });
    expect(mocks.login).toHaveBeenCalledWith({ email: "learner@example.com", password: "new-secret-password" });
  });

  it("shows a rejected code and a weak password under their fields", async () => {
    const { AxiosError } = await import("axios");
    mocks.confirmEmailPasswordReset.mockRejectedValue(new AxiosError("x", "ERR_BAD_REQUEST", undefined, undefined, {
      status: 400,
      data: { code: ["Invalid or expired code."], new_password: ["This password is too common."] },
      statusText: "",
      headers: {},
      config: {},
    } as never));
    const user = userEvent.setup();
    const { onAuthenticated } = renderModal({ initialView: "forgot" });

    await user.type(screen.getByLabelText("ایمیل"), "learner@example.com");
    await user.click(screen.getByRole("button", { name: "ارسال کد بازیابی" }));
    await user.type(await screen.findByLabelText("کد ارسال‌شده به ایمیل"), "123456");
    await user.type(screen.getByLabelText("رمز عبور جدید"), "password123");
    await user.click(screen.getByRole("button", { name: "تغییر رمز و ورود" }));

    expect(await screen.findByText("کد واردشده درست نیست یا منقضی شده است.")).toBeInTheDocument();
    expect(screen.getByText("این رمز عبور بیش از حد رایج است. رمز دیگری انتخاب کنید.")).toBeInTheDocument();
    expect(onAuthenticated).not.toHaveBeenCalled();
    expect(mocks.dispatch).not.toHaveBeenCalled();

    // Editing the code clears its error; the password error stays.
    await user.type(screen.getByLabelText("کد ارسال‌شده به ایمیل"), "{Backspace}");
    expect(screen.queryByText("کد واردشده درست نیست یا منقضی شده است.")).not.toBeInTheDocument();
    expect(screen.getByText("این رمز عبور بیش از حد رایج است. رمز دیگری انتخاب کنید.")).toBeInTheDocument();
  });

  it("marks the code boxes red when the code is rejected in the general message", async () => {
    const { AxiosError } = await import("axios");
    mocks.confirmEmailPasswordReset.mockRejectedValue(new AxiosError("x", "ERR_BAD_REQUEST", undefined, undefined, {
      status: 400,
      data: { detail: "Invalid or expired code." },
      statusText: "",
      headers: {},
      config: {},
    } as never));
    const user = userEvent.setup();
    renderModal({ initialView: "forgot" });

    await user.type(screen.getByLabelText("ایمیل"), "learner@example.com");
    await user.click(screen.getByRole("button", { name: "ارسال کد بازیابی" }));
    const codeInput = await screen.findByLabelText("کد ارسال‌شده به ایمیل");
    await user.type(codeInput, "123456");
    await user.type(screen.getByLabelText("رمز عبور جدید"), "new-secret-password");
    await user.click(screen.getByRole("button", { name: "تغییر رمز و ورود" }));

    expect(await screen.findByText("کد واردشده درست نیست یا منقضی شده است.")).toBeInTheDocument();
    expect(codeInput).toHaveAttribute("aria-invalid", "true");
    expect(document.querySelectorAll("[data-invalid]")).toHaveLength(6);
  });

  it("returns to sign-in with the new password when signing in after the reset fails", async () => {
    mocks.dispatch.mockImplementation(() => ({ unwrap: () => Promise.reject("ورود ناموفق بود.") }));
    const user = userEvent.setup();
    const { onAuthenticated } = renderModal({ initialView: "forgot" });

    await user.type(screen.getByLabelText("ایمیل"), "learner@example.com");
    await user.click(screen.getByRole("button", { name: "ارسال کد بازیابی" }));
    await user.type(await screen.findByLabelText("کد ارسال‌شده به ایمیل"), "123456");
    await user.type(screen.getByLabelText("رمز عبور جدید"), "new-secret-password");
    await user.click(screen.getByRole("button", { name: "تغییر رمز و ورود" }));

    expect(await screen.findByText("رمز عبور تغییر کرد. با رمز جدید وارد شوید.")).toBeInTheDocument();
    expect(screen.getByLabelText("ایمیل یا شماره موبایل")).toHaveValue("learner@example.com");
    expect(screen.getByLabelText("رمز عبور")).toHaveValue("");
    expect(onAuthenticated).not.toHaveBeenCalled();
  });

  it("lets the visitor change the email or ask for another code", async () => {
    const user = userEvent.setup();
    renderModal({ initialView: "forgot" });

    await user.type(screen.getByLabelText("ایمیل"), "learner@example.com");
    await user.click(screen.getByRole("button", { name: "ارسال کد بازیابی" }));
    await user.click(await screen.findByRole("button", { name: "تغییر ایمیل یا ارسال دوباره کد" }));

    expect(screen.getByLabelText("ایمیل")).not.toHaveAttribute("readonly");
    expect(screen.queryByLabelText("کد ارسال‌شده به ایمیل")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "ارسال کد بازیابی" }));
    expect(mocks.requestEmailPasswordReset).toHaveBeenCalledTimes(2);
  });

  it("recovers by SMS code when SMS is on and a mobile number is given", async () => {
    mocks.features = { smsEnabled: true, loading: false };
    const user = userEvent.setup();
    const { onAuthenticated } = renderModal();

    await user.click(screen.getByRole("button", { name: "رمز عبور را فراموش کرده‌ام" }));
    // Recovery has its own screen, so the login method switch steps aside.
    expect(screen.queryByRole("radiogroup", { name: "روش ورود" })).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("ایمیل یا شماره موبایل"), "09123456789");
    await user.click(screen.getByRole("button", { name: "ارسال کد بازیابی" }));
    expect(mocks.requestSmsPasswordReset).toHaveBeenCalledWith("09123456789");

    await user.type(await screen.findByLabelText("کد پیامک‌شده"), "4321");
    await user.type(screen.getByLabelText("رمز عبور جدید"), "new-secret-password");
    await user.click(screen.getByRole("button", { name: "تغییر رمز و ورود" }));

    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledWith(authenticatedUser, "login"));
    expect(mocks.confirmSmsPasswordReset).toHaveBeenCalledWith({
      phone_number: "09123456789",
      code: "4321",
      new_password: "new-secret-password",
    });
    expect(mocks.login).toHaveBeenCalledWith({ phone_number: "09123456789", password: "new-secret-password" });
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

    await user.click(screen.getByRole("button", { name: "بستن" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
