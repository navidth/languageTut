"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { hasStoredSession } from "@/lib/services/apiClient";
import { dashboardRouteForRole } from "@/lib/utils/authFlow";
import { loadMe } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { INITIAL_ROLE_REDIRECT_KEY } from "@/constants/storage";

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

    if (hasStoredSession()) {
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
