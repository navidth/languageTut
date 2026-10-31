import axios, { type AxiosError } from "axios";
import type { ApiErrorKind, ApiFieldErrors, ApiErrorOptions, ApiErrorInfo } from "@/types/api";
import { defaultStatusMessages, fieldLabels, successStatusMessages } from "@/constants/api";

export class ApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly kind: ApiErrorKind;
  readonly fieldErrors: ApiFieldErrors;
  readonly retryAfterSeconds?: number;
  readonly requestId?: string;
  readonly retryable: boolean;

  constructor(options: ApiErrorOptions) {
    super(options.message, { cause: options.cause });
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.kind = options.kind;
    this.fieldErrors = options.fieldErrors ?? {};
    this.retryAfterSeconds = options.retryAfterSeconds;
    this.requestId = options.requestId;
    this.retryable = options.retryable ?? false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function flattenMessages(value: unknown): string[] {
  if (typeof value === "string" && value.trim()) return [value.trim()];
  if (Array.isArray(value)) return value.flatMap(flattenMessages);
  if (isRecord(value)) return Object.values(value).flatMap(flattenMessages);
  return [];
}

function localizeKnownMessage(message: string): string | null {
  if (/[\u0600-\u06ff]/.test(message)) return message;

  const normalized = message.toLowerCase();
  // Before the login rule below, which also matches "incorrect password".
  if (/current password/.test(normalized) && /incorrect|wrong|invalid|does not match/.test(normalized)) {
    return "رمز عبور فعلی درست نیست.";
  }
  if (/current password/.test(normalized) && /required|needed|enter|provide/.test(normalized)) {
    return "برای تغییر ایمیل یا شماره موبایل، رمز عبور فعلی را وارد کنید.";
  }
  // Emailed or texted codes, before the generic "enter a valid" rule below.
  if (/\b(code|otp)\b/.test(normalized) && /invalid|expired|incorrect|wrong|not valid|does not match/.test(normalized)) {
    return "کد واردشده درست نیست یا منقضی شده است.";
  }
  if (/\blink\b/.test(normalized) && /invalid|expired|not valid/.test(normalized)) {
    return "این لینک بازیابی معتبر نیست یا منقضی شده است.";
  }
  // Django's password validators.
  if (/password is too common/.test(normalized)) {
    return "این رمز عبور بیش از حد رایج است. رمز دیگری انتخاب کنید.";
  }
  if (/password is entirely numeric/.test(normalized)) {
    return "رمز عبور نباید فقط از عدد تشکیل شده باشد.";
  }
  if (/password is too similar/.test(normalized)) {
    return "رمز عبور بیش از حد به اطلاعات حساب شما شبیه است.";
  }
  const minimumLength = normalized.match(/at least (\d+) characters/);
  if (minimumLength) {
    return `حداقل ${Number(minimumLength[1]).toLocaleString("fa-IR")} کاراکتر لازم است.`;
  }
  if (/no active account|invalid credentials|incorrect (email|password)/.test(normalized)) {
    return "ایمیل یا رمز عبور صحیح نیست.";
  }
  if (/token.*(invalid|expired)|not valid for any token|authentication credentials were not provided/.test(normalized)) {
    return "نشست شما منقضی شده است. لطفاً دوباره وارد شوید.";
  }
  if (/invalid email or password/.test(normalized)) {
    return "ایمیل یا رمز عبور صحیح نیست.";
  }
  if (/invalid phone number or password/.test(normalized)) {
    return "شماره موبایل یا رمز عبور صحیح نیست.";
  }
  if (/provide either an email or a phone number/.test(normalized)) {
    return "ایمیل یا شماره موبایل را وارد کنید.";
  }
  if (/iranian mobile number/.test(normalized)) {
    return "شماره موبایل معتبر نیست. نمونه درست: ۰۹۱۲۳۴۵۶۷۸۹";
  }
  if (/enroll in this course/.test(normalized)) {
    return "برای شرکت در این آزمون، ابتدا دوره آن را تهیه کنید.";
  }
  if (/do not have permission to perform this action/.test(normalized)) {
    return defaultStatusMessages[403];
  }
  if (/already exists|already registered|already in use|unique/.test(normalized)) {
    return "این اطلاعات قبلاً ثبت شده است.";
  }
  if (/no file was submitted|was not a file/.test(normalized)) {
    return "فایلی برای ارسال انتخاب نشده است.";
  }
  if (/submitted file is empty/.test(normalized)) {
    return "فایل انتخاب‌شده خالی است.";
  }
  if (/file extension|extension .* not allowed/.test(normalized)) {
    return "نوع این فایل مجاز نیست.";
  }
  if (/not open yet|has not (started|opened)|not started yet|submissions open/.test(normalized)) {
    return "ارسال پاسخ برای این تکلیف هنوز باز نشده است.";
  }
  if (/deadline|past due|late submission/.test(normalized)) {
    return "مهلت ارسال این تکلیف به پایان رسیده است.";
  }
  if (/required|blank|null/.test(normalized)) {
    return "تکمیل این فیلد الزامی است.";
  }
  if (/valid email|enter a valid/.test(normalized)) {
    return "مقدار واردشده معتبر نیست.";
  }
  if (/too many|throttl/.test(normalized)) {
    return "تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.";
  }
  return null;
}

function extractFieldErrors(data: unknown): ApiFieldErrors {
  if (!isRecord(data)) return {};

  return Object.fromEntries(
    Object.entries(data)
      .map(([field, value]) => {
        const messages = flattenMessages(value).map(
          (message) => localizeKnownMessage(message) ?? message,
        );
        return [field, messages] as const;
      })
      .filter(([, messages]) => messages.length > 0),
  );
}

function firstUsefulServerMessage(data: unknown, status?: number): string | null {
  if (!isRecord(data)) return null;

  for (const key of ["detail", "message", "error", "non_field_errors"]) {
    const message = flattenMessages(data[key])[0];
    if (!message) continue;
    const localized = localizeKnownMessage(message);
    if (localized) return localized;
    if (/[\u0600-\u06ff]/.test(message)) return message;
    // Readable 403 reasons, such as an attempt limit or a placement retake
    // date, would otherwise be hidden behind the generic message.
    if (status === 403 && key === "detail") return message;
  }

  if (status === 400 || status === 422) {
    for (const [field, value] of Object.entries(data)) {
      const message = flattenMessages(value)[0];
      if (!message) continue;
      const localized = localizeKnownMessage(message);
      const label = fieldLabels[field] ?? "فیلد موردنظر";
      return `${label}: ${localized ?? "مقدار واردشده معتبر نیست."}`;
    }
  }

  return null;
}

function getHeader(headers: unknown, name: string): string | undefined {
  if (!headers) return undefined;
  if (isRecord(headers)) {
    const value = headers[name] ?? headers[name.toLowerCase()];
    return typeof value === "string" || typeof value === "number"
      ? String(value)
      : undefined;
  }
  return undefined;
}

function parseRetryAfter(headers: unknown): number | undefined {
  const value = getHeader(headers, "retry-after");
  if (!value) return undefined;

  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, Math.ceil(seconds));

  const retryDate = Date.parse(value);
  if (Number.isNaN(retryDate)) return undefined;
  return Math.max(0, Math.ceil((retryDate - Date.now()) / 1000));
}

function kindForStatus(status: number): ApiErrorKind {
  if (status === 400 || status === 422) return "validation";
  if (status === 401) return "authentication";
  if (status === 403) return "authorization";
  if (status === 404 || status === 410) return "not-found";
  if (status === 409) return "conflict";
  if (status === 408 || status === 504) return "timeout";
  if (status === 429) return "rate-limit";
  if (status >= 500) return "server";
  return "unknown";
}

function statusMessage(status: number, retryAfterSeconds?: number): string {
  if (status === 429) {
    return retryAfterSeconds
      ? `تعداد درخواست‌ها بیش از حد مجاز است. لطفاً ${retryAfterSeconds.toLocaleString("fa-IR")} ثانیه دیگر تلاش کنید.`
      : "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید.";
  }
  return defaultStatusMessages[status] ?? `درخواست با خطای ${status.toLocaleString("fa-IR")} روبه‌رو شد.`;
}

/** A thunk's `rejectWithValue` payload, which `unwrap()` throws as is. */
function isApiErrorInfo(value: unknown): value is ApiErrorInfo {
  return isRecord(value) && typeof value.message === "string" && typeof value.kind === "string";
}

export function normalizeApiError(error: unknown, fallback?: string): ApiError {
  if (error instanceof ApiError) return error;

  if (isApiErrorInfo(error)) {
    return new ApiError({ message: error.message, kind: error.kind, status: error.status, cause: error });
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<unknown>;
    const code = axiosError.code;

    if (code === "ERR_CANCELED") {
      return new ApiError({
        message: "درخواست لغو شد.",
        code,
        kind: "cancelled",
        cause: error,
      });
    }

    if (code === "ECONNABORTED" || code === "ETIMEDOUT") {
      return new ApiError({
        message: "زمان انتظار برای پاسخ سرور به پایان رسید. اتصال خود را بررسی کرده و دوباره تلاش کنید.",
        code,
        kind: "timeout",
        retryable: true,
        cause: error,
      });
    }

    if (!axiosError.response) {
      return new ApiError({
        message: "ارتباط با سرور برقرار نشد. اینترنت خود را بررسی کنید و دوباره تلاش کنید.",
        code: code ?? "ERR_NETWORK",
        kind: "network",
        retryable: true,
        cause: error,
      });
    }

    const { status, data, headers } = axiosError.response;
    const retryAfterSeconds = parseRetryAfter(headers);
    const requestId = getHeader(headers, "x-request-id") ?? getHeader(headers, "x-correlation-id");
    const hasKnownStatusMessage = status === 429 || status in defaultStatusMessages;
    const serverMessage = status < 500
      ? firstUsefulServerMessage(data, status)
      : null;
    const message = status === 429
      ? statusMessage(status, retryAfterSeconds)
      : serverMessage ??
        (hasKnownStatusMessage
          ? statusMessage(status, retryAfterSeconds)
          : fallback ?? statusMessage(status, retryAfterSeconds));

    return new ApiError({
      message,
      status,
      code,
      kind: kindForStatus(status),
      fieldErrors: extractFieldErrors(data),
      retryAfterSeconds,
      requestId,
      retryable: status === 408 || status === 429 || status >= 500,
      cause: error,
    });
  }

  if (error instanceof Error && error.message.trim()) {
    return new ApiError({
      message: fallback ?? error.message,
      kind: "unknown",
      cause: error,
    });
  }

  return new ApiError({
    message: fallback ?? "خطای پیش‌بینی‌نشده‌ای رخ داد. لطفاً دوباره تلاش کنید.",
    kind: "unknown",
    cause: error,
  });
}

export function toApiErrorInfo(error: unknown, fallback?: string): ApiErrorInfo {
  const { message, kind, status } = normalizeApiError(error, fallback);
  return { message, kind, status };
}

export function getApiErrorMessage(error: unknown, fallback?: string): string {
  return normalizeApiError(error, fallback).message;
}

export function getApiSuccessMessage(status: number, customMessage?: string): string {
  return customMessage ?? successStatusMessages[status] ?? "عملیات با موفقیت انجام شد.";
}
