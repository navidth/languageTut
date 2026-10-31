import type { CurrentLevel } from "@/types/level";

export type UserRole = "student" | "teacher" | "admin";

export type User = {
  id: number;
  email: string;
  email_verified?: boolean;
  phone_number?: string | null;
  phone_verified?: boolean;
  full_name: string;
  role: UserRole;
  current_level?: CurrentLevel | null;
  date_joined: string;
};

/** Password login takes either an email or a phone number. */
export type LoginRequest =
  | { email: string; phone_number?: never; password: string }
  | { phone_number: string; email?: never; password: string };

export type PhoneLoginRequest = {
  phone_number: string;
  code: string;
};

export type AuthResponse = {
  access: string;
  refresh: string;
  user: User;
};

export type RegisterRequest = {
  email: string;
  phone_number: string;
  password: string;
  full_name: string;
};

export type RegisterResponse = {
  id: number;
  email: string;
  phone_number: string;
  full_name: string;
  current_level?: CurrentLevel | null;
};

/** Optional account features the backend has switched on. */
export type AuthFeatures = {
  sms_enabled: boolean;
};

export type SmsPasswordResetConfirmRequest = {
  phone_number: string;
  code: string;
  new_password: string;
};

export type EmailPasswordResetConfirmRequest = {
  email: string;
  /** 4 to 8 digits. */
  code: string;
  /** At least 8 characters. */
  new_password: string;
};

/** The `uid` and `token` come from the link in a password reset email. */
export type PasswordResetConfirmRequest = {
  uid: string;
  token: string;
  /** At least 8 characters. */
  new_password: string;
};

/**
 * Body of `PUT /api/auth/me/`, which replaces every editable field.
 * Role, level and the verified flags are read-only there.
 */
export type UserRequest = {
  email: string;
  phone_number: string;
  /** At most 255 characters. */
  full_name: string;
  /** Required when changing email or phone number. */
  current_password?: string;
};

/** Body of `PATCH /api/auth/me/`: only the fields being changed. */
export type PatchedUserRequest = Partial<UserRequest>;

export type AuthIntent = "learning" | "placement";

export type AuthenticationMode = "login" | "signup";

/** The screen the sign-in dialog opens on. */
export type AuthDialogView = "password" | "forgot";

/**
 * - `unknown`: not hydrated yet, so the stored tokens have not been read.
 * - `restoring`: tokens exist and the profile is being loaded from them.
 * - `authenticated`: a signed-in user is available.
 * - `anonymous`: nobody is signed in.
 */
export type SessionState =
  | "unknown"
  | "restoring"
  | "authenticated"
  | "anonymous";

export type AuthTab = AuthenticationMode;

/** Login sub-views: password login, SMS-code login and password recovery. */
export type LoginView = "password" | "code" | "forgot";

export type AuthFieldName =
  | "fullName"
  | "identifier"
  | "email"
  | "phone"
  | "password"
  | "confirmPassword"
  | "code"
  | "newPassword";

export type AuthFieldErrors = Partial<Record<AuthFieldName, string>>;

/** Where a recovery code goes: email always works, SMS only when it is on. */
export type RecoveryChannel = "email" | "sms";

export type AuthFlowOptions = {
  /** Opens the dialog on this screen when it has to ask for sign-in. */
  view?: AuthDialogView;
};

export type AuthFlowContextValue = {
  startAuthFlow: (intent?: AuthIntent, options?: AuthFlowOptions) => Promise<void>;
  busy: boolean;
};

export type ResetPasswordStage = "form" | "done" | "invalid";

export type ProfileForm = {
  full_name: string;
  email: string;
  phone_number: string;
  current_password: string;
};

/** Keys match the API field names, so server errors land on the right input. */
export type ProfileFieldKey = keyof ProfileForm;

export type ProfileFieldErrors = Partial<Record<ProfileFieldKey, string>>;
