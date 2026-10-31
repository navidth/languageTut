import type { SegmentedOption } from "@/components/ui/SegmentedControl";
import { HiLockClosed, HiChatAlt } from "react-icons/hi";
import type { ProfileFieldKey, UserRole } from "@/types/auth";

export const INVALID_CODE = "کد واردشده درست نیست یا منقضی شده است.";

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CODE_PATTERN = /^\d{4,8}$/;

/**
 * Boxes shown for an emailed or texted code. The API accepts 4 to 8 digits
 * and does not say which it sends; 6 is the usual length. Shorter codes still
 * submit, since validation follows `codePattern`.
 */
export const CODE_LENGTH = 6;

export const MOBILE_ERROR = "شماره موبایل معتبر نیست. نمونه درست: ۰۹۱۲۳۴۵۶۷۸۹";

/** Shown when SMS is on: sign in with a password or with a texted code. */
export const LOGIN_METHODS: readonly SegmentedOption<"password" | "code">[] = [
  { value: "password", label: "با رمز عبور", icon: HiLockClosed },
  { value: "code", label: "با کد پیامکی", icon: HiChatAlt },
];

export const AUTH_BRAND_PROMISES = [
  "تعیین سطح و مسیر متناسب با هدف شما",
  "تمرین چهار مهارت در کنار واژگان و گرامر",
  "مشاهده روند پیشرفت در طول مسیر",
] as const;

export const PASSWORD_HINT = "حداقل ۸ کاراکتر";

export const PROFILE_FIELD_KEYS: ProfileFieldKey[] = ["full_name", "email", "phone_number", "current_password"];

export const ROLE_LABELS: Record<UserRole, string> = {
  student: "زبان‌آموز",
  teacher: "مدرس",
  admin: "مدیر",
};
