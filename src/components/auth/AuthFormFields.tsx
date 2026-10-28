import type { IconType } from "react-icons";
import { HiEye, HiEyeOff } from "react-icons/hi";

// Form pieces shared by the sign-in dialog and the password reset page.

// The ring and border mark focus, so the global focus outline steps aside.
export const authInputClassName =
  "w-full rounded-2xl border border-border bg-secondary-soft/35 py-3.5 text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.55)] placeholder:text-muted-foreground/75 hover:border-brand-secondary/45 focus:border-brand-accent focus:bg-card focus:ring-4 focus:ring-accent-soft focus-visible:outline-none dark:shadow-none";

export const authLinkButtonClassName = "brand-link text-sm font-bold";

/** The `aria-describedby` value for a field: its error, else its hint. */
export function fieldDescription(id: string, error?: string, hint?: string) {
  if (error) return `${id}-error`;
  return hint ? `${id}-hint` : undefined;
}

export function FormField({
  id,
  label,
  icon: Icon,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  /** Drawn inside the input's start edge; leave out for controls such as code boxes. */
  icon?: IconType;
  error?: string;
  /** Shown under the field while it has no error. */
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-sm font-bold text-foreground/90">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute start-3.5 top-1/2 z-10 size-5 -translate-y-1/2 text-brand-secondary/75 dark:text-brand-accent" aria-hidden="true" />
        )}
        {children}
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function PasswordToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
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
