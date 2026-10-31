"use client";

import Link from "next/link";
import { HiChevronLeft } from "react-icons/hi";
import AuthModalButton from "@/components/auth/AuthModalButton";
import { dashboardRouteForRole } from "@/lib/utils/authFlow";
import { useAppSelector } from "@/store/hooks";
import { ROLE_LABELS } from "@/constants/auth";

// Below md the header is narrow, so this shows only the avatar or a compact
// button; from md up it shows the full account card.
export default function LandingAccountAction() {
  const { user, status } = useAppSelector((state) => state.auth);

  if (status === "authenticated" && user) {
    const displayName = user.full_name.trim() || user.email.split("@")[0];
    const roleLabel = ROLE_LABELS[user.role];

    return (
      <Link
        href={dashboardRouteForRole(user.role)}
        aria-label={`${displayName}، نقش ${roleLabel}؛ رفتن به داشبورد`}
        className="group flex shrink-0 items-center gap-3 rounded-xl text-start md:max-w-56 md:rounded-2xl md:border md:border-border md:bg-card md:px-3 md:py-2 md:shadow-[var(--shadow-brand-sm)] md:hover:border-brand-accent md:hover:bg-accent-soft"
      >
        <span className="flex items-center justify-center flex-col size-10 rounded-xl  border-brand-background border font-black text-brand-secondary dark:ring-white/15 dark:text-accent">
          {displayName.slice(0, 1)}
        </span>
        <span className="hidden min-w-0 flex-1 md:block">
          <strong className="block truncate text-sm font-black text-foreground">
            {displayName}
          </strong>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            نقش: {roleLabel}
          </span>
        </span>
        <HiChevronLeft
          className="hidden size-4 shrink-0 text-muted-foreground group-hover:text-brand-secondary md:block dark:group-hover:text-brand-accent"
          aria-hidden="true"
        />
      </Link>
    );
  }

  return (
    <AuthModalButton className="h-9 cursor-pointer px-3 sm:px-4 md:h-10 md:px-5">
      شروع یادگیری
    </AuthModalButton>
  );
}
