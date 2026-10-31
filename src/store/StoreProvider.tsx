"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Provider } from "react-redux";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, SESSION_EXPIRED_EVENT } from "@/constants/storage";
import { hasStoredSession } from "@/lib/services/apiClient";
import { makeStore, AppStore } from ".";
import { loadMe, logout } from "@/store/authSlice";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(makeStore);
  const pathname = usePathname();
  const nonLandingCheckStarted = useRef(false);

  useEffect(() => {
    if (pathname === "/" || nonLandingCheckStarted.current) return;
    nonLandingCheckStarted.current = true;

    if (hasStoredSession() && store.getState().auth.status !== "authenticated") {
      void store.dispatch(loadMe());
    }
  }, [pathname, store]);

  // Keeps the store in step with the stored tokens: the API client drops them
  // when the server rejects the refresh token, and another tab may sign out.
  useEffect(() => {
    const signOutLocally = () => {
      if (store.getState().auth.status !== "idle") store.dispatch(logout());
    };
    const onStorage = (event: StorageEvent) => {
      const tokenChanged =
        event.key === null || event.key === ACCESS_TOKEN_KEY || event.key === REFRESH_TOKEN_KEY;
      if (tokenChanged && !hasStoredSession()) signOutLocally();
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, signOutLocally);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, signOutLocally);
      window.removeEventListener("storage", onStorage);
    };
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
