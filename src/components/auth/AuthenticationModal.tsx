"use client";

import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert, Modal } from "flowbite-react";
import {
  HiArrowLeft,
  HiChatAlt,
  HiDeviceMobile,
  HiLockClosed,
  HiMail,
  HiUser,
  HiX,
} from "react-icons/hi";
import OtpInput from "@/components/ui/OtpInput";
import { LoadingContent } from "@/components/ui/PulseLoader";
import SegmentedControl, { type SegmentedOption } from "@/components/ui/SegmentedControl";
import AuthBrandPanel from "./AuthBrandPanel";
import {
  authInputClassName,
  authLinkButtonClassName,
  fieldDescription,
  FormField,
  PasswordToggle,
} from "./AuthFormFields";
import {
  authApi,
  normalizeIranianMobile,
  toLatinDigits,
  type User,
} from "@/lib/auth";
import { getApiErrorMessage, normalizeApiError } from "@/lib/apiErrors";
import type { AuthDialogView, AuthenticationMode } from "@/lib/authFlow";
import { login, register } from "@/store/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { useAuthFeatures } from "./useAuthFeatures";

type AuthTab = AuthenticationMode;
/** Login sub-views: password login, SMS-code login and password recovery. */
type LoginView = "password" | "code" | "forgot";
type FieldName =
  | "fullName"
  | "identifier"
  | "email"
  | "phone"
  | "password"
  | "confirmPassword"
  | "code"
  | "newPassword";
type FieldErrors = Partial<Record<FieldName, string>>;
/** Where a recovery code goes: email always works, SMS only when it is on. */
type RecoveryChannel = "email" | "sms";

type AuthenticationModalProps = {
  open: boolean;
  profileError: string;
  /** The login screen to open on; recovery links ask for "forgot". */
  initialView?: AuthDialogView;
  onClose: () => void;
  onAuthenticated: (user: User, mode: AuthenticationMode) => void;
};

const INVALID_CODE = "کد واردشده درست نیست یا منقضی شده است.";

/**
 * Puts a rejected reset confirmation under the field it is about. Returns
 * null when the error belongs to neither the code nor the new password.
 */
function resetFieldErrors(error: unknown): FieldErrors | null {
  const apiError = normalizeApiError(error);
  if (apiError.status !== 400) return null;
  const fields: FieldErrors = {};
  if (apiError.fieldErrors.code) fields.code = INVALID_CODE;
  const passwordMessage = apiError.fieldErrors.new_password?.[0];
  if (passwordMessage) fields.newPassword = passwordMessage;
  return Object.keys(fields).length ? fields : null;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const codePattern = /^\d{4,8}$/;
/**
 * Boxes shown for an emailed or texted code. The API accepts 4 to 8 digits
 * and does not say which it sends; 6 is the usual length. Shorter codes still
 * submit, since validation follows `codePattern`.
 */
const CODE_LENGTH = 6;

const MOBILE_ERROR = "شماره موبایل معتبر نیست. نمونه درست: ۰۹۱۲۳۴۵۶۷۸۹";

/** Heading and lead for each screen; recovery copy follows its step and channel. */
function screenCopy(
  screen: "signup" | LoginView,
  smsEnabled: boolean,
  recovery: { codeSent: boolean; channel: RecoveryChannel },
): [string, string] {
  switch (screen) {
    case "signup":
      return ["حسابت را بساز", "فقط چند قدم تا شروع مسیر یادگیری شخصی تو باقی مانده است."];
    case "code":
      return ["خوش برگشتی!", "کد یک‌بار مصرف به شماره موبایلت پیامک می‌شود."];
    case "forgot":
      if (recovery.codeSent) {
        return [
          "رمز عبور جدید بساز",
          recovery.channel === "email"
            ? "کدی را که به ایمیلت فرستادیم وارد کن و رمز عبور تازه‌ای انتخاب کن."
            : "کدی را که برایت پیامک کردیم وارد کن و رمز عبور تازه‌ای انتخاب کن.",
        ];
      }
      return smsEnabled
        ? ["بازیابی رمز عبور", "ایمیل یا شماره موبایل حسابت را وارد کن تا کد بازیابی برایت فرستاده شود."]
        : ["بازیابی رمز عبور", "ایمیل حسابت را وارد کن تا کد بازیابی برایت فرستاده شود."];
    default:
      return ["خوش برگشتی!", "با ایمیل یا شماره موبایل و رمز عبورت وارد شو."];
  }
}

export default function AuthenticationModal({
  open,
  profileError,
  initialView = "password",
  onClose,
  onAuthenticated,
}: AuthenticationModalProps) {
  const dispatch = useAppDispatch();
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<AuthTab>("login");
  const [selectedLoginView, setLoginView] = useState<LoginView>("password");
  const { smsEnabled } = useAuthFeatures();
  // Falls back to password login if SMS is switched off while the code screen is open.
  const loginView: LoginView =
    selectedLoginView === "code" && !smsEnabled ? "password" : selectedLoginView;
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const initialFocusTimerRef = useRef<number | null>(null);
  // A field asked to take focus. It may only appear on the next render (the
  // code field after "send code"), and the submit button drops focus to the
  // page while it is disabled, so the request waits until the field exists.
  const pendingFocusRef = useRef<string | null>(null);

  const applyPendingFocus = useCallback(() => {
    const id = pendingFocusRef.current;
    const field = id ? document.getElementById(id) : null;
    if (!field) return;
    pendingFocusRef.current = null;
    field.focus();
  }, []);

  useEffect(applyPendingFocus);

  function focusField(id: string) {
    pendingFocusRef.current = id;
    window.setTimeout(applyPendingFocus, 0);
  }

  useEffect(() => {
    if (!open) return;
    setTab("login");
    setLoginView(initialView);
    setCodeSent(false);
    setNotice("");
    setFormError(profileError);
    setFieldErrors({});
    setPasswordVisible(false);
    initialFocusTimerRef.current = window.setTimeout(() => firstInputRef.current?.focus(), 80);
    return () => {
      if (initialFocusTimerRef.current !== null) {
        window.clearTimeout(initialFocusTimerRef.current);
      }
    };
  }, [open, profileError, initialView]);

  useEffect(() => {
    if (!open) return;
    setFormError(profileError);
  }, [open, profileError]);

  function resetMessages() {
    setFormError("");
    setNotice("");
    setFieldErrors({});
  }

  function selectTab(nextTab: AuthTab) {
    if (submitting) return;
    if (initialFocusTimerRef.current !== null) {
      window.clearTimeout(initialFocusTimerRef.current);
      initialFocusTimerRef.current = null;
    }
    setTab(nextTab);
    setLoginView("password");
    setCodeSent(false);
    resetMessages();
  }

  function selectLoginView(nextView: LoginView, { focusField = true } = {}) {
    if (submitting) return;
    setLoginView(nextView);
    setCodeSent(false);
    setCode("");
    setPassword("");
    resetMessages();
    if (focusField) window.setTimeout(() => firstInputRef.current?.focus(), 0);
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextTab = event.key === "Home" ? "login" : event.key === "End" ? "signup" : tab === "login" ? "signup" : "login";
    selectTab(nextTab);
    window.setTimeout(() => document.getElementById(`auth-tab-${nextTab}`)?.focus(), 0);
  }

  /** An identifier with `@` is an email; anything else must be a mobile number. */
  function parseIdentifier(errors: FieldErrors): { email: string } | { phone_number: string } | null {
    const value = identifier.trim();
    if (value.includes("@")) {
      if (emailPattern.test(value)) return { email: value };
      errors.identifier = "یک ایمیل معتبر وارد کنید.";
      return null;
    }
    const phoneNumber = normalizeIranianMobile(value);
    if (phoneNumber) return { phone_number: phoneNumber };
    errors.identifier = value
      ? "ایمیل یا شماره موبایل معتبر نیست. نمونه شماره: ۰۹۱۲۳۴۵۶۷۸۹"
      : "ایمیل یا شماره موبایل را وارد کنید.";
    return null;
  }

  function validatePassword(errors: FieldErrors, field: "password" | "newPassword", strict: boolean) {
    const value = field === "password" ? password : confirmPassword;
    if (!value) {
      errors[field] = field === "password" ? "رمز عبور را وارد کنید." : "رمز عبور جدید را وارد کنید.";
    } else if (strict && value.length < 8) {
      errors[field] = "رمز عبور باید حداقل ۸ کاراکتر باشد.";
    }
  }

  async function finishLogin(action: ReturnType<typeof login>, mode: AuthenticationMode) {
    const latestUser = await dispatch(action).unwrap();
    setPassword("");
    setConfirmPassword("");
    setCode("");
    onAuthenticated(latestUser, mode);
  }

  async function submitPasswordLogin() {
    const errors: FieldErrors = {};
    const account = parseIdentifier(errors);
    validatePassword(errors, "password", false);
    setFieldErrors(errors);
    if (!account || Object.keys(errors).length) return;
    await finishLogin(login({ ...account, password }), "login");
  }

  async function submitCodeLogin() {
    const errors: FieldErrors = {};
    const phoneNumber = normalizeIranianMobile(phone);
    if (!phoneNumber) errors.phone = MOBILE_ERROR;
    const loginCode = toLatinDigits(code.trim());
    if (codeSent && !codePattern.test(loginCode)) errors.code = "کد پیامک‌شده را وارد کنید.";
    setFieldErrors(errors);
    if (!phoneNumber || Object.keys(errors).length) return;

    if (!codeSent) {
      await authApi.requestLoginCode(phoneNumber);
      setCodeSent(true);
      setNotice("اگر این شماره حساب داشته باشد، کد ورود برایش پیامک شد.");
      return;
    }
    await finishLogin(login({ phone_number: phoneNumber, code: loginCode }), "login");
  }

  /**
   * Recovery in two steps: send a code to the account's email (or phone, when
   * SMS is on), then confirm it with a new password and sign straight in.
   */
  async function submitForgot() {
    const errors: FieldErrors = {};
    // Without SMS the only recovery channel is email.
    const account = smsEnabled
      ? parseIdentifier(errors)
      : emailPattern.test(identifier.trim())
        ? { email: identifier.trim() }
        : null;
    if (!smsEnabled && !account) errors.identifier = "یک ایمیل معتبر وارد کنید.";
    const resetCode = toLatinDigits(code.trim());
    if (codeSent) {
      if (!codePattern.test(resetCode)) errors.code = "کد بازیابی را وارد کنید.";
      validatePassword(errors, "newPassword", true);
    }
    setFieldErrors(errors);
    if (!account || Object.keys(errors).length) return;

    if (!codeSent) {
      if ("email" in account) {
        await authApi.requestEmailPasswordReset(account.email);
        setNotice("اگر حسابی با این ایمیل وجود داشته باشد، کد بازیابی به آن فرستاده شد. اگر پیدایش نکردی، پوشه اسپم را هم ببین.");
      } else {
        await authApi.requestSmsPasswordReset(account.phone_number);
        setNotice("اگر این شماره حساب داشته باشد، کد بازیابی برایش پیامک شد.");
      }
      setCodeSent(true);
      focusField("auth-code");
      return;
    }

    const newPassword = confirmPassword;
    try {
      if ("email" in account) {
        await authApi.confirmEmailPasswordReset({ email: account.email, code: resetCode, new_password: newPassword });
      } else {
        await authApi.confirmSmsPasswordReset({ phone_number: account.phone_number, code: resetCode, new_password: newPassword });
      }
    } catch (error) {
      const fields = resetFieldErrors(error);
      if (!fields) throw error;
      setFieldErrors(fields);
      focusField(fields.code ? "auth-code" : "auth-new-password");
      return;
    }

    // Ownership of the account is proven, so sign in with the new password
    // instead of asking for it again.
    try {
      await finishLogin(login({ ...account, password: newPassword }), "login");
    } catch {
      setLoginView("password");
      setCodeSent(false);
      setCode("");
      setConfirmPassword("");
      setPassword("");
      setNotice("رمز عبور تغییر کرد. با رمز جدید وارد شوید.");
      focusField("auth-password");
    }
  }

  async function submitSignup() {
    const errors: FieldErrors = {};
    if (fullName.trim().length < 2) errors.fullName = "نام و نام خانوادگی را وارد کنید.";
    if (!emailPattern.test(email.trim())) errors.email = "یک ایمیل معتبر وارد کنید.";
    const phoneNumber = normalizeIranianMobile(phone);
    if (!phoneNumber) errors.phone = MOBILE_ERROR;
    validatePassword(errors, "password", true);
    if (confirmPassword !== password) errors.confirmPassword = "تکرار رمز عبور مطابقت ندارد.";
    setFieldErrors(errors);
    if (!phoneNumber || Object.keys(errors).length) return;

    const latestUser = await dispatch(register({
      email: email.trim(),
      phone_number: phoneNumber,
      password,
      full_name: fullName.trim(),
    })).unwrap();
    setPassword("");
    setConfirmPassword("");
    onAuthenticated(latestUser, "signup");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setFormError("");
    setNotice("");
    try {
      if (tab === "signup") await submitSignup();
      else if (loginView === "code") await submitCodeLogin();
      else if (loginView === "forgot") await submitForgot();
      else await submitPasswordLogin();
    } catch (reason) {
      // Thunks reject with a ready message; direct API calls with an error.
      setFormError(
        typeof reason === "string"
          ? reason || "ورود به حساب کاربری ناموفق بود."
          : getApiErrorMessage(reason, "درخواست ناموفق بود. دوباره تلاش کنید."),
      );
    } finally {
      setSubmitting(false);
    }
  }

  function closeModal() {
    setPassword("");
    setConfirmPassword("");
    setCode("");
    resetMessages();
    onClose();
  }

  const recoveryChannel: RecoveryChannel =
    !smsEnabled || identifier.includes("@") ? "email" : "sms";
  const [heading, subheading] = screenCopy(tab === "signup" ? "signup" : loginView, smsEnabled, {
    codeSent,
    channel: recoveryChannel,
  });
  // Stays the action's name while submitting; the dots cover it then.
  const submitLabel = tab === "signup"
      ? "ساخت حساب و ادامه"
      : loginView === "password"
        ? "ورود و ادامه"
        : loginView === "code"
          ? codeSent ? "ورود و ادامه" : "ارسال کد ورود"
          : codeSent ? "تغییر رمز و ورود" : "ارسال کد بازیابی";
  // The code screen names where the code went.
  const emailedCode = loginView === "forgot" && recoveryChannel === "email";
  // Recovery without SMS goes by email only, so the field asks for just that.
  const emailOnlyIdentifier = loginView === "forgot" && !smsEnabled;

  const passwordField = (
    <FormField id="auth-password" label="رمز عبور" icon={HiLockClosed} error={fieldErrors.password}>
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
        className={`${authInputClassName} pe-11 ps-12 text-left`}
      />
      <PasswordToggle visible={passwordVisible} onToggle={() => setPasswordVisible((current) => !current)} />
    </FormField>
  );

  const phoneField = (
    <FormField id="auth-phone" label="شماره موبایل" icon={HiDeviceMobile} error={fieldErrors.phone}>
      <input
        ref={tab === "login" ? firstInputRef : undefined}
        id="auth-phone"
        lang="en"
        dir="ltr"
        type="tel"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        autoComplete="tel"
        inputMode="tel"
        readOnly={tab === "login" && codeSent}
        aria-invalid={Boolean(fieldErrors.phone)}
        aria-describedby={fieldErrors.phone ? "auth-phone-error" : undefined}
        className={`${authInputClassName} pe-4 ps-11 text-left`}
        placeholder="09123456789"
      />
    </FormField>
  );

  const identifierField = (
    <FormField
      id="auth-identifier"
      label={emailOnlyIdentifier ? "ایمیل" : "ایمیل یا شماره موبایل"}
      icon={HiMail}
      error={fieldErrors.identifier}
    >
      <input
        ref={firstInputRef}
        id="auth-identifier"
        lang="en"
        dir="ltr"
        type={emailOnlyIdentifier ? "email" : "text"}
        inputMode={emailOnlyIdentifier ? "email" : undefined}
        value={identifier}
        onChange={(event) => setIdentifier(event.target.value)}
        autoComplete={emailOnlyIdentifier ? "email" : "username"}
        readOnly={loginView === "forgot" && codeSent}
        aria-invalid={Boolean(fieldErrors.identifier)}
        aria-describedby={fieldErrors.identifier ? "auth-identifier-error" : undefined}
        className={`${authInputClassName} pe-4 ps-11 text-left`}
        placeholder={emailOnlyIdentifier ? "name@example.com" : "name@example.com / 09123456789"}
      />
    </FormField>
  );

  const codeField = (
    <FormField
      id="auth-code"
      label={emailedCode ? "کد ارسال‌شده به ایمیل" : "کد پیامک‌شده"}
      error={fieldErrors.code}
    >
      <OtpInput
        id="auth-code"
        length={CODE_LENGTH}
        value={code}
        onValueChange={(next) => {
          setCode(next);
          // Typing a new code clears the red boxes from a rejected one.
          if (fieldErrors.code) {
            setFieldErrors((current) => {
              const next = { ...current };
              delete next.code;
              return next;
            });
          }
        }}
        // A full code moves on: to the new password when resetting, to the
        // submit button when signing in with a texted code.
        onComplete={() => focusField(loginView === "forgot" ? "auth-new-password" : "auth-submit")}
        invalid={Boolean(fieldErrors.code)}
        disabled={submitting}
        aria-describedby={fieldErrors.code ? "auth-code-error" : undefined}
      />
    </FormField>
  );

  return (
    <Modal
      dismissible={!submitting}
      show={open}
      // Without this the modal's focus trap may focus the first tab after the
      // timer above has focused the first field.
      initialFocus={firstInputRef}
      size="4xl"
      onClose={() => !submitting && closeModal()}
      dir="rtl"
      className="bg-brand-primary/60! backdrop-blur-[3px] [&>div>div]:animate-in [&>div>div]:overflow-hidden! [&>div>div]:rounded-[2rem]! [&>div>div]:border! [&>div>div]:border-brand-secondary/20! [&>div>div]:bg-card! [&>div>div]:fill-mode-both [&>div>div]:fade-in [&>div>div]:zoom-in-95 [&>div>div]:duration-300 [&>div>div]:ease-out [&>div>div]:shadow-[0_28px_80px_rgb(19_9_18/0.35)] [&>div>div]:slide-in-from-bottom-3"
    >
      <h2 className="sr-only">ورود یا ثبت‌نام</h2>
      {/* Form first in the DOM (the start side in RTL), brand panel at the end. */}
      {/* The form column scrolls on its own, so the brand panel stays put. */}
      <div className="grid max-h-[90dvh] text-foreground md:grid-cols-[minmax(0,1fr)_17rem] lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="flex min-h-0 max-h-[90dvh] flex-col">
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-linear-to-b from-secondary-soft/80 to-card px-5 pt-4 sm:px-8 sm:pt-5">
            <div
              role="tablist"
              aria-label="ورود یا ساخت حساب"
              className="flex min-w-0 items-end gap-8 sm:gap-11"
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
            <button
              type="button"
              onClick={closeModal}
              disabled={submitting}
              aria-label="بستن"
              className="mb-3 grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-border bg-card text-muted-foreground hover:border-brand-secondary/40 hover:bg-secondary-soft hover:text-foreground"
            >
              <HiX className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div
            // Remounts on a tab change, so the panel fades in again.
            key={tab}
            id={tab === "login" ? "auth-panel-login" : "auth-panel-signup"}
            role="tabpanel"
            aria-labelledby={tab === "login" ? "auth-tab-login" : "auth-tab-signup"}
            className="animate-in fade-in slide-in-from-bottom-1 min-h-0 overflow-y-auto p-5 duration-300 sm:p-8"
          >
            <div className="mb-6">
              <h3 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                {heading}
              </h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{subheading}</p>
            </div>

            {tab === "login" && smsEnabled && loginView !== "forgot" && (
              <SegmentedControl
                label="روش ورود"
                options={loginMethods}
                value={loginView === "code" ? "code" : "password"}
                disabled={submitting}
                // Arrow keys move along the switch, so focus stays on it.
                onChange={(method) => selectLoginView(method, { focusField: false })}
                className="mb-5"
              />
            )}

            {formError && (
              <Alert color="failure" className="feedback-error mb-5" role="alert">
                {formError}
              </Alert>
            )}
            {notice && (
              <p className="feedback-success mb-5 rounded-2xl p-4 text-sm" role="status">
                {notice}
              </p>
            )}

            <form
              data-testid="authentication-form"
              className={tab === "signup" ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "space-y-4"}
              onSubmit={handleSubmit}
              noValidate
              aria-busy={submitting}
            >
            {tab === "signup" ? (
              <>
                <FormField id="auth-full-name" label="نام و نام خانوادگی" icon={HiUser} error={fieldErrors.fullName}>
                  <input
                    ref={firstInputRef}
                    id="auth-full-name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    autoComplete="name"
                    aria-invalid={Boolean(fieldErrors.fullName)}
                    aria-describedby={fieldErrors.fullName ? "auth-full-name-error" : undefined}
                    className={`${authInputClassName} pe-4 ps-11`}
                    placeholder="نام شما"
                  />
                </FormField>
                <FormField id="auth-email" label="ایمیل" icon={HiMail} error={fieldErrors.email}>
                  <input
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
                    className={`${authInputClassName} pe-4 ps-11 text-left`}
                    placeholder="name@example.com"
                  />
                </FormField>
                {phoneField}
                {passwordField}
                <FormField id="auth-confirm-password" label="تکرار رمز عبور" icon={HiLockClosed} error={fieldErrors.confirmPassword}>
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
                    className={`${authInputClassName} pe-11 ps-12 text-left`}
                  />
                </FormField>
              </>
            ) : loginView === "code" ? (
              <>
                {phoneField}
                {codeSent && codeField}
              </>
            ) : loginView === "forgot" ? (
              <>
                {identifierField}
                {codeSent && (
                  <>
                    {codeField}
                    <FormField
                      id="auth-new-password"
                      label="رمز عبور جدید"
                      icon={HiLockClosed}
                      error={fieldErrors.newPassword}
                      hint="حداقل ۸ کاراکتر"
                    >
                      <input
                        id="auth-new-password"
                        lang="en"
                        dir="ltr"
                        type={passwordVisible ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        autoComplete="new-password"
                        aria-invalid={Boolean(fieldErrors.newPassword)}
                        aria-describedby={fieldDescription("auth-new-password", fieldErrors.newPassword, "حداقل ۸ کاراکتر")}
                        className={`${authInputClassName} pe-11 ps-12 text-left`}
                      />
                      <PasswordToggle visible={passwordVisible} onToggle={() => setPasswordVisible((current) => !current)} />
                    </FormField>
                  </>
                )}
              </>
            ) : (
              <>
                {identifierField}
                {passwordField}
              </>
            )}

              <button
                id="auth-submit"
                type="submit"
                disabled={submitting}
                aria-busy={submitting}
                className={`brand-button flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm ${tab === "signup" ? "sm:col-span-2" : ""}`}
              >
                <LoadingContent loading={submitting} label="در حال بررسی">
                  {submitLabel}
                  <HiArrowLeft className="size-5" aria-hidden="true" />
                </LoadingContent>
              </button>
            </form>

            {tab === "login" && (loginView !== "code" || codeSent) && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                {loginView === "password" && (
                  <button type="button" className={authLinkButtonClassName} onClick={() => selectLoginView("forgot")}>
                    رمز عبور را فراموش کرده‌ام
                  </button>
                )}
                {loginView === "forgot" && (
                  <button type="button" className={authLinkButtonClassName} onClick={() => selectLoginView("password")}>
                    بازگشت به ورود
                  </button>
                )}
                {loginView === "forgot" && codeSent && (
                  <button
                    type="button"
                    className={authLinkButtonClassName}
                    disabled={submitting}
                    onClick={() => {
                      setCodeSent(false);
                      setCode("");
                      resetMessages();
                      focusField("auth-identifier");
                    }}
                  >
                    {recoveryChannel === "email" ? "تغییر ایمیل یا ارسال دوباره کد" : "تغییر شماره یا ارسال دوباره کد"}
                  </button>
                )}
                {loginView === "code" && codeSent && (
                  <button
                    type="button"
                    className={authLinkButtonClassName}
                    disabled={submitting}
                    onClick={() => {
                      setCodeSent(false);
                      setCode("");
                      resetMessages();
                    }}
                  >
                    تغییر شماره یا ارسال دوباره کد
                  </button>
                )}
              </div>
            )}

            <p className="mt-6 border-t border-border pt-5 text-center text-sm text-muted-foreground">
              {tab === "login" ? (
                <>
                  حساب کاربری نداری؟{" "}
                  <button type="button" className={authLinkButtonClassName} onClick={() => selectTab("signup")}>
                    ساخت حساب جدید
                  </button>
                </>
              ) : (
                <>
                  قبلاً حساب ساخته‌ای؟{" "}
                  <button type="button" className={authLinkButtonClassName} onClick={() => selectTab("login")}>
                    ورود به حساب
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        <AuthBrandPanel />
      </div>
    </Modal>
  );
}

/** Shown when SMS is on: sign in with a password or with a texted code. */
const loginMethods: readonly SegmentedOption<"password" | "code">[] = [
  { value: "password", label: "با رمز عبور", icon: HiLockClosed },
  { value: "code", label: "با کد پیامکی", icon: HiChatAlt },
];

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
