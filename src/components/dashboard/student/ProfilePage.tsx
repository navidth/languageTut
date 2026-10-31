"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import { authApi } from "@/lib/services/authApi";
import { normalizeIranianMobile, toLatinDigits } from "@/lib/utils/normalize";
import { type PatchedUserRequest, type User } from "@/types/auth";
import { getApiErrorMessage } from "@/lib/services/apiErrors";
import { formatPersianDate } from "@/lib/utils/date";
import { useAuthFeatures } from "@/hooks/useAuthFeatures";
import AsyncState from "@/components/ui/AsyncState";
import CodeInput from "@/components/ui/CodeInput";
import { loadMe, updateProfile } from "@/store/authSlice";
import { type ProfileUpdateError } from "@/types/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { ProfileFieldKey, ProfileForm, ProfileFieldErrors } from "@/types/auth";
import { EMAIL_PATTERN, PROFILE_FIELD_KEYS } from "@/constants/auth";
import { twMerge } from "tailwind-merge";
import { FIELD_CLASS_NAME } from "@/constants/ui";

function formFromUser(user: User): ProfileForm {
  return {
    full_name: user.full_name,
    email: user.email,
    phone_number: user.phone_number ?? "",
    current_password: "",
  };
}

export default function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user);
  const authStatus = useAppSelector((state) => state.auth.status);
  const updateStatus = useAppSelector((state) => state.auth.profileUpdateStatus);
  const authError = useAppSelector((state) => state.auth.error);

  if (!user) {
    return (
      <AsyncState
        message={authStatus === "error" ? authError ?? "دریافت پروفایل ناموفق بود." : "در حال دریافت پروفایل..."}
      />
    );
  }

  return <ProfileContent key={user.id} user={user} updateStatus={updateStatus} />;
}

function ProfileContent({
  user,
  updateStatus,
}: {
  user: User;
  updateStatus: "idle" | "loading" | "succeeded" | "failed";
}) {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<ProfileForm>(() => formFromUser(user));
  const [errors, setErrors] = useState<ProfileFieldErrors>({});
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const fullName = form.full_name.trim();
  const email = form.email.trim();
  const phoneInput = form.phone_number.trim();
  // Compared after normalizing, so "۰۹۱۲…" or "+98…" for the same number is no change.
  const phone = normalizeIranianMobile(phoneInput) ?? phoneInput;
  const nameChanged = fullName !== user.full_name;
  const emailChanged = email !== user.email;
  const phoneChanged = phone !== (user.phone_number ?? "");
  const dirty = nameChanged || emailChanged || phoneChanged;
  // The API asks for the current password only when email or phone changes.
  const needsPassword = emailChanged || phoneChanged;
  const loading = updateStatus === "loading";

  function setField(field: ProfileFieldKey, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setResult(null);
  }

  function validate() {
    const next: ProfileFieldErrors = {};
    if (!fullName) next.full_name = "نام و نام خانوادگی را وارد کنید.";
    else if (fullName.length > 255) next.full_name = "نام و نام خانوادگی حداکثر ۲۵۵ کاراکتر است.";
    if (!EMAIL_PATTERN.test(email)) next.email = "یک ایمیل معتبر وارد کنید.";
    if (phoneChanged && !phoneInput) next.phone_number = "شماره موبایل را وارد کنید.";
    else if (phoneChanged && !normalizeIranianMobile(phoneInput)) {
      next.phone_number = "شماره موبایل معتبر نیست. نمونه درست: ۰۹۱۲۳۴۵۶۷۸۹";
    }
    if (needsPassword && !form.current_password) {
      next.current_password = "برای تغییر ایمیل یا شماره موبایل، رمز عبور فعلی را وارد کنید.";
    }
    return next;
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    if (!dirty || loading) return;
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    // PATCH with only the changed fields: a name edit needs no password and
    // leaves the contact details untouched.
    const data: PatchedUserRequest = {};
    if (nameChanged) data.full_name = fullName;
    if (emailChanged) data.email = email;
    if (phoneChanged) data.phone_number = phone;
    if (needsPassword) data.current_password = form.current_password;

    try {
      const saved = await dispatch(updateProfile({ method: "patch", data })).unwrap();
      setForm(formFromUser(saved));
      setResult({ ok: true, text: "اطلاعات پروفایل با موفقیت ذخیره شد." });
    } catch (reason) {
      const failure = reason as Partial<ProfileUpdateError>;
      const serverErrors: ProfileFieldErrors = {};
      for (const key of PROFILE_FIELD_KEYS) {
        const message = failure.fieldErrors?.[key]?.[0];
        if (message) serverErrors[key] = message;
      }
      setErrors(serverErrors);
      setResult({
        ok: false,
        text: Object.keys(serverErrors).length
          ? "ذخیره نشد. خطاهای مشخص‌شده در فرم را بررسی کنید."
          : failure.message ?? "ذخیره اطلاعات پروفایل ناموفق بود.",
      });
    }
  }

  function reset() {
    setForm(formFromUser(user));
    setErrors({});
    setResult(null);
  }

  const inputProps = (field: ProfileFieldKey, extraClassName = "") => ({
    id: `profile-${field}`,
    value: form[field],
    onChange: (event: { target: { value: string } }) => setField(field, event.target.value),
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `profile-${field}-error` : undefined,
    className: twMerge(FIELD_CLASS_NAME, errors[field] && "border-destructive", extraClassName),
  });

  return (
    <section className="mx-auto max-w-5xl">
      <div className="page-hero mb-6 rounded-3xl p-7">
        <p className="page-hero-muted">حساب کاربری</p>
        <h1 className="mt-2 text-3xl font-black">پروفایل دانش‌آموز</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <aside className="surface-card rounded-3xl p-6 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-accent-soft text-3xl font-black text-brand-secondary dark:text-brand-accent">
            {user?.full_name?.slice(0, 1) || "؟"}
          </div>
          <h2 className="mt-4 text-xl font-bold">{user?.full_name || "دانش‌آموز"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Info label="سطح" value={user?.current_level || "—"} />
            <Info label="نقش" value={user?.role === "student" ? "دانش‌آموز" : user?.role || "—"} />
          </div>
          <div className="mt-3 rounded-2xl bg-secondary-soft p-3 text-sm">
            <span className="text-muted-foreground">تاریخ عضویت: </span>
            {formatPersianDate(user?.date_joined)}
          </div>
          <PhoneStatus user={user} />
        </aside>
        <form onSubmit={save} noValidate className="surface-card rounded-3xl p-6">
          <h2 className="mb-6 text-xl font-bold">ویرایش اطلاعات</h2>
          <Field id="profile-full_name" label="نام و نام خانوادگی" error={errors.full_name}>
            <input {...inputProps("full_name")} autoComplete="name" maxLength={255} />
          </Field>
          <Field id="profile-email" label="ایمیل" error={errors.email}>
            <input {...inputProps("email", "text-left")} type="email" dir="ltr" autoComplete="email" inputMode="email" />
          </Field>
          <Field id="profile-phone_number" label="شماره موبایل" error={errors.phone_number}>
            <input
              {...inputProps("phone_number", "text-left")}
              type="tel"
              dir="ltr"
              autoComplete="tel"
              inputMode="tel"
              placeholder="09123456789"
            />
          </Field>
          {needsPassword && (
            <Field
              id="profile-current_password"
              label="رمز عبور فعلی"
              error={errors.current_password}
              hint="برای تغییر ایمیل یا شماره موبایل، رمز عبور فعلی را وارد کنید."
            >
              <input
                {...inputProps("current_password", "text-left")}
                type="password"
                dir="ltr"
                autoComplete="current-password"
              />
            </Field>
          )}
          {result && (
            <p className={`${result.ok ? "feedback-success" : "feedback-error"} mb-4 rounded-xl p-3 text-sm`} role="status">
              {result.text}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={loading || !dirty} className="brand-button rounded-xl px-6 py-3">
              {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
            {dirty && !loading && (
              <button type="button" onClick={reset} className="ghost-button rounded-xl px-6 py-3 font-bold">
                انصراف
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-5">
      <label className="mb-2 block text-sm font-bold" htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-destructive" role="alert">{error}</p>
      ) : (
        hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

/** Phone verification works over SMS, so it is offered only when SMS is on. */
function PhoneStatus({ user }: { user: User }) {
  const dispatch = useAppDispatch();
  const { smsEnabled } = useAuthFeatures();
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);

  if (!user.phone_number) return null;

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setFeedback(null);
    try {
      await action();
    } catch (error) {
      setFeedback({ text: getApiErrorMessage(error, "درخواست ناموفق بود. دوباره تلاش کنید."), ok: false });
    } finally {
      setBusy(false);
    }
  }

  const requestCode = () =>
    run(async () => {
      await authApi.requestPhoneVerification();
      setCodeSent(true);
      setFeedback({ text: "کد تأیید به شماره شما پیامک شد.", ok: true });
    });

  function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = toLatinDigits(code.trim());
    if (!/^\d{4,8}$/.test(value)) {
      setFeedback({ text: "کد پیامک‌شده را وارد کنید.", ok: false });
      return;
    }
    void run(async () => {
      await authApi.verifyPhone(value);
      setCodeSent(false);
      setCode("");
      setFeedback({ text: "شماره موبایل تأیید شد.", ok: true });
      // `phone_verified` comes from the account, so read it again.
      void dispatch(loadMe());
    });
  }

  return (
    <div className="mt-3 rounded-2xl bg-secondary-soft p-3 text-start text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>
          <span className="text-muted-foreground">موبایل: </span>
          <span dir="ltr">{user.phone_number}</span>
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${user.phone_verified ? "feedback-success" : "feedback-warning"}`}
        >
          {user.phone_verified ? "تأییدشده" : "تأییدنشده"}
        </span>
      </div>
      {smsEnabled && !user.phone_verified && (
        codeSent ? (
          <form onSubmit={verify} className="mt-3 flex gap-2">
            <label htmlFor="profile-phone-code" className="sr-only">کد تأیید</label>
            <CodeInput
              id="profile-phone-code"
              value={code}
              onValueChange={setCode}
              className="min-w-0 flex-1 rounded-xl border border-input bg-card p-2 text-left tracking-[0.3em]"
              placeholder="کد تأیید"
            />
            <button disabled={busy} className="brand-button rounded-xl px-4 py-2 text-sm">
              {busy ? "..." : "تأیید"}
            </button>
          </form>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void requestCode()}
            className="ghost-button mt-3 w-full rounded-xl px-4 py-2 text-sm font-bold"
          >
            {busy ? "در حال ارسال..." : "ارسال کد تأیید شماره"}
          </button>
        )
      )}
      {feedback && (
        <p className={`mt-2 text-xs ${feedback.ok ? "text-success" : "text-destructive"}`} role="status">
          {feedback.text}
        </p>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary-soft p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <strong className="mt-1 block">{value}</strong>
    </div>
  );
}
