"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Modal,
  ModalBody,
  ModalHeader,
  Spinner,
} from "flowbite-react";
import { HiEye, HiEyeOff, HiLockClosed, HiMail, HiUser } from "react-icons/hi";
import type { User } from "@/lib/auth";
import type { AuthenticationMode } from "@/lib/authFlow";
import { login, loadMe, register } from "@/store/authSlice";
import { useAppDispatch } from "@/store/hooks";

type AuthTab = AuthenticationMode;
type FieldErrors = Partial<Record<"fullName" | "email" | "password" | "confirmPassword", string>>;

type AuthenticationModalProps = {
  open: boolean;
  profileError: string;
  onClose: () => void;
  onAuthenticated: (user: User, mode: AuthenticationMode) => void;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const inputClassName = "w-full rounded-2xl border border-border bg-secondary-soft/35 py-3.5 text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.55)] placeholder:text-muted-foreground/75 hover:border-brand-secondary/45 focus:border-brand-accent focus:bg-card focus:ring-4 focus:ring-accent-soft dark:shadow-none";

export default function AuthenticationModal({
  open,
  profileError,
  onClose,
  onAuthenticated,
}: AuthenticationModalProps) {
  const dispatch = useAppDispatch();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<AuthTab>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!open) return;
    setTab("login");
    setFormError(profileError);
    setFieldErrors({});
    setPasswordVisible(false);
    const focusTimer = window.setTimeout(() => emailInputRef.current?.focus(), 80);
    return () => window.clearTimeout(focusTimer);
  }, [open, profileError]);

  useEffect(() => {
    if (!open) return;
    setFormError(profileError);
  }, [open, profileError]);

  function selectTab(nextTab: AuthTab) {
    if (submitting) return;
    setTab(nextTab);
    setFormError("");
    setFieldErrors({});
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextTab = event.key === "Home" ? "login" : event.key === "End" ? "signup" : tab === "login" ? "signup" : "login";
    selectTab(nextTab);
    window.setTimeout(() => document.getElementById(`auth-tab-${nextTab}`)?.focus(), 0);
  }

  function validate() {
    const errors: FieldErrors = {};
    if (tab === "signup" && fullName.trim().length < 2) {
      errors.fullName = "نام و نام خانوادگی را وارد کنید.";
    }
    if (!emailPattern.test(email.trim())) {
      errors.email = "یک ایمیل معتبر وارد کنید.";
    }
    if (!password) {
      errors.password = "رمز عبور را وارد کنید.";
    } else if (tab === "signup" && password.length < 8) {
      errors.password = "رمز عبور باید حداقل ۸ کاراکتر باشد.";
    }
    if (tab === "signup" && confirmPassword !== password) {
      errors.confirmPassword = "تکرار رمز عبور مطابقت ندارد.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    setFormError("");
    try {
      if (tab === "login") {
        await dispatch(login({ email: email.trim(), password })).unwrap();
      } else {
        await dispatch(register({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
        })).unwrap();
      }

      // Both auth thunks already fetch /me; this second read intentionally
      // resolves routing against the freshest profile from the server.
      const latestUser = await dispatch(loadMe()).unwrap();
      setPassword("");
      setConfirmPassword("");
      onAuthenticated(latestUser, tab);
    } catch (reason) {
      setFormError(String(reason || "ورود به حساب کاربری ناموفق بود."));
    } finally {
      setSubmitting(false);
    }
  }

  function closeModal() {
    setPassword("");
    setConfirmPassword("");
    setFormError("");
    setFieldErrors({});
    onClose();
  }

  return (
    <Modal
      dismissible={!submitting}
      show={open}
      size="2xl"
      onClose={() => !submitting && closeModal()}
      dir="rtl"
      className="backdrop-blur-[2px] [&>div]:!max-w-2xl [&>div>div]:!overflow-hidden [&>div>div]:!rounded-[2rem] [&>div>div]:!border [&>div>div]:!border-brand-secondary/20 [&>div>div]:!bg-card [&>div>div]:shadow-[0_28px_80px_rgb(19_9_18/0.28)]"
    >
      <ModalHeader
        as="div"
        className="relative !flex !w-full !items-center !gap-4 border-b border-border bg-gradient-to-b from-secondary-soft/80 to-card px-5 pb-0 pt-4 text-foreground sm:px-8 sm:pt-5 [&>div:first-child]:min-w-0 [&>div:first-child]:flex-1 [&>button]:mb-3 [&>button]:shrink-0 [&>button]:rounded-full [&>button]:border [&>button]:border-border [&>button]:bg-card [&>button]:p-2 [&>button]:text-muted-foreground [&>button:hover]:border-brand-secondary/40 [&>button:hover]:bg-secondary-soft [&>button:hover]:text-foreground"
      >
        <h2 className="sr-only">ورود یا ثبت‌نام</h2>
        <div
          role="tablist"
          aria-label="ورود یا ساخت حساب"
          className="flex w-full items-end gap-8 sm:gap-11"
        >
          <TabButton
            id="auth-tab-login"
            panelId="auth-panel-login"
            selected={tab === "login"}
            onClick={() => selectTab("login")}
            onKeyDown={handleTabKeyDown}
          >
            ورود
          </TabButton>
          <TabButton
            id="auth-tab-signup"
            panelId="auth-panel-signup"
            selected={tab === "signup"}
            onClick={() => selectTab("signup")}
            onKeyDown={handleTabKeyDown}
          >
            ثبت‌نام
          </TabButton>
        </div>
      </ModalHeader>
      <ModalBody className="!overflow-visible bg-card p-0 text-foreground">
        <div
          id={tab === "login" ? "auth-panel-login" : "auth-panel-signup"}
          role="tabpanel"
          aria-labelledby={tab === "login" ? "auth-tab-login" : "auth-tab-signup"}
          className="animate-in fade-in p-5 duration-200 sm:p-8"
        >
          <div className="mb-6">
            <h3 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
              {tab === "login" ? "خوش برگشتی!" : "حسابت را بساز"}
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {tab === "login"
                ? "برای ادامه مسیر یادگیری، اطلاعات حسابت را وارد کن."
                : "فقط چند قدم تا شروع مسیر یادگیری شخصی تو باقی مانده است."}
            </p>
          </div>

          {formError && (
            <Alert color="failure" className="feedback-error mb-5" role="alert">
              {formError}
            </Alert>
          )}

          <form
            data-testid="authentication-form"
            className={tab === "signup" ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "space-y-4"}
            onSubmit={handleSubmit}
            noValidate
            aria-busy={submitting}
          >
            {tab === "signup" && (
              <FormField
                id="auth-full-name"
                label="نام و نام خانوادگی"
                icon={HiUser}
                error={fieldErrors.fullName}
              >
                <input
                  id="auth-full-name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  autoComplete="name"
                  aria-invalid={Boolean(fieldErrors.fullName)}
                  aria-describedby={fieldErrors.fullName ? "auth-full-name-error" : undefined}
                  className={`${inputClassName} pe-4 ps-11`}
                  placeholder="نام شما"
                />
              </FormField>
            )}

            <FormField
              id="auth-email"
              label="ایمیل"
              icon={HiMail}
              error={fieldErrors.email}
            >
              <input
                ref={emailInputRef}
                id="auth-email"
                lang="en"
                dir="ltr"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                inputMode="email"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "auth-email-error" : undefined}
                className={`${inputClassName} pe-4 ps-11 text-left`}
                placeholder="name@example.com"
              />
            </FormField>

            <FormField
              id="auth-password"
              label="رمز عبور"
              icon={HiLockClosed}
              error={fieldErrors.password}
            >
              <input
                id="auth-password"
                lang="en"
                dir="ltr"
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={tab === "login" ? "current-password" : "new-password"}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? "auth-password-error" : undefined}
                className={`${inputClassName} pe-11 ps-12 text-left`}
              />
              <PasswordToggle visible={passwordVisible} onToggle={() => setPasswordVisible((current) => !current)} />
            </FormField>

            {tab === "signup" && (
              <FormField
                id="auth-confirm-password"
                label="تکرار رمز عبور"
                icon={HiLockClosed}
                error={fieldErrors.confirmPassword}
              >
                <input
                  id="auth-confirm-password"
                  lang="en"
                  dir="ltr"
                  type={passwordVisible ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  aria-describedby={fieldErrors.confirmPassword ? "auth-confirm-password-error" : undefined}
                  className={`${inputClassName} pe-11 ps-12 text-left`}
                />
              </FormField>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`brand-button flex min-h-13 w-full items-center justify-center rounded-2xl px-5 py-3.5 text-sm ${tab === "signup" ? "sm:col-span-2" : ""}`}
            >
              {submitting && <Spinner size="sm" className="ms-2" aria-hidden="true" />}
              {submitting ? "در حال بررسی..." : tab === "login" ? "ورود و ادامه" : "ساخت حساب و ادامه"}
            </button>
          </form>
        </div>
      </ModalBody>
    </Modal>
  );
}

function TabButton({
  id,
  panelId,
  selected,
  onClick,
  onKeyDown,
  children,
}: {
  id: string;
  panelId: string;
  selected: boolean;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      id={id}
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={panelId}
      tabIndex={selected ? 0 : -1}
      onClick={onClick}
      onKeyDown={onKeyDown}
      style={{
        borderBottomColor: selected ? "var(--brand-accent)" : "transparent",
        outline: "none",
      }}
      className={`auth-tab relative border-b-2 px-1 pb-3 pt-1 text-sm font-bold transition-colors sm:text-base ${
        selected
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function FormField({
  id,
  label,
  icon: Icon,
  error,
  children,
}: {
  id: string;
  label: string;
  icon: typeof HiUser;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-sm font-bold text-foreground/90">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute start-3.5 top-1/2 z-10 size-5 -translate-y-1/2 text-brand-secondary/75 dark:text-brand-accent" aria-hidden="true" />
        {children}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute end-2.5 top-1/2 z-20 -translate-y-1/2 rounded-xl p-2 text-muted-foreground hover:bg-accent-soft hover:text-brand-primary"
      aria-label={visible ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
      aria-pressed={visible}
    >
      {visible ? <HiEyeOff className="size-5" aria-hidden="true" /> : <HiEye className="size-5" aria-hidden="true" />}
    </button>
  );
}
