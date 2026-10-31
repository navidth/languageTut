"use client";

import type { InputHTMLAttributes } from "react";
import { normalizeCode } from "@/lib/utils/normalize";

export type CodeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "inputMode" | "maxLength"
> & {
  value: string;
  /** Receives Latin digits only. */
  onValueChange: (value: string) => void;
  /** The backend accepts codes of 4 to 8 digits. */
  maxLength?: number;
  /** Called once the code reaches `completeLength` digits. */
  onComplete?: (value: string) => void;
  completeLength?: number;
};

/**
 * One field for an emailed or texted code. A row of fixed boxes would break
 * when the code length changes, since the API allows 4 to 8 digits. What it
 * adds over a plain input: typed or pasted Persian digits, spaces and dashes
 * are cleaned as they arrive, the length is capped, and the phone keyboard
 * offers the code from the message.
 */
export default function CodeInput({
  value,
  onValueChange,
  maxLength = 8,
  onComplete,
  completeLength,
  className = "",
  ...props
}: CodeInputProps) {
  return (
    <input
      {...props}
      type="text"
      lang="en"
      dir="ltr"
      inputMode="numeric"
      autoComplete="one-time-code"
      enterKeyHint="done"
      spellCheck={false}
      value={value}
      onChange={(event) => {
        const next = normalizeCode(event.target.value, maxLength);
        onValueChange(next);
        if (completeLength && next.length === completeLength && next !== value) onComplete?.(next);
      }}
      className={`tabular-nums ${className}`}
    />
  );
}
