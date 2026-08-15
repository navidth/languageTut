import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { describe, expect, it } from "vitest";
import {
  ApiError,
  getApiErrorMessage,
  getApiSuccessMessage,
  normalizeApiError,
} from "./apiErrors";

function responseError(
  status: number,
  data: unknown = {},
  headers: Record<string, string> = {},
) {
  const error = new AxiosError("Request failed", "ERR_BAD_RESPONSE");
  error.response = {
    data,
    status,
    statusText: "Error",
    headers,
    config: {} as InternalAxiosRequestConfig,
  } as AxiosResponse;
  return error;
}

describe("API error handling", () => {
  it.each([
    [400, "اطلاعات ارسال‌شده معتبر نیست"],
    [401, "نشست شما منقضی شده است"],
    [403, "اجازه انجام این عملیات را ندارید"],
    [500, "خطایی در سرور رخ داد"],
    [502, "پاسخ معتبری از سرویس بالادستی دریافت نشد"],
  ])("returns an appropriate Persian message for status %i", (status, message) => {
    expect(getApiErrorMessage(responseError(status))).toContain(message);
  });

  it("handles network errors without exposing the Axios message", () => {
    const error = normalizeApiError(new AxiosError("Network Error", "ERR_NETWORK"));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.kind).toBe("network");
    expect(error.retryable).toBe(true);
    expect(error.message).toContain("ارتباط با سرور برقرار نشد");
  });

  it("includes Retry-After in a 429 message", () => {
    const error = normalizeApiError(responseError(429, {}, { "retry-after": "30" }));

    expect(error.kind).toBe("rate-limit");
    expect(error.retryAfterSeconds).toBe(30);
    expect(error.message).toContain("۳۰ ثانیه دیگر");
  });

  it("extracts and localizes validation field errors", () => {
    const error = normalizeApiError(responseError(400, {
      email: ["Enter a valid email address."],
    }));

    expect(error.kind).toBe("validation");
    expect(error.fieldErrors.email).toEqual(["مقدار واردشده معتبر نیست."]);
    expect(error.message).toBe("ایمیل: مقدار واردشده معتبر نیست.");
  });

  it("maps 200 and 201 success responses", () => {
    expect(getApiSuccessMessage(200)).toBe("عملیات با موفقیت انجام شد.");
    expect(getApiSuccessMessage(201)).toBe("اطلاعات با موفقیت ثبت شد.");
  });
});
