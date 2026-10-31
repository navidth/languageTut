import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@/types/auth";
import { fetchAuthFeatures } from "@/store/authSlice";
import { makeStore } from "@/store";
import { renderWithStore, testStudent } from "@/test/renderWithStore";
import ProfilePage from "@/components/dashboard/student/ProfilePage";

const mocks = vi.hoisted(() => ({
  features: vi.fn(),
  requestPhoneVerification: vi.fn(),
  verifyPhone: vi.fn(),
  getMe: vi.fn(),
  updateMe: vi.fn(),
  replaceMe: vi.fn(),
}));

vi.mock("@/lib/services/authApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/services/authApi")>();
  return { ...actual, authApi: { ...actual.authApi, ...mocks } };
});

const student: User = {
  ...testStudent,
  phone_number: "09123456789",
  phone_verified: false,
};

function storeWithSms(smsEnabled: boolean) {
  const store = makeStore();
  store.dispatch(fetchAuthFeatures.fulfilled({ sms_enabled: smsEnabled }, "test"));
  return store;
}

describe("ProfilePage phone verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requestPhoneVerification.mockResolvedValue({ detail: "sent" });
    mocks.verifyPhone.mockResolvedValue({ detail: "verified" });
    mocks.getMe.mockResolvedValue({ ...student, phone_verified: true });
  });

  it("verifies the phone number by SMS when SMS is on", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProfilePage />, { user: student, store: storeWithSms(true) });

    expect(screen.getByText("تأییدنشده")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "ارسال کد تأیید شماره" }));
    expect(await screen.findByText("کد تأیید به شماره شما پیامک شد.")).toBeInTheDocument();

    await user.type(screen.getByLabelText("کد تأیید"), "۱۲۳۴۵۶");
    await user.click(screen.getByRole("button", { name: "تأیید" }));

    await waitFor(() => expect(mocks.verifyPhone).toHaveBeenCalledWith("123456"));
    expect(await screen.findByText("تأییدشده")).toBeInTheDocument();
    expect(mocks.features).not.toHaveBeenCalled();
  });

  it("shows the status without a verify action while SMS is off", () => {
    renderWithStore(<ProfilePage />, { user: student, store: storeWithSms(false) });

    expect(screen.getByText("تأییدنشده")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "ارسال کد تأیید شماره" })).not.toBeInTheDocument();
  });
});

describe("ProfilePage editing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.updateMe.mockImplementation(async (data: object) => ({ ...student, ...data, current_password: undefined }));
  });

  it("saves a name change with PATCH and no password", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProfilePage />, { user: student, store: storeWithSms(false) });

    const save = screen.getByRole("button", { name: "ذخیره تغییرات" });
    expect(save).toBeDisabled();
    await user.clear(screen.getByLabelText("نام و نام خانوادگی"));
    await user.type(screen.getByLabelText("نام و نام خانوادگی"), "  نام تازه ");
    expect(screen.queryByLabelText("رمز عبور فعلی")).not.toBeInTheDocument();
    await user.click(save);

    expect(await screen.findByText("اطلاعات پروفایل با موفقیت ذخیره شد.")).toBeInTheDocument();
    expect(mocks.updateMe).toHaveBeenCalledWith({ full_name: "نام تازه" });
    expect(mocks.replaceMe).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "نام تازه" })).toBeInTheDocument();
  });

  it("asks for the current password before changing the email", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProfilePage />, { user: student, store: storeWithSms(false) });

    await user.clear(screen.getByLabelText("ایمیل"));
    await user.type(screen.getByLabelText("ایمیل"), "new@example.com");
    await user.click(screen.getByRole("button", { name: "ذخیره تغییرات" }));

    expect(screen.getByLabelText("رمز عبور فعلی")).toHaveAttribute("aria-invalid", "true");
    expect(mocks.updateMe).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("رمز عبور فعلی"), "secret-password");
    await user.click(screen.getByRole("button", { name: "ذخیره تغییرات" }));

    await waitFor(() => expect(mocks.updateMe).toHaveBeenCalledWith({
      email: "new@example.com",
      current_password: "secret-password",
    }));
    expect(await screen.findByText("اطلاعات پروفایل با موفقیت ذخیره شد.")).toBeInTheDocument();
    expect(screen.queryByLabelText("رمز عبور فعلی")).not.toBeInTheDocument();
  });

  it("treats the same phone number in Persian digits as no change", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProfilePage />, { user: student, store: storeWithSms(false) });

    await user.clear(screen.getByLabelText("شماره موبایل"));
    await user.type(screen.getByLabelText("شماره موبایل"), "۰۹۱۲۳۴۵۶۷۸۹");

    expect(screen.getByRole("button", { name: "ذخیره تغییرات" })).toBeDisabled();
    expect(screen.queryByLabelText("رمز عبور فعلی")).not.toBeInTheDocument();
  });

  it("sends a new phone number normalized and shows server field errors", async () => {
    const user = userEvent.setup();
    mocks.updateMe.mockRejectedValue(new AxiosError(
      "Request failed",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 400,
        data: { current_password: ["Current password is incorrect."] },
        statusText: "",
        headers: {},
        config: {},
      } as AxiosResponse,
    ));
    renderWithStore(<ProfilePage />, { user: student, store: storeWithSms(false) });

    await user.clear(screen.getByLabelText("شماره موبایل"));
    await user.type(screen.getByLabelText("شماره موبایل"), "+98 935 000 1122");
    await user.type(screen.getByLabelText("رمز عبور فعلی"), "wrong");
    await user.click(screen.getByRole("button", { name: "ذخیره تغییرات" }));

    expect(await screen.findByText("رمز عبور فعلی درست نیست.")).toBeInTheDocument();
    expect(mocks.updateMe).toHaveBeenCalledWith({
      phone_number: "09350001122",
      current_password: "wrong",
    });
    expect(screen.getByText("ذخیره نشد. خطاهای مشخص‌شده در فرم را بررسی کنید.")).toBeInTheDocument();
  });

  it("restores the saved values on cancel", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProfilePage />, { user: student, store: storeWithSms(false) });

    await user.type(screen.getByLabelText("نام و نام خانوادگی"), " x");
    await user.click(screen.getByRole("button", { name: "انصراف" }));

    expect(screen.getByLabelText("نام و نام خانوادگی")).toHaveValue(student.full_name);
    expect(screen.getByRole("button", { name: "ذخیره تغییرات" })).toBeDisabled();
  });
});
