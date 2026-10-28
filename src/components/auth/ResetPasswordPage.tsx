"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { Spinner } from "flowbite-react";
import { HiArrowLeft, HiCheck, HiExclamation, HiLockClosed } from "react-icons/hi";
import { authApi } from "@/lib/auth";
import { getApiErrorMessage, normalizeApiError } from "@/lib/apiErrors";
import { useAuthFlow } from "./AuthFlowProvider";
import { authInputClassName, fieldDescription, FormField, PasswordToggle } from "./AuthFormFields";

type Stage = "form" | "done" | "invalid";

const PASSWORD_HINT = "حداقل ۸ کاراکتر";

/**
 * Sets a new password from the `uid` and `token` in a reset email link.
 * Without them, or once the server rejects them, it offers a fresh code
 * through the sign-in dialog instead.
 */
export default function ResetPasswordPage({ uid, token }: { uid: string; token: string }) {
  const { startAuthFlow, busy } = useAuthFlow();
  const [stage, setStage] = useState<Stage>(uid && token ? "form" : "invalid");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [formError, setFormError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setFormError("");
    if (password.length < 8) {
      setFieldError(password ? "رمز عبور باید حداقل ۸ کاراکتر باشد." : "رمز عبور جدید را وارد کنید.");
      return;
    }
    setFieldError("");
    setSubmitting(true);
    try {
      await authApi.confirmPasswordReset({ uid, token, new_password: password });
      setPassword("");
      setStage("done");
    } catch (error) {
      const apiError = normalizeApiError(error);
      const passwordMessage = apiError.fieldErrors.new_password?.[0];
      if (apiError.status === 400 && passwordMessage) {
        setFieldError(passwordMessage);
      } else if (apiError.status === 400) {
        // Anything else in a 400 is about the uid or token: the link is used up.
        setStage("invalid");
      } else {
        setFormError(getApiErrorMessage(error, "تغییر رمز عبور ناموفق بود. دوباره تلاش کنید."));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      aria-labelledby="reset-heading"
      className="relative overflow-hidden bg-background px-4 pb-24 pt-32 sm:px-6 sm:pt-40"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgb(231_121_23/0.12),transparent_32%),radial-gradient(circle_at_85%_70%,rgb(85_38_79/0.12),transparent_36%)]"
        aria-hidden="true"
      />
      <div className="landing-dot-grid pointer-events-none absolute inset-x-0 top-0 h-80 opacity-60" aria-hidden="true" />

      <div className="surface-card relative mx-auto max-w-md rounded-[2rem] p-7 hover:shadow-(--shadow-brand-sm) sm:p-9">
        {stage === "form" && (
          <>
            <StageIcon tone="brand">
              <HiLockClosed className="size-6" aria-hidden="true" />
            </StageIcon>
            <h1 id="reset-heading" className="mt-5 text-2xl font-black text-foreground">
              رمز عبور جدید بساز
            </h1>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              یک رمز عبور تازه برای حسابت انتخاب کن. بعد از ذخیره، با همین رمز وارد شو.
            </p>

            {formError && (
              <p className="feedback-error mt-5 rounded-2xl p-4 text-sm" role="alert">
                {formError}
              </p>
            )}

            <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate aria-busy={submitting}>
              <FormField
                id="reset-password"
                label="رمز عبور جدید"
                icon={HiLockClosed}
                error={fieldError}
                hint={PASSWORD_HINT}
              >
                <input
                  id="reset-password"
                  lang="en"
                  dir="ltr"
                  type={visible ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  autoFocus
                  aria-invalid={Boolean(fieldError)}
                  aria-describedby={fieldDescription("reset-password", fieldError, PASSWORD_HINT)}
                  className={`${authInputClassName} pe-11 ps-12 text-left`}
                />
                <PasswordToggle visible={visible} onToggle={() => setVisible((current) => !current)} />
              </FormField>

              <button
                type="submit"
                disabled={submitting}
                className="brand-button flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm"
              >
                {submitting && <Spinner size="sm" aria-hidden="true" />}
                {submitting ? "در حال ذخیره..." : "ذخیره رمز عبور جدید"}
              </button>
            </form>
          </>
        )}

        {stage === "done" && (
          <div role="status">
            <StageIcon tone="success">
              <HiCheck className="size-6" aria-hidden="true" />
            </StageIcon>
            <h1 id="reset-heading" className="mt-5 text-2xl font-black text-foreground">
              رمز عبور تغییر کرد
            </h1>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              حالا می‌توانی با رمز عبور جدیدت وارد حساب شوی.
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={() => void startAuthFlow("learning")}
              className="brand-button mt-7 flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm"
            >
              ورود به حساب
              <HiArrowLeft className="size-5" aria-hidden="true" />
            </button>
          </div>
        )}

        {stage === "invalid" && (
          <>
            <StageIcon tone="warning">
              <HiExclamation className="size-6" aria-hidden="true" />
            </StageIcon>
            <h1 id="reset-heading" className="mt-5 text-2xl font-black text-foreground">
              این لینک دیگر معتبر نیست
            </h1>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              لینک‌های بازیابی فقط یک بار و برای مدت کوتاهی کار می‌کنند. یک کد بازیابی تازه بگیر تا رمز عبورت را عوض کنی.
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={() => void startAuthFlow("learning", { view: "forgot" })}
              className="brand-button mt-7 flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm"
            >
              دریافت کد بازیابی
              <HiArrowLeft className="size-5" aria-hidden="true" />
            </button>
          </>
        )}

        <p className="mt-6 border-t border-border pt-5 text-center text-sm">
          <Link href="/" className="brand-link">
            بازگشت به صفحه اصلی
          </Link>
        </p>
      </div>
    </section>
  );
}

const iconTones = {
  brand: "bg-accent-soft text-brand-secondary dark:text-brand-accent",
  success: "bg-success-soft text-success",
  warning: "bg-accent-soft text-warning",
} as const;

function StageIcon({ tone, children }: { tone: keyof typeof iconTones; children: React.ReactNode }) {
  return (
    <span className={`grid size-12 place-items-center rounded-2xl ${iconTones[tone]}`}>
      {children}
    </span>
  );
}
