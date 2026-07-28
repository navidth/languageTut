"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/lib/auth";
import { loadMe } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const dashboardPath = (role: UserRole) => {
  if (role === "teacher") return "/teacher";
  if (role === "student") return "/student";
  return null;
};

export default function LandingAuthCheck({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const checkStarted = useRef(false);
  const { status, user } = useAppSelector((state) => state.auth);
  const destination = user ? dashboardPath(user.role) : null;

  useEffect(() => {
    if (checkStarted.current) return;
    checkStarted.current = true;
    void dispatch(loadMe());
  }, [dispatch]);

  useEffect(() => {
    if (status === "authenticated" && destination) {
      router.replace(destination);
    }
  }, [destination, router, status]);

  if (status === "idle" || status === "loading" || destination) {
    return (
      <div
        className="flex min-h-[60vh] items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <span
            className="size-9 animate-spin rounded-full border-4 border-primary/20 border-t-primary"
            aria-hidden="true"
          />
          <span>در حال بررسی وضعیت ورود...</span>
        </div>
      </div>
    );
  }

  return children;
}
