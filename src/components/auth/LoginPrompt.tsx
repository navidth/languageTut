"use client";

import { HiLockClosed } from "react-icons/hi";
import { LoadingContent } from "@/components/ui/PulseLoader";
import { useAuthFlow } from "./AuthFlowProvider";

type LoginPromptProps = {
  message: string;
  className?: string;
};

/** Explains that a section needs a signed-in user and opens the login flow. */
export default function LoginPrompt({ message, className = "" }: LoginPromptProps) {
  const { startAuthFlow, busy } = useAuthFlow();

  return (
    <div
      className={`rounded-2xl border border-border bg-card p-8 text-center ${className}`}
    >
      <HiLockClosed
        className="mx-auto size-8 text-brand-accent"
        aria-hidden="true"
      />
      <p className="mt-4 font-bold leading-8">{message}</p>
      <button
        type="button"
        disabled={busy}
        aria-busy={busy}
        onClick={() => void startAuthFlow("learning")}
        className="brand-button mt-5 rounded-xl px-5 py-2.5 text-sm"
      >
        <LoadingContent loading={busy} label="در حال بررسی">
          ورود به حساب کاربری
        </LoadingContent>
      </button>
    </div>
  );
}
