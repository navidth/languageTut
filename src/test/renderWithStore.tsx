import type { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import type { User } from "@/types/auth";
import { makeStore, type AppStore } from "@/store";
import { login } from "@/store/authSlice";

export const testStudent: User = {
  id: 7,
  email: "student@example.com",
  full_name: "دانش‌آموز آزمایشی",
  role: "student",
  current_level: "A2",
  date_joined: "2026-01-01T00:00:00Z",
};

type RenderWithStoreOptions = Omit<RenderOptions, "wrapper"> & {
  /** Starts the store from a signed-in session for this user. */
  user?: User | null;
  store?: AppStore;
};

/** Renders a component inside a real application store. */
export function renderWithStore(
  ui: ReactElement,
  { user = null, store = makeStore(), ...options }: RenderWithStoreOptions = {},
) {
  if (user) {
    store.dispatch(
      login.fulfilled(user, "test", { email: user.email, password: "" }),
    );
  }

  return {
    store,
    ...render(<Provider store={store}>{ui}</Provider>, options),
  };
}
