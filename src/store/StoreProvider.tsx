"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Provider } from "react-redux";
import { makeStore, AppStore } from ".";
import { loadMe } from "./authSlice";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(makeStore);
  const pathname = usePathname();
  const nonLandingCheckStarted = useRef(false);

  useEffect(() => {
    if (pathname === "/" || nonLandingCheckStarted.current) return;
    nonLandingCheckStarted.current = true;

    const hasStoredSession =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("refreshToken");

    if (hasStoredSession && store.getState().auth.status !== "authenticated") {
      void store.dispatch(loadMe());
    }
  }, [pathname, store]);

  return <Provider store={store}>{children}</Provider>;
}
