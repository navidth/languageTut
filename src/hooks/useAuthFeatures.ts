"use client";

import { useEffect } from "react";
import { fetchAuthFeatures, selectSmsEnabled } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

/** Loads `/api/auth/features/` once (cached in the store) and reports it. */
export function useAuthFeatures() {
  const dispatch = useAppDispatch();
  const smsEnabled = useAppSelector(selectSmsEnabled);
  const loading = useAppSelector(
    (state) => state.auth.features === null && state.auth.featuresStatus !== "failed",
  );

  useEffect(() => {
    void dispatch(fetchAuthFeatures());
  }, [dispatch]);

  return { smsEnabled, loading };
}
