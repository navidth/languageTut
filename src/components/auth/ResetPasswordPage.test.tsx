import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ResetPasswordPage from "./ResetPasswordPage";

const mocks = vi.hoisted(() => ({
  confirmPasswordReset: vi.fn(),
  startAuthFlow: vi.fn(),
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return { ...actual, authApi: { confirmPasswordReset: mocks.confirmPasswordReset } };
});

vi.mock("./AuthFlowProvider", () => ({
  useAuthFlow: () => ({ startAuthFlow: mocks.startAuthFlow, busy: false }),
}));

function badRequest(data: unknown) {
  return new AxiosError("x", "ERR_BAD_REQUEST", undefined, undefined, {
    status: 400,
    data,
    statusText: "",
    headers: {},
    config: {},
  } as never);
}

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.confirmPasswordReset.mockResolvedValue({ detail: "changed" });
  });

  it("sets the new password from the link and offers sign-in", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordPage uid="MjI" token="abc-123" />);

    expect(screen.getByRole("heading", { name: "رمز عبور جدید بساز" })).toBeInTheDocument();
    await user.type(screen.getByLabelText("رمز عبور جدید"), "short");
    await user.click(screen.getByRole("button", { name: "ذخیره رمز عبور جدید" }));
    expect(screen.getByText("رمز عبور باید حداقل ۸ کاراکتر باشد.")).toBeInTheDocument();
    expect(mocks.confirmPasswordReset).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText("رمز عبور جدید"));
    await user.type(screen.getByLabelText("رمز عبور جدید"), "new-secret-password");
    await user.click(screen.getByRole("button", { name: "ذخیره رمز عبور جدید" }));

    expect(await screen.findByRole("heading", { name: "رمز عبور تغییر کرد" })).toBeInTheDocument();
    expect(mocks.confirmPasswordReset).toHaveBeenCalledWith({
      uid: "MjI",
      token: "abc-123",
      new_password: "new-secret-password",
    });
    await user.click(screen.getByRole("button", { name: "ورود به حساب" }));
    expect(mocks.startAuthFlow).toHaveBeenCalledWith("learning");
  });

  it("explains a rejected password under the field and keeps the form", async () => {
    mocks.confirmPasswordReset.mockRejectedValue(badRequest({ new_password: ["This password is entirely numeric."] }));
    const user = userEvent.setup();
    render(<ResetPasswordPage uid="MjI" token="abc-123" />);

    await user.type(screen.getByLabelText("رمز عبور جدید"), "12345678");
    await user.click(screen.getByRole("button", { name: "ذخیره رمز عبور جدید" }));

    expect(await screen.findByText("رمز عبور نباید فقط از عدد تشکیل شده باشد.")).toBeInTheDocument();
    expect(screen.getByLabelText("رمز عبور جدید")).toHaveAttribute("aria-invalid", "true");
  });

  it("turns a rejected link into an offer of a fresh recovery code", async () => {
    mocks.confirmPasswordReset.mockRejectedValue(badRequest({ token: ["Invalid or expired token."] }));
    const user = userEvent.setup();
    render(<ResetPasswordPage uid="MjI" token="used" />);

    await user.type(screen.getByLabelText("رمز عبور جدید"), "new-secret-password");
    await user.click(screen.getByRole("button", { name: "ذخیره رمز عبور جدید" }));

    expect(await screen.findByRole("heading", { name: "این لینک دیگر معتبر نیست" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "دریافت کد بازیابی" }));
    expect(mocks.startAuthFlow).toHaveBeenCalledWith("learning", { view: "forgot" });
  });

  it("does not show the form for a link without its uid and token", () => {
    render(<ResetPasswordPage uid="" token="" />);

    expect(screen.getByRole("heading", { name: "این لینک دیگر معتبر نیست" })).toBeInTheDocument();
    expect(screen.queryByLabelText("رمز عبور جدید")).not.toBeInTheDocument();
  });

  it("keeps the form and shows the reason when the server cannot be reached", async () => {
    mocks.confirmPasswordReset.mockRejectedValue(new AxiosError("Network Error", "ERR_NETWORK"));
    const user = userEvent.setup();
    render(<ResetPasswordPage uid="MjI" token="abc-123" />);

    await user.type(screen.getByLabelText("رمز عبور جدید"), "new-secret-password");
    await user.click(screen.getByRole("button", { name: "ذخیره رمز عبور جدید" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("ارتباط با سرور برقرار نشد"));
    expect(screen.getByLabelText("رمز عبور جدید")).toHaveValue("new-secret-password");
  });
});
