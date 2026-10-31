import type { InternalAxiosRequestConfig } from "axios";

export type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

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

export type ApiErrorOptions = {
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

/** Serializable summary of an API failure, safe to keep in the Redux store. */
export type ApiErrorInfo = {
  message: string;
  kind: ApiErrorKind;
  status?: number;
};

export type DetailResponse = { detail: string };

export type UploadProgressHandler = (percent: number) => void;

export type DownloadedFile = {
  blob: Blob;
  fileName: string | null;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
