"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from ".";
import { loadMe } from "./authSlice";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(makeStore);

  useEffect(() => {
    store.dispatch(loadMe());
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
