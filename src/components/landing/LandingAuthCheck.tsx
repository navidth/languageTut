"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { dashboardRouteForRole } from "@/lib/authFlow";
import { loadMe } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export const INITIAL_ROLE_REDIRECT_KEY = "examification:initial-role-redirect";

export default function LandingAuthCheck({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status, user } = useAppSelector((state) => state.auth);
  const checkStarted = useRef(false);
  const returningSession = useRef(false);
  const redirectStarted = useRef(false);

  useEffect(() => {
    if (checkStarted.current || status === "authenticated") return;
    checkStarted.current = true;

    const hasStoredSession = Boolean(
      localStorage.getItem("accessToken") || localStorage.getItem("refreshToken"),
    );
    if (hasStoredSession) {
      returningSession.current = true;
      void dispatch(loadMe());
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (
      !returningSession.current ||
      redirectStarted.current ||
      status !== "authenticated" ||
      !user ||
      sessionStorage.getItem(INITIAL_ROLE_REDIRECT_KEY)
    ) {
      return;
    }

    redirectStarted.current = true;
    sessionStorage.setItem(INITIAL_ROLE_REDIRECT_KEY, "1");
    router.push(dashboardRouteForRole(user.role));
  }, [router, status, user]);

  return children;
}
