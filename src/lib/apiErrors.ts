import axios, { type AxiosError } from "axios";

export type ApiErrorKind =
  | "validation"
  | "authentication"
  | "authorization"
  | "not-found"
  | "conflict"
  | "rate-limit"
  | "timeout"
  | "network"
  | "server"
  | "cancelled"
  | "unknown";

export type ApiFieldErrors = Record<string, string[]>;

type ApiErrorOptions = {
  message: string;
  status?: number;
  code?: string;
  kind: ApiErrorKind;
  fieldErrors?: ApiFieldErrors;
  retryAfterSeconds?: number;
  requestId?: string;
  retryable?: boolean;
  cause?: unknown;
};

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

const fieldLabels: Record<string, string> = {
  detail: "خطا",
  non_field_errors: "اطلاعات",
  email: "ایمیل",
  password: "رمز عبور",
  full_name: "نام و نام خانوادگی",
  current_level: "سطح زبان",
  refresh: "نشست کاربری",
  token: "نشست کاربری",
};

const defaultStatusMessages: Record<number, string> = {
  400: "اطلاعات ارسال‌شده معتبر نیست. لطفاً ورودی‌ها را بررسی کنید.",
  401: "اطلاعات ورود معتبر نیست یا نشست شما منقضی شده است. لطفاً دوباره وارد شوید.",
  402: "برای انجام این عملیات، وضعیت پرداخت حساب را بررسی کنید.",
  403: "شما اجازه انجام این عملیات را ندارید.",
  404: "اطلاعات یا صفحه درخواستی پیدا نشد.",
  405: "این عملیات برای مسیر درخواستی مجاز نیست.",
  408: "زمان پاسخ‌گویی سرور به پایان رسید. دوباره تلاش کنید.",
  409: "این عملیات با وضعیت فعلی اطلاعات تداخل دارد. صفحه را به‌روز کرده و دوباره تلاش کنید.",
  410: "اطلاعات درخواستی دیگر در دسترس نیست.",
  413: "حجم فایل یا اطلاعات ارسالی بیشتر از حد مجاز است.",
  415: "نوع فایل یا محتوای ارسالی پشتیبانی نمی‌شود.",
  422: "سرور نتوانست اطلاعات ارسالی را پردازش کند. ورودی‌ها را بررسی کنید.",
  500: "خطایی در سرور رخ داد. لطفاً چند دقیقه دیگر دوباره تلاش کنید.",
  501: "این قابلیت هنوز در سرور پیاده‌سازی نشده است.",
  502: "پاسخ معتبری از سرویس بالادستی دریافت نشد. کمی بعد دوباره تلاش کنید.",
  503: "سرویس موقتاً در دسترس نیست. لطفاً کمی بعد دوباره تلاش کنید.",
  504: "پاسخ سرویس بیش از حد طول کشید. دوباره تلاش کنید.",
};

const successStatusMessages: Record<number, string> = {
  200: "عملیات با موفقیت انجام شد.",
  201: "اطلاعات با موفقیت ثبت شد.",
  202: "درخواست با موفقیت دریافت شد و در حال پردازش است.",
  204: "عملیات با موفقیت انجام شد.",
};

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
  if (/no active account|invalid credentials|incorrect (email|password)/.test(normalized)) {
    return "ایمیل یا رمز عبور صحیح نیست.";
  }
  if (/token.*(invalid|expired)|not valid for any token|authentication credentials were not provided/.test(normalized)) {
    return "نشست شما منقضی شده است. لطفاً دوباره وارد شوید.";
  }
  if (/already exists|already registered|already in use|unique/.test(normalized)) {
    return "این اطلاعات قبلاً ثبت شده است.";
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

export function normalizeApiError(error: unknown, fallback?: string): ApiError {
  if (error instanceof ApiError) return error;

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

export function getApiErrorMessage(error: unknown, fallback?: string): string {
  return normalizeApiError(error, fallback).message;
}

export function getApiSuccessMessage(status: number, customMessage?: string): string {
  return customMessage ?? successStatusMessages[status] ?? "عملیات با موفقیت انجام شد.";
}

export function isRetryableApiError(error: unknown): boolean {
  return normalizeApiError(error).retryable;
}
