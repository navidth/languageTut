import type { Metadata } from "next";
import ResetPasswordPage from "@/components/auth/ResetPasswordPage";

export const metadata: Metadata = {
  title: "تعیین رمز عبور جدید",
  robots: { index: false, follow: false },
  // The URL carries a reset token, so it must not leak through the Referer header.
  referrer: "no-referrer",
};

type Props = {
  params: Promise<{ link?: string[] }>;
  searchParams: Promise<{ uid?: string | string[]; token?: string | string[] }>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Landing page for the link in a password reset email. It accepts both
 * `/reset-password?uid=…&token=…` and `/reset-password/<uid>/<token>`, the
 * two shapes Django-style reset links take.
 */
export default async function ResetPasswordRoute({ params, searchParams }: Props) {
  const [{ link = [] }, query] = await Promise.all([params, searchParams]);
  const uid = first(query.uid) ?? link[0] ?? "";
  const token = first(query.token) ?? link[1] ?? "";

  return <ResetPasswordPage uid={uid} token={token} />;
}
