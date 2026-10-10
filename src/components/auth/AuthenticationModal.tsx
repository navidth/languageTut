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
import { HiChatAlt, HiDeviceMobile, HiEye, HiEyeOff, HiLockClosed, HiMail, HiUser } from "react-icons/hi";
import {
  authApi,
  normalizeIranianMobile,
  toLatinDigits,
  type User,
} from "@/lib/auth";
import { getApiErrorMessage } from "@/lib/apiErrors";
import type { AuthenticationMode } from "@/lib/authFlow";
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

type AuthenticationModalProps = {
  open: boolean;
  profileError: string;
  onClose: () => void;
  onAuthenticated: (user: User, mode: AuthenticationMode) => void;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const codePattern = /^\d{4,8}$/;
const inputClassName = "w-full rounded-2xl border border-border bg-secondary-soft/35 py-3.5 text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.55)] placeholder:text-muted-foreground/75 hover:border-brand-secondary/45 focus:border-brand-accent focus:bg-card focus:ring-4 focus:ring-accent-soft dark:shadow-none";
const linkButtonClassName = "brand-link text-sm font-bold";

const MOBILE_ERROR = "شماره موبایل معتبر نیست. نمونه درست: ۰۹۱۲۳۴۵۶۷۸۹";

/** Heading and lead for each screen; recovery copy depends on SMS being on. */
function screenCopy(screen: "signup" | LoginView, smsEnabled: boolean): [string, string] {
  switch (screen) {
    case "signup":
      return ["حسابت را بساز", "فقط چند قدم تا شروع مسیر یادگیری شخصی تو باقی مانده است."];
    case "code":
      return ["خوش برگشتی!", "کد یک‌بار مصرف به شماره موبایلت پیامک می‌شود."];
    case "forgot":
      return smsEnabled
        ? ["بازیابی رمز عبور", "ایمیل یا شماره موبایل حسابت را وارد کن تا لینک یا کد بازیابی برایت فرستاده شود."]
        : ["بازیابی رمز عبور", "ایمیل حسابت را وارد کن تا لینک تغییر رمز عبور برایت فرستاده شود."];
    default:
      return ["خوش برگشتی!", "با ایمیل یا شماره موبایل و رمز عبورت وارد شو."];
  }
}

export default function AuthenticationModal({
  open,
  profileError,
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

  useEffect(() => {
    if (!open) return;
    setTab("login");
    setLoginView("password");
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
  }, [open, profileError]);

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

  function selectLoginView(nextView: LoginView) {
    if (submitting) return;
    setLoginView(nextView);
    setCodeSent(false);
    setCode("");
    setPassword("");
    resetMessages();
    window.setTimeout(() => firstInputRef.current?.focus(), 0);
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

  async function submitForgot() {
    const errors: FieldErrors = {};
    // Without SMS the only recovery channel is email.
    const account = smsEnabled
      ? parseIdentifier(errors)
      : emailPattern.test(identifier.trim())
        ? { email: identifier.trim() }
        : null;
    if (!smsEnabled && !account) errors.identifier = "یک ایمیل معتبر وارد کنید.";
    if (codeSent) {
      if (!codePattern.test(toLatinDigits(code.trim()))) errors.code = "کد پیامک‌شده را وارد کنید.";
      validatePassword(errors, "newPassword", true);
    }
    setFieldErrors(errors);
    if (!account || Object.keys(errors).length) return;

    if ("email" in account) {
      await authApi.requestPasswordReset(account.email);
      setNotice("اگر حسابی با این ایمیل وجود داشته باشد، لینک تغییر رمز عبور برایش ارسال شد.");
      return;
    }
    if (!codeSent) {
      await authApi.requestSmsPasswordReset(account.phone_number);
      setCodeSent(true);
      setNotice("اگر این شماره حساب داشته باشد، کد بازیابی برایش پیامک شد.");
      return;
    }
    await authApi.confirmSmsPasswordReset({
      phone_number: account.phone_number,
      code: toLatinDigits(code.trim()),
      new_password: confirmPassword,
    });
    setLoginView("password");
    setCodeSent(false);
    setCode("");
    setConfirmPassword("");
    setNotice("رمز عبور تغییر کرد. با رمز جدید وارد شوید.");
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

  const [heading, subheading] = screenCopy(tab === "signup" ? "signup" : loginView, smsEnabled);
  const submitLabel = submitting
    ? "در حال بررسی..."
    : tab === "signup"
      ? "ساخت حساب و ادامه"
      : loginView === "password"
        ? "ورود و ادامه"
        : loginView === "code"
          ? codeSent ? "ورود و ادامه" : "ارسال کد ورود"
          : !smsEnabled
            ? "ارسال لینک بازیابی"
            : codeSent ? "تغییر رمز عبور" : "ارسال لینک یا کد بازیابی";
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
        className={`${inputClassName} pe-11 ps-12 text-left`}
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
        className={`${inputClassName} pe-4 ps-11 text-left`}
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
        className={`${inputClassName} pe-4 ps-11 text-left`}
        placeholder={emailOnlyIdentifier ? "name@example.com" : "name@example.com / 09123456789"}
      />
    </FormField>
  );

  const codeField = (
    <FormField id="auth-code" label="کد پیامک‌شده" icon={HiChatAlt} error={fieldErrors.code}>
      <input
        id="auth-code"
        lang="en"
        dir="ltr"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        autoComplete="one-time-code"
        inputMode="numeric"
        aria-invalid={Boolean(fieldErrors.code)}
        aria-describedby={fieldErrors.code ? "auth-code-error" : undefined}
        className={`${inputClassName} pe-4 ps-11 text-left tracking-[0.3em]`}
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
              {heading}
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{subheading}</p>
          </div>

          {tab === "login" && smsEnabled && loginView !== "forgot" && (
            <LoginMethodSwitch
              value={loginView}
              disabled={submitting}
              onChange={selectLoginView}
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
                    className={`${inputClassName} pe-4 ps-11`}
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
                    className={`${inputClassName} pe-4 ps-11 text-left`}
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
                    className={`${inputClassName} pe-11 ps-12 text-left`}
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
                    <FormField id="auth-new-password" label="رمز عبور جدید" icon={HiLockClosed} error={fieldErrors.newPassword}>
                      <input
                        id="auth-new-password"
                        lang="en"
                        dir="ltr"
                        type={passwordVisible ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        autoComplete="new-password"
                        aria-invalid={Boolean(fieldErrors.newPassword)}
                        aria-describedby={fieldErrors.newPassword ? "auth-new-password-error" : undefined}
                        className={`${inputClassName} pe-11 ps-12 text-left`}
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
              type="submit"
              disabled={submitting}
              className={`brand-button flex min-h-13 w-full items-center justify-center rounded-2xl px-5 py-3.5 text-sm ${tab === "signup" ? "sm:col-span-2" : ""}`}
            >
              {submitting && <Spinner size="sm" className="ms-2" aria-hidden="true" />}
              {submitLabel}
            </button>
          </form>

          {tab === "login" && (loginView !== "code" || codeSent) && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              {loginView === "password" && (
                <button type="button" className={linkButtonClassName} onClick={() => selectLoginView("forgot")}>
                  رمز عبور را فراموش کرده‌ام
                </button>
              )}
              {loginView === "forgot" && (
                <button type="button" className={linkButtonClassName} onClick={() => selectLoginView("password")}>
                  بازگشت به ورود
                </button>
              )}
              {loginView === "code" && codeSent && (
                <button
                  type="button"
                  className={linkButtonClassName}
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
        </div>
      </ModalBody>
    </Modal>
  );
}

const loginMethods: { value: "password" | "code"; label: string; icon: typeof HiUser }[] = [
  { value: "password", label: "با رمز عبور", icon: HiLockClosed },
  { value: "code", label: "با کد پیامکی", icon: HiChatAlt },
];

/** Segmented choice between password and SMS-code login, shown when SMS is on. */
function LoginMethodSwitch({
  value,
  disabled,
  onChange,
}: {
  value: LoginView;
  disabled: boolean;
  onChange: (method: "password" | "code") => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="روش ورود"
      className="mb-5 grid grid-cols-2 gap-1 rounded-2xl border border-border bg-secondary-soft/45 p-1"
    >
      {loginMethods.map(({ value: method, label, icon: Icon }) => {
        const selected = value === method;
        return (
          <button
            key={method}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => !selected && onChange(method)}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition-colors ${
              selected
                ? "bg-card text-foreground shadow-(--shadow-brand-sm)"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon
              className={`size-4 ${selected ? "text-brand-secondary dark:text-brand-accent" : ""}`}
              aria-hidden="true"
            />
            {label}
          </button>
        );
      })}
    </div>
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
