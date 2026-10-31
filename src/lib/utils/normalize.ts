/** Converts Persian and Arabic-Indic digits to ASCII digits. */
export function toLatinDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660));
}

/**
 * Returns the number in the `09123456789` form the API expects, or `null`
 * when it is not an Iranian mobile number. Spaces and a +98 prefix are fine.
 */
export function normalizeIranianMobile(value: string) {
  const digits = toLatinDigits(value).replace(/[\s()-]/g, "");
  const local = digits.replace(/^(?:\+98|0098|98|0)?(?=9\d{9}$)/, "0");
  return /^09\d{9}$/.test(local) ? local : null;
}

/** Persian or Arabic digits become Latin; spaces, dashes and other text drop out. */
export function normalizeCode(raw: string, maxLength = 8) {
  return toLatinDigits(raw).replace(/\D/g, "").slice(0, maxLength);
}
