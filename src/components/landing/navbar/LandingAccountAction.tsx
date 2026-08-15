"use client";

import Link from "next/link";
import { HiChevronLeft } from "react-icons/hi";
import AuthModalButton from "@/components/auth/AuthModalButton";
import type { UserRole } from "@/lib/auth";
import { dashboardRouteForRole } from "@/lib/authFlow";
import { useAppSelector } from "@/store/hooks";

const roleLabels: Record<UserRole, string> = {
  student: "زبان‌آموز",
  teacher: "مدرس",
  admin: "مدیر",
};

type LandingAccountActionProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

export default function LandingAccountAction({
  mobile = false,
  onNavigate,
}: LandingAccountActionProps) {
  const { user, status } = useAppSelector((state) => state.auth);

  if (status === "authenticated" && user) {
    const displayName = user.full_name.trim() || user.email.split("@")[0];
    const roleLabel = roleLabels[user.role];

    return (
      <Link
        href={dashboardRouteForRole(user.role)}
        onClick={onNavigate}
        aria-label={`${displayName}، نقش ${roleLabel}؛ رفتن به داشبورد`}
        className={`group items-center gap-3 rounded-2xl border border-border bg-card text-start shadow-[var(--shadow-brand-sm)] hover:border-brand-accent hover:bg-accent-soft ${
          mobile
            ? "mt-5 flex w-full p-3"
            : "hidden max-w-56 px-3 py-2 md:flex"
        }`}
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-primary text-sm font-black text-brand-accent">
          {displayName.slice(0, 1)}
        </span>
        <span className="min-w-0 flex-1">
          <strong className="block truncate text-sm font-black text-foreground">
            {displayName}
          </strong>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            نقش: {roleLabel}
          </span>
        </span>
        <HiChevronLeft
          className="size-4 shrink-0 text-muted-foreground group-hover:text-brand-secondary dark:group-hover:text-brand-accent"
          aria-hidden="true"
        />
      </Link>
    );
  }

  return (
    <AuthModalButton
      fullWidth={mobile}
      className={mobile ? "mt-5 min-h-12 rounded-xl" : "hidden cursor-pointer md:flex"}
      onOpened={onNavigate}
    >
      شروع یادگیری
    </AuthModalButton>
  );
}
