"use client";

import { OTPInput, type SlotProps } from "input-otp";
import { normalizeCode } from "@/lib/utils/normalize";

export type OtpInputProps = {
  /** Id of the real input, for `<label htmlFor>`. */
  id: string;
  /** Number of boxes. */
  length: number;
  value: string;
  /** Receives Latin digits only. */
  onValueChange: (value: string) => void;
  /** Called when the last box is filled, e.g. to move to the next field. */
  onComplete?: (code: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  "aria-describedby"?: string;
  className?: string;
};

/**
 * A one-time code entered into separate boxes, filled left to right with the
 * caret moving on by itself. It is built on `input-otp`, so a single real
 * input sits behind the boxes: the phone's code suggestion, pasting, password
 * managers and screen readers all work as with a normal field.
 *
 * Every keystroke and paste goes through `normalizeCode`, so Persian or Arabic
 * digits typed on a Persian keyboard are accepted, and a pasted "123-456" or
 * "123 456" keeps all its digits.
 */
export default function OtpInput({
  id,
  length,
  value,
  onValueChange,
  onComplete,
  invalid = false,
  disabled = false,
  className = "",
  ...aria
}: OtpInputProps) {
  return (
    // The code reads left to right even on this right-to-left page.
    <div dir="ltr" className={className}>
      <OTPInput
        id={id}
        maxLength={length}
        value={value}
        // No `pattern`: input-otp tests it before our normalising, and its
        // digit pattern would reject Persian digits.
        onChange={(next) => onValueChange(normalizeCode(next, length))}
        pasteTransformer={(pasted) => normalizeCode(pasted, length)}
        onComplete={(code: string) => onComplete?.(code)}
        inputMode="numeric"
        autoComplete="one-time-code"
        disabled={disabled}
        aria-invalid={invalid || undefined}
        pushPasswordManagerStrategy="none"
        containerClassName="flex items-center justify-center gap-2 has-disabled:opacity-60 sm:gap-2.5"
        render={({ slots }) => (
          <>
            {slots.map((slot, index) => (
              <Slot key={index} {...slot} invalid={invalid} />
            ))}
          </>
        )}
        {...aria}
      />
    </div>
  );
}

// Focus uses a ring. An error turns the border red, which needs `!`: the
// global `* { border-color }` rule in globals.css beats border colour
// utilities.
function Slot({ char, isActive, hasFakeCaret, invalid }: SlotProps & { invalid: boolean }) {
  return (
    <div
      data-active={isActive || undefined}
      data-invalid={invalid || undefined}
      className={`relative grid aspect-square min-w-0 max-w-12 flex-1 place-items-center rounded-xl border text-lg font-black text-foreground transition-[box-shadow,background-color,border-color] duration-150 sm:max-w-13 sm:text-xl ${
        char || isActive ? "bg-card" : "bg-secondary-soft/35"
      } ${invalid ? "border-destructive!" : ""} ${
        isActive
          ? invalid
            ? "ring-4 ring-destructive/15"
            : "ring-2 ring-brand-accent shadow-[0_0_0_6px_var(--accent-soft)]"
          : ""
      }`}
    >
      {char}
      {hasFakeCaret && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="h-6 w-0.5 animate-caret-blink rounded-full bg-brand-accent" />
        </span>
      )}
    </div>
  );
}
